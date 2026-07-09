import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { auth, db } from './firebase'
const MAX_NAME_LENGTH = 120
const PDF_EXTENSION = '.pdf'

function normalizeCvDisplayName(name) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('EMPTY_NAME')

  const baseName = trimmed.replace(/\.pdf$/i, '').trim()
  if (!baseName) throw new Error('EMPTY_NAME')

  const normalized = `${baseName}${PDF_EXTENSION}`
  if (normalized.length > MAX_NAME_LENGTH) throw new Error('NAME_TOO_LONG')

  return normalized
}

function stripPdfExtension(name) {
  return name.replace(/\.pdf$/i, '')
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
  return snap.exists() ? snap.data().cvDisplayNames ?? {} : {}
}

export async function setCvDisplayName(uid, fullPath, name) {
  const normalized = normalizeCvDisplayName(name)

  await ensureUserDoc(uid)
  const snap = await getDoc(doc(db, 'users', uid))
  const existing = snap.exists() ? snap.data().cvDisplayNames ?? {} : {}

  await updateDoc(doc(db, 'users', uid), {
    cvDisplayNames: { ...existing, [fullPath]: normalized },
  })
}

export async function removeCvDisplayName(uid, fullPath) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return

  const existing = snap.data().cvDisplayNames ?? {}
  if (!(fullPath in existing)) return

  const { [fullPath]: _removed, ...rest } = existing
  if (Object.keys(rest).length === 0) {
    await updateDoc(userRef, { cvDisplayNames: deleteField() })
  } else {
    await updateDoc(userRef, { cvDisplayNames: rest })
  }
}

export async function getActiveCvPath(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data().activeCvPath ?? null : null
}

export async function setActiveCvPath(uid, path) {
  await ensureUserDoc(uid)
  await updateDoc(doc(db, 'users', uid), { activeCvPath: path })
}

export async function clearActiveCvPath(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists() || !('activeCvPath' in snap.data())) return
  await updateDoc(userRef, { activeCvPath: deleteField() })
}
