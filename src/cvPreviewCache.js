import { getBytes, ref } from 'firebase/storage'
import { storage } from './firebase'

export const MAX_CV_BYTES = 5 * 1024 * 1024

const previewBlobCache = new Map()

function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
}

export function getCachedPreviewUrl(fullPath) {
  return previewBlobCache.get(normalizeStoragePath(fullPath)) ?? null
}

export async function getCvBlob(fullPath) {
  const normalizedPath = normalizeStoragePath(fullPath)
  const cachedUrl = previewBlobCache.get(normalizedPath)
  if (cachedUrl) {
    const response = await fetch(cachedUrl)
    return response.blob()
  }

  const bytes = await getBytes(ref(storage, normalizedPath), MAX_CV_BYTES)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  previewBlobCache.set(normalizedPath, blobUrl)
  return blob
}

export async function getOrCreatePreviewUrl(fullPath) {
  const normalizedPath = normalizeStoragePath(fullPath)
  const cached = previewBlobCache.get(normalizedPath)
  if (cached) return cached

  await getCvBlob(normalizedPath)
  return previewBlobCache.get(normalizedPath)
}

export function releasePreviewUrl(fullPath) {
  const normalizedPath = normalizeStoragePath(fullPath)
  const blobUrl = previewBlobCache.get(normalizedPath)
  if (!blobUrl) return

  URL.revokeObjectURL(blobUrl)
  previewBlobCache.delete(normalizedPath)
}

export function clearPreviewCache() {
  for (const blobUrl of previewBlobCache.values()) {
    URL.revokeObjectURL(blobUrl)
  }
  previewBlobCache.clear()
}
