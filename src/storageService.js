import {
  deleteObject,
  listAll,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { storage } from './firebase'

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function getUserResumePath(uid, fileName) {
  return `users/${uid}/${Date.now()}_${sanitizeFileName(fileName)}`
}

export function uploadResume(uid, file, onProgress) {
  const path = getUserResumePath(uid, file.name)
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file, {
    contentType: 'application/pdf',
  })

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      reject,
      () => resolve({ path }),
    )
  })
}

export async function deleteUserStorageFiles(uid) {
  const userRef = ref(storage, `users/${uid}`)
  const listing = await listAll(userRef)

  const deleteItems = async (items, prefixes) => {
    await Promise.all(items.map((item) => deleteObject(item)))
    await Promise.all(prefixes.map(async (prefix) => {
      const nested = await listAll(prefix)
      await deleteItems(nested.items, nested.prefixes)
    }))
  }

  await deleteItems(listing.items, listing.prefixes)
}
