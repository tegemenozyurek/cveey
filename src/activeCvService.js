import {
  deleteField,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { auth, db } from './firebase'

const MAX_NAME_LENGTH = 120
const PDF_EXTENSION = '.pdf'

function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
}

function normalizeDisplayNameMap(names) {
  const normalized = {}
  for (const [key, value] of Object.entries(names ?? {})) {
    normalized[normalizeStoragePath(key)] = value
  }
  return normalized
}

function normalizeCvDisplayName(name) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('EMPTY_NAME')

  const baseName = trimmed.replace(/\.pdf$/i, '').trim()
  if (!baseName) throw new Error('EMPTY_NAME')

  const normalized = `${baseName}${PDF_EXTENSION}`
  if (normalized.length > MAX_NAME_LENGTH) throw new Error('NAME_TOO_LONG')

  return normalized
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

export async function getCvDisplayNames(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return {}
  return normalizeDisplayNameMap(snap.data().cvDisplayNames)
}

export async function setCvDisplayName(uid, fullPath, name) {
  const normalized = normalizeCvDisplayName(name)
  const pathKey = normalizeStoragePath(fullPath)

  await ensureUserDoc(uid)

  const userRef = doc(db, 'users', uid)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef)
    if (!snap.exists()) throw new Error('USER_DOC_UNAVAILABLE')

    const existing = normalizeDisplayNameMap(snap.data().cvDisplayNames)
    transaction.update(userRef, {
      cvDisplayNames: { ...existing, [pathKey]: normalized },
    })
  })
}

export async function removeCvDisplayName(uid, fullPath) {
  const pathKey = normalizeStoragePath(fullPath)
  const userRef = doc(db, 'users', uid)

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef)
    if (!snap.exists()) return

    const existing = normalizeDisplayNameMap(snap.data().cvDisplayNames)
    if (!(pathKey in existing)) return

    const { [pathKey]: _removed, ...rest } = existing
    if (Object.keys(rest).length === 0) {
      transaction.update(userRef, { cvDisplayNames: deleteField() })
    } else {
      transaction.update(userRef, { cvDisplayNames: rest })
    }
  })
}

export async function getActiveCvPath(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  const path = snap.exists() ? snap.data().activeCvPath ?? null : null
  return path ? normalizeStoragePath(path) : null
}

export async function setActiveCvPath(uid, path) {
  await ensureUserDoc(uid)
  const pathKey = normalizeStoragePath(path)
  const userRef = doc(db, 'users', uid)

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef)
    if (!snap.exists()) throw new Error('USER_DOC_UNAVAILABLE')

    transaction.update(userRef, { activeCvPath: pathKey })
  })
}

export async function clearActiveCvPath(uid) {
  const userRef = doc(db, 'users', uid)

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef)
    if (!snap.exists() || !('activeCvPath' in snap.data())) return

    transaction.update(userRef, { activeCvPath: deleteField() })
  })
}
