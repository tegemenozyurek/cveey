import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { collection, doc } from 'firebase/firestore'
import { auth, db, storage } from './firebase'
import {
  clearActiveFileId,
  createCvFileRecord,
  deleteAllCvFileRecords,
  deleteCvFileRecord,
  getActiveFileId,
  getCvFileRecord,
  getLegacyActiveCvPath,
  getLegacyCvDisplayNames,
  listCvFileRecords,
  normalizeStoragePath,
  resolveLegacyDisplayName,
  setActiveFileId,
  updateCvFileDisplayName,
} from './cvFileService'
import { getCvBlob, releasePreviewUrl } from './cvPreviewCache'

export const MAX_CV_COUNT = 5

const cvCache = new Map()

export function invalidateCvCache(uid) {
  if (uid) cvCache.delete(uid)
  else cvCache.clear()
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function buildCvStoragePath(uid, fileId) {
  return `users/${uid}/${fileId}.pdf`
}

async function fetchStorageUrl(filePath) {
  return getDownloadURL(ref(storage, normalizeStoragePath(filePath)))
}

async function enrichCvRecord(record) {
  const [url, metadata] = await Promise.all([
    fetchStorageUrl(record.filePath),
    getMetadata(ref(storage, record.filePath)).catch(() => null),
  ])

  return {
    ...record,
    url,
    size: metadata?.size ?? record.size,
    updated: metadata?.updated ?? record.updated,
  }
}

async function syncStorageWithFirestore(uid) {
  const [records, listing, legacyNames, legacyActivePath] = await Promise.all([
    listCvFileRecords(uid),
    listAll(ref(storage, `users/${uid}`)),
    getLegacyCvDisplayNames(uid),
    getLegacyActiveCvPath(uid),
  ])

  const recordsByPath = new Map(records.map((record) => [record.filePath, record]))
  const storagePaths = new Set()

  for (const item of listing.items) {
    const filePath = normalizeStoragePath(item.fullPath)
    storagePaths.add(filePath)

    if (recordsByPath.has(filePath)) continue

    const metadata = await getMetadata(item)
    const displayName = resolveLegacyDisplayName(
      filePath,
      item.name,
      metadata.customMetadata?.originalFileName,
      legacyNames,
    )

    const created = await createCvFileRecord(uid, {
      filePath,
      displayName,
      size: metadata.size,
    })
    recordsByPath.set(filePath, created)
  }

  for (const record of recordsByPath.values()) {
    if (!storagePaths.has(record.filePath)) {
      await deleteCvFileRecord(uid, record.id)
      recordsByPath.delete(record.filePath)
    }
  }

  const syncedRecords = [...recordsByPath.values()]

  if (legacyActivePath && syncedRecords.length > 0) {
    const activeFileId = await getActiveFileId(uid)
    if (!activeFileId) {
      const match = syncedRecords.find((record) => record.filePath === legacyActivePath)
      if (match) await setActiveFileId(uid, match.id)
    }
  }

  return syncedRecords
}

async function listUserCvRecords(uid) {
  const records = await syncStorageWithFirestore(uid)
  return Promise.all(records.map((record) => enrichCvRecord(record)))
}

export async function getUserCvs(uid, { force = false } = {}) {
  if (!force && cvCache.has(uid)) {
    return cvCache.get(uid)
  }

  const [cvs, activeFileId] = await Promise.all([
    listUserCvRecords(uid),
    getActiveFileId(uid),
  ])

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

  await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
      customMetadata: { originalFileName: file.name },
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

  await createCvFileRecord(uid, {
    fileId,
    filePath,
    displayName: file.name,
    size: file.size,
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

  await deleteObject(ref(storage, pathKey))
  releasePreviewUrl(pathKey)
  await deleteCvFileRecord(uid, fileId)

  if (activeFileId === fileId) {
    const remaining = (await listCvFileRecords(uid))
      .filter((cv) => cv.id !== fileId)
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))

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
  const listing = await listAll(userRef)
  await Promise.all(listing.items.map((item) => deleteObject(item)))
  await deleteAllCvFileRecords(uid)
  await clearActiveFileId(uid)
  invalidateCvCache(uid)
}
