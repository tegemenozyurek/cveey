import { getBytes, ref } from 'firebase/storage'
import { storage } from './firebase'

const previewBlobCache = new Map()

function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
}

export function getCachedPreviewUrl(fullPath) {
  return previewBlobCache.get(fullPath) ?? null
}

export async function getOrCreatePreviewUrl(fullPath) {
  const cached = previewBlobCache.get(fullPath)
  if (cached) return cached

  const bytes = await getBytes(ref(storage, normalizeStoragePath(fullPath)))
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  previewBlobCache.set(fullPath, blobUrl)
  return blobUrl
}

export function releasePreviewUrl(fullPath) {
  const blobUrl = previewBlobCache.get(fullPath)
  if (!blobUrl) return

  URL.revokeObjectURL(blobUrl)
  previewBlobCache.delete(fullPath)
}

export function clearPreviewCache() {
  for (const blobUrl of previewBlobCache.values()) {
    URL.revokeObjectURL(blobUrl)
  }
  previewBlobCache.clear()
}
