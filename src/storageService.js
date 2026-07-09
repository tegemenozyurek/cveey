import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { storage } from './firebase'
import { getActiveCvPath, setActiveCvPath, clearActiveCvPath } from './activeCvService'

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

async function fetchCvItem(item) {
  const [url, metadata] = await Promise.all([
    getDownloadURL(item),
    getMetadata(item),
  ])

  return {
    storageName: item.name,
    displayName: metadata.customMetadata?.originalFileName || item.name,
    fullPath: item.fullPath,
    url,
    size: metadata.size,
    updated: metadata.updated,
  }
}

async function listStorageCvs(uid) {
  const userRef = ref(storage, `users/${uid}`)
  const listing = await listAll(userRef)

  const cvs = await Promise.all(listing.items.map(fetchCvItem))
  cvs.sort((a, b) => new Date(b.updated) - new Date(a.updated))
  return cvs
}

export async function getUserCvs(uid, { force = false } = {}) {
  if (!force && cvCache.has(uid)) {
    return cvCache.get(uid)
  }

  const [cvs, activeCvPath] = await Promise.all([
    listStorageCvs(uid),
    getActiveCvPath(uid),
  ])

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

export async function getCvDownloadUrl(fullPath) {
  return getDownloadURL(ref(storage, fullPath))
}

export async function deleteCv(uid, fullPath) {
  await deleteObject(ref(storage, fullPath))
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
