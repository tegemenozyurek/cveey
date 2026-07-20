import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { collection, doc, getDoc } from 'firebase/firestore'
import { auth, db, storage } from './firebase'
import {
  buildCvStoragePath,
  clearActiveFileId,
  createCvFileRecord,
  deleteAllCvFileRecords,
  deleteCvFileRecord,
  getActiveFileId,
  getCvFileRecord,
  listCvFileRecords,
  normalizeStoragePath,
  pruneLegacyUserFields,
  readLegacyMigrationData,
  resolveFilePath,
  resolveLegacyDisplayName,
  setActiveFileId,
  storageNameFromPath,
  updateCvFileDisplayName,
} from './cvFileService'
import { extractTextFromPdf } from './cvTextService'
import { getCvBlob, releasePreviewUrl } from './cvPreviewCache'

export const MAX_CV_COUNT = 5

const cvCache = new Map()

export function invalidateCvCache(uid) {
  if (uid) cvCache.delete(uid)
  else cvCache.clear()
}

async function fetchStorageUrl(filePath) {
  return getDownloadURL(ref(storage, normalizeStoragePath(filePath)))
}

async function enrichCvRecord(record) {
  try {
    const [url, metadata] = await Promise.all([
      fetchStorageUrl(record.filePath),
      getMetadata(ref(storage, record.filePath)).catch(() => null),
    ])

    return {
      ...record,
      url,
      size: metadata?.size ?? 0,
      updated: metadata?.updated ?? new Date().toISOString(),
    }
  } catch (err) {
    console.warn('Skipping CV with missing storage object:', record.filePath, err)
    return null
  }
}

async function syncStorageWithFirestore(uid) {
  let records = []
  let listing = { items: [] }
  let legacy = { legacyNames: {}, legacyActivePath: null }

  try {
    records = await listCvFileRecords(uid)
  } catch (err) {
    console.error('Could not list CV file records:', err)
    throw err
  }

  try {
    listing = await listAll(ref(storage, `users/${uid}`))
  } catch (err) {
    console.warn('Could not list storage CVs:', err)
  }

  try {
    legacy = await readLegacyMigrationData(uid)
  } catch (err) {
    console.warn('Could not read legacy CV metadata:', err)
  }

  const recordsByPath = new Map(records.map((record) => [record.filePath, record]))
  const storagePaths = new Set()

  for (const item of listing.items) {
    const filePath = normalizeStoragePath(item.fullPath)
    storagePaths.add(filePath)

    if (recordsByPath.has(filePath)) continue

    try {
      const metadata = await getMetadata(item)
      const displayName = resolveLegacyDisplayName(
        filePath,
        item.name,
        metadata.customMetadata?.originalFileName,
        legacy.legacyNames,
      )

      const created = await createCvFileRecord(uid, {
        displayName,
        storageObject: item.name,
      })
      recordsByPath.set(created.filePath, created)
    } catch (err) {
      console.warn('Could not migrate storage CV:', filePath, err)
    }
  }

  for (const record of [...recordsByPath.values()]) {
    if (storagePaths.size > 0 && !storagePaths.has(record.filePath)) {
      try {
        await deleteCvFileRecord(uid, record.id)
        recordsByPath.delete(record.filePath)
      } catch (err) {
        console.warn('Could not remove orphan CV record:', record.id, err)
      }
    }
  }

  const syncedRecords = [...recordsByPath.values()]

  if (legacy.legacyActivePath && syncedRecords.length > 0) {
    try {
      const activeFileId = await getActiveFileId(uid)
      if (!activeFileId) {
        const match = syncedRecords.find((record) => record.filePath === legacy.legacyActivePath)
        if (match) await setActiveFileId(uid, match.id)
      }
    } catch (err) {
      console.warn('Could not restore legacy active CV:', err)
    }
  }

  await pruneLegacyUserFields(uid)
  return syncedRecords
}

async function listUserCvRecords(uid) {
  const records = await syncStorageWithFirestore(uid)
  const enriched = await Promise.all(records.map((record) => enrichCvRecord(record)))
  return enriched.filter(Boolean)
}

export async function getUserCvs(uid, { force = false } = {}) {
  if (!force && cvCache.has(uid)) {
    return cvCache.get(uid)
  }

  const cvs = await listUserCvRecords(uid)
  let activeFileId = null

  try {
    activeFileId = await getActiveFileId(uid)
  } catch (err) {
    console.warn('Could not read active CV id:', err)
  }

  cvs.sort((a, b) => new Date(b.updated) - new Date(a.updated))

  let resolvedActiveFileId = activeFileId
  if (cvs.length === 0) {
    resolvedActiveFileId = null
    try {
      if (activeFileId) await clearActiveFileId(uid)
    } catch (err) {
      console.warn('Could not clear active CV id:', err)
    }
  } else if (!activeFileId || !cvs.some((cv) => cv.id === activeFileId)) {
    resolvedActiveFileId = cvs[0].id
    try {
      await setActiveFileId(uid, resolvedActiveFileId)
    } catch (err) {
      console.warn('Could not set active CV id:', err)
    }
  }

  const activeCv = cvs.find((cv) => cv.id === resolvedActiveFileId) ?? null

  const data = {
    cvs,
    activeFileId: resolvedActiveFileId,
    activeCvPath: activeCv?.filePath ?? null,
    activeCv,
  }

  cvCache.set(uid, data)
  return data
}

