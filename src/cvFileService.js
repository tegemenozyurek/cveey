import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { auth, db } from './firebase'

export const MAX_CV_NAME_LENGTH = 120
const PDF_EXTENSION = '.pdf'

export function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
}

export function storageNameFromPath(fullPath) {
  const normalized = normalizeStoragePath(fullPath)
  const slash = normalized.lastIndexOf('/')
  return slash === -1 ? normalized : normalized.slice(slash + 1)
}

export function buildCvStoragePath(uid, fileId) {
  return `users/${uid}/${fileId}.pdf`
}

export function normalizeCvDisplayName(name) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) throw new Error('EMPTY_NAME')

  const baseName = trimmed.replace(/\.pdf$/i, '').trim()
  if (!baseName) throw new Error('EMPTY_NAME')

  const normalized = `${baseName}${PDF_EXTENSION}`
  if (normalized.length > MAX_CV_NAME_LENGTH) throw new Error('NAME_TOO_LONG')

  return normalized
}

function filesCollection(uid) {
  return collection(db, 'users', uid, 'files')
}

function fileDoc(uid, fileId) {
  return doc(db, 'users', uid, 'files', fileId)
}

function isDefaultStoragePath(uid, fileId, filePath) {
  return normalizeStoragePath(filePath) === buildCvStoragePath(uid, fileId)
}

export function resolveFilePath(uid, fileId, data) {
  if (data?.storageObject) {
    return `users/${uid}/${data.storageObject}`
  }
  if (data?.filePath) {
    return normalizeStoragePath(data.filePath)
  }
  return buildCvStoragePath(uid, fileId)
}

function parseDisplayNameFromStorageName(storageName) {
  const parts = storageName.split('_')
  if (parts.length > 1) return parts.slice(1).join('_')
  return storageName
}

function storageObjectFromData(uid, fileId, data) {
  if (data.storageObject) return data.storageObject
  const filePath = data.filePath
    ? normalizeStoragePath(data.filePath)
    : buildCvStoragePath(uid, fileId)
  return storageNameFromPath(filePath)
}

function compactFileData(uid, fileId, data) {
  const compact = {
    displayName: normalizeCvDisplayName(data.displayName || 'cv.pdf'),
  }

  const filePath = resolveFilePath(uid, fileId, data)
  if (!isDefaultStoragePath(uid, fileId, filePath)) {
    compact.storageObject = storageObjectFromData(uid, fileId, data)
  }

  return compact
}

function needsFileCompaction(uid, fileId, data) {
  const allowed = new Set(['displayName', 'storageObject'])
  const keys = Object.keys(data ?? {})
  if (keys.some((key) => !allowed.has(key))) return true

  const filePath = resolveFilePath(uid, fileId, data)
  const shouldHaveStorageObject = !isDefaultStoragePath(uid, fileId, filePath)
  return shouldHaveStorageObject
    ? data.storageObject !== storageObjectFromData(uid, fileId, data)
    : 'storageObject' in data
}

function mapFileDoc(uid, id, data) {
  const filePath = resolveFilePath(uid, id, data)
  return {
    id,
    filePath,
    fullPath: filePath,
    displayName: data.displayName || storageNameFromPath(filePath),
    storageName: storageNameFromPath(filePath),
  }
}

async function ensureUserDoc(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) return

  const user = auth.currentUser
  if (!user || user.uid !== uid) {
    throw new Error('USER_DOC_UNAVAILABLE')
  }

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email ?? '',
    authMethod: resolveAuthMethod(user),
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  })
}

async function compactFileRecord(uid, fileId, data) {
  const mapped = mapFileDoc(uid, fileId, data)
  if (!needsFileCompaction(uid, fileId, data)) return mapped

  const compact = compactFileData(uid, fileId, data)

  try {
    await setDoc(fileDoc(uid, fileId), compact)
    return mapFileDoc(uid, fileId, compact)
  } catch (err) {
    console.warn('CV file compaction skipped:', fileId, err)
    return mapped
  }
}

export async function pruneLegacyUserFields(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return

  const data = snap.data()
  const cleanup = {}

  if ('activeCvPath' in data) cleanup.activeCvPath = deleteField()
  if ('cvDisplayNames' in data) cleanup.cvDisplayNames = deleteField()

  if (Object.keys(cleanup).length === 0) return

  try {
    await updateDoc(userRef, cleanup)
  } catch (err) {
    console.warn('Legacy user field cleanup skipped:', err)
  }
}

export async function listCvFileRecords(uid) {
  const snap = await getDocs(filesCollection(uid))
  return Promise.all(
    snap.docs.map((entry) => compactFileRecord(uid, entry.id, entry.data())),
  )
}

export async function getCvFileRecord(uid, fileId) {
  const snap = await getDoc(fileDoc(uid, fileId))
  if (!snap.exists()) return null
  return compactFileRecord(uid, snap.id, snap.data())
}

export async function createCvFileRecord(uid, { displayName, fileId, storageObject }) {
  await ensureUserDoc(uid)

  const fileRef = fileId ? fileDoc(uid, fileId) : doc(filesCollection(uid))
  const payload = {
    displayName: normalizeCvDisplayName(displayName),
  }

  if (storageObject) {
    payload.storageObject = storageObject
  }

  await setDoc(fileRef, payload)
  const saved = await getDoc(fileRef)
  return mapFileDoc(uid, saved.id, saved.data())
}

export async function updateCvFileDisplayName(uid, fileId, displayName) {
  await updateDoc(fileDoc(uid, fileId), {
    displayName: normalizeCvDisplayName(displayName),
  })
}

export async function deleteCvFileRecord(uid, fileId) {
  await deleteDoc(fileDoc(uid, fileId))
}

export async function deleteAllCvFileRecords(uid) {
  const snap = await getDocs(filesCollection(uid))
  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)))
}

export async function getActiveFileId(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null

  const data = snap.data()
  if (data.activeFileId) return data.activeFileId

  const legacyPath = data.activeCvPath ? normalizeStoragePath(data.activeCvPath) : null
  if (!legacyPath) return null

  try {
    const files = await listCvFileRecords(uid)
    return files.find((file) => file.filePath === legacyPath)?.id ?? null
  } catch (err) {
    console.warn('Could not resolve legacy active CV:', err)
    return null
  }
}

export async function setActiveFileId(uid, fileId) {
  await ensureUserDoc(uid)
  await updateDoc(doc(db, 'users', uid), { activeFileId: fileId })
  await pruneLegacyUserFields(uid)
}

export async function clearActiveFileId(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists() || !('activeFileId' in snap.data())) return
  await updateDoc(userRef, { activeFileId: deleteField() })
}

export function resolveLegacyDisplayName(filePath, storageName, metadataName, legacyNames) {
  try {
    if (legacyNames[storageName]) return normalizeCvDisplayName(legacyNames[storageName])
    if (legacyNames[filePath]) return normalizeCvDisplayName(legacyNames[filePath])
    if (metadataName) return normalizeCvDisplayName(metadataName)
    return normalizeCvDisplayName(parseDisplayNameFromStorageName(storageName))
  } catch {
    return normalizeCvDisplayName(storageName || 'cv.pdf')
  }
}

export async function readLegacyMigrationData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) {
    return { legacyNames: {}, legacyActivePath: null }
  }

  const data = snap.data()
  return {
    legacyNames: data.cvDisplayNames ?? {},
    legacyActivePath: data.activeCvPath ? normalizeStoragePath(data.activeCvPath) : null,
  }
}
