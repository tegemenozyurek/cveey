import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { auth, storage } from './firebase'
import {
  clearActiveCvPath,
  getActiveCvPath,
  getCvDisplayNames,
  removeCvDisplayName,
  setActiveCvPath,
  setCvDisplayName,
} from './activeCvService'

export const MAX_CV_COUNT = 5

const cvCache = new Map()

export function invalidateCvCache(uid) {
  if (uid) cvCache.delete(uid)
  else cvCache.clear()
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function buildCvStoragePath(uid, fileName) {
  return `users/${uid}/${Date.now()}_${sanitizeFileName(fileName)}`
}

function resolveDisplayName(fullPath, storageName, metadataName, displayNames) {
  if (displayNames[fullPath]) return displayNames[fullPath]
  if (metadataName) return metadataName
  const parts = storageName.split('_')
  if (parts.length > 1) return parts.slice(1).join('_')
  return storageName
}

async function fetchCvItem(item, displayNames) {
  const [url, metadata] = await Promise.all([
    getDownloadURL(item),
    getMetadata(item),
  ])

  const metadataName = metadata.customMetadata?.originalFileName

  return {
    storageName: item.name,
    displayName: resolveDisplayName(item.fullPath, item.name, metadataName, displayNames),
    fullPath: item.fullPath,
    url,
    size: metadata.size,
    updated: metadata.updated,
  }
}

async function listStorageCvs(uid, displayNames) {
  const userRef = ref(storage, `users/${uid}`)
  const listing = await listAll(userRef)

  const cvs = await Promise.all(listing.items.map((item) => fetchCvItem(item, displayNames)))
  cvs.sort((a, b) => new Date(b.updated) - new Date(a.updated))
  return cvs
}

export async function getUserCvs(uid, { force = false } = {}) {
  if (!force && cvCache.has(uid)) {
    return cvCache.get(uid)
  }

  const [displayNames, activeCvPath] = await Promise.all([
    getCvDisplayNames(uid),
    getActiveCvPath(uid),
  ])

  const cvs = await listStorageCvs(uid, displayNames)

  let resolvedActivePath = activeCvPath
  if (cvs.length === 0) {
    resolvedActivePath = null
    try {
      if (activeCvPath) await clearActiveCvPath(uid)
    } catch (err) {
      console.warn('Could not clear active CV path:', err)
    }
  } else if (!activeCvPath || !cvs.some((cv) => cv.fullPath === activeCvPath)) {
    resolvedActivePath = cvs[0].fullPath
    try {
      await setActiveCvPath(uid, resolvedActivePath)
    } catch (err) {
      console.warn('Could not set active CV path:', err)
    }
  }

  const data = {
    cvs,
    activeCvPath: resolvedActivePath,
    activeCv: cvs.find((cv) => cv.fullPath === resolvedActivePath) ?? null,
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

  const path = buildCvStoragePath(uid, file.name)
  const storageRef = ref(storage, path)

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

  if (cvs.length === 0) {
    try {
      await setActiveCvPath(uid, path)
    } catch (err) {
      console.warn('Could not set active CV after upload:', err)
    }
  }

  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function renameCv(uid, fullPath, newName) {
  await setCvDisplayName(uid, fullPath, newName)
  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function getCvDownloadUrl(fullPath) {
  return getDownloadURL(ref(storage, normalizeStoragePath(fullPath)))
}

function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
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

function buildAttachmentUrl(baseUrl, fileName) {
  const separator = baseUrl.includes('?') ? '&' : '?'
  const safeName = fileName.replace(/"/g, '')
  const disposition = encodeURIComponent(`attachment; filename="${safeName}"`)
  return `${baseUrl}${separator}response-content-disposition=${disposition}`
}

function triggerIframeDownload(url) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;visibility:hidden'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = url
  document.body.appendChild(iframe)
  window.setTimeout(() => iframe.remove(), 120_000)
}

export async function downloadCvFile(fullPath, displayName, cachedUrl) {
  await ensureAuth()

  const fileName = sanitizeDownloadFileName(displayName)
  const path = normalizeStoragePath(fullPath)
  const baseUrl = cachedUrl || await getCvDownloadUrl(path)
  const downloadUrl = buildAttachmentUrl(baseUrl, fileName)

  triggerIframeDownload(downloadUrl)
}

export async function deleteCv(uid, fullPath) {
  await deleteObject(ref(storage, fullPath))
  try {
    await removeCvDisplayName(uid, fullPath)
  } catch (err) {
    console.warn('Could not remove CV display name:', err)
  }
  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function activateCv(uid, fullPath) {
  await setActiveCvPath(uid, fullPath)
  invalidateCvCache(uid)
  return getUserCvs(uid, { force: true })
}

export async function deleteUserStorageFiles(uid) {
  const userRef = ref(storage, `users/${uid}`)
  const listing = await listAll(userRef)
  await Promise.all(listing.items.map((item) => deleteObject(item)))
  invalidateCvCache(uid)
}