export async function uploadCv(uid, file, onProgress) {
  const { cvs } = await getUserCvs(uid)

  if (cvs.length >= MAX_CV_COUNT) {
    const err = new Error('MAX_CV_COUNT')
    err.code = 'MAX_CV_COUNT'
    throw err
  }

  const fileRef = doc(collection(db, 'users', uid, 'files'))
  const fileId = fileRef.id
  const filePath = buildCvStoragePath(uid, fileId)
  const storageRef = ref(storage, filePath)

  const uploadPromise = new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
    })

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      reject,
      resolve,
    )
  })

  const textPromise = extractTextFromPdf(file).catch((err) => {
    console.warn('CV text extraction failed:', err)
    return ''
  })

  const [, extractedText] = await Promise.all([uploadPromise, textPromise])

  await createCvFileRecord(uid, {
    fileId,
    displayName: file.name,
    ...(extractedText ? { extractedText } : {}),
  })

  if (cvs.length === 0) {
    try {
      await setActiveFileId(uid, fileId)
    } catch (err) {
      console.warn('Could not set active CV after upload:', err)
    }
  }

  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function renameCv(uid, fileId, newName) {
  try {
    await updateCvFileDisplayName(uid, fileId, newName)
  } catch (err) {
    console.error('CV rename failed:', err)
    throw err
  }
  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function getCvDownloadUrl(filePath) {
  return fetchStorageUrl(filePath)
}

/**
 * Read-only active CV for another user's public profile.
 * Does not list all files, compact docs, or mutate activeFileId.
 */
export async function getPublicActiveCv(uid) {
  await ensureAuth()
  if (!uid) return null

  const activeFileId = await getActiveFileId(uid)
  if (!activeFileId) return null

  const snap = await getDoc(doc(db, 'users', uid, 'files', activeFileId))
  if (!snap.exists()) return null

  const data = snap.data()
  const filePath = resolveFilePath(uid, activeFileId, data)
  const displayName =
    (typeof data.displayName === 'string' && data.displayName) ||
    storageNameFromPath(filePath)

  let url = ''
  try {
    url = await fetchStorageUrl(filePath)
  } catch (err) {
    console.warn('Public active CV URL failed:', err)
  }

  return {
    id: activeFileId,
    fullPath: filePath,
    filePath,
    displayName,
    url,
  }
}

function sanitizeDownloadFileName(displayName) {
  const base = (displayName || 'cv').trim() || 'cv'
  const withExt = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
  return withExt.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
}

async function ensureAuth() {
  const user = auth.currentUser
  if (!user) {
    const err = new Error('NOT_AUTHENTICATED')
    err.code = 'auth/not-authenticated'
    throw err
  }

  await user.getIdToken()
  return user
}

function triggerBlobDownload(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

export async function downloadCvFile(filePath, displayName) {
  await ensureAuth()

  const fileName = sanitizeDownloadFileName(displayName)
  const blob = await getCvBlob(filePath)
  triggerBlobDownload(blob, fileName)
}

export async function deleteCv(uid, fileId) {
  const record = await getCvFileRecord(uid, fileId)
  if (!record) {
    invalidateCvCache(uid)
    return getUserCvs(uid, { force: true })
  }

  const activeFileId = await getActiveFileId(uid)
  const pathKey = normalizeStoragePath(record.filePath)

  try {
    await deleteObject(ref(storage, pathKey))
  } catch (err) {
    console.warn('Storage delete skipped:', pathKey, err)
  }
  releasePreviewUrl(pathKey)
  await deleteCvFileRecord(uid, fileId)

  if (activeFileId === fileId) {
    const remaining = (await listCvFileRecords(uid))
      .filter((cv) => cv.id !== fileId)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))

    if (remaining.length > 0) {
      await setActiveFileId(uid, remaining[0].id)
    } else {
      await clearActiveFileId(uid)
    }
  }

  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function activateCv(uid, fileId) {
  await setActiveFileId(uid, fileId)
  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function deleteUserStorageFiles(uid) {
  const userRef = ref(storage, `users/${uid}`)
  try {
    const listing = await listAll(userRef)
    await Promise.all(listing.items.map((item) => deleteObject(item)))
  } catch (err) {
    // Missing folder / empty storage is fine during account wipe.
    if (err?.code !== 'storage/object-not-found') {
      console.warn('Storage cleanup warning:', err)
    }
  }
  await deleteAllCvFileRecords(uid)
  try {
    await clearActiveFileId(uid)
  } catch {
    // User doc may already be gone or missing the field.
  }
  try {
    await pruneLegacyUserFields(uid)
  } catch {
    // Ignore legacy cleanup failures during wipe.
  }
  invalidateCvCache(uid)
}

export { buildCvStoragePath }
