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

export function normalizeCvDisplayName(name) {
  const trimmed = name.trim()
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

function parseDisplayNameFromStorageName(storageName) {
  const parts = storageName.split('_')
  if (parts.length > 1) return parts.slice(1).join('_')
  return storageName
}

function mapFileDoc(id, data) {
  const filePath = normalizeStoragePath(data.filePath)
  return {
    id,
    filePath,
    fullPath: filePath,
    displayName: data.displayName,
    storageName: storageNameFromPath(filePath),
    size: data.size ?? 0,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? null,
    updated: data.updatedAt?.toDate?.()?.toISOString?.()
      ?? data.createdAt?.toDate?.()?.toISOString?.()
      ?? new Date().toISOString(),
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

export async function listCvFileRecords(uid) {
  const snap = await getDocs(filesCollection(uid))
  return snap.docs.map((entry) => mapFileDoc(entry.id, entry.data()))
}

export async function getCvFileRecord(uid, fileId) {
  const snap = await getDoc(fileDoc(uid, fileId))
  if (!snap.exists()) return null
  return mapFileDoc(snap.id, snap.data())
}

export async function createCvFileRecord(uid, { filePath, displayName, size, fileId }) {
  await ensureUserDoc(uid)

  const normalizedPath = normalizeStoragePath(filePath)
  const fileRef = fileId ? fileDoc(uid, fileId) : doc(filesCollection(uid))
  const now = serverTimestamp()

  await setDoc(fileRef, {
    filePath: normalizedPath,
    displayName: normalizeCvDisplayName(displayName),
    size,
    createdAt: now,
    updatedAt: now,
  })

  const saved = await getDoc(fileRef)
  return mapFileDoc(saved.id, saved.data())
}

export async function updateCvFileDisplayName(uid, fileId, displayName) {
  const normalized = normalizeCvDisplayName(displayName)
  await updateDoc(fileDoc(uid, fileId), {
    displayName: normalized,
    updatedAt: serverTimestamp(),
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
  return snap.data().activeFileId ?? null
}

export async function getLegacyActiveCvPath(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const path = snap.data().activeCvPath ?? null
  return path ? normalizeStoragePath(path) : null
}

export async function getLegacyCvDisplayNames(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return {}
  return snap.data().cvDisplayNames ?? {}
}

export async function setActiveFileId(uid, fileId) {
  await ensureUserDoc(uid)
  await updateDoc(doc(db, 'users', uid), { activeFileId: fileId })
}

export async function clearActiveFileId(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists() || !('activeFileId' in snap.data())) return
  await updateDoc(userRef, { activeFileId: deleteField() })
}

export function resolveLegacyDisplayName(filePath, storageName, metadataName, legacyNames) {
  if (legacyNames[storageName]) return legacyNames[storageName]
  if (legacyNames[filePath]) return legacyNames[filePath]
  if (metadataName) return normalizeCvDisplayName(metadataName)
  return normalizeCvDisplayName(parseDisplayNameFromStorageName(storageName))
}
