import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth } from './firebase'
import { db } from './firebase'

const AUTH_METHOD = 'email-password'

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
    authMethod: AUTH_METHOD,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  })
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
