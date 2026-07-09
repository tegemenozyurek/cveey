import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { deleteUserStorageFiles } from './storageService'

export { getActiveCvPath, setActiveCvPath, clearActiveCvPath } from './activeCvService'

export const AUTH_METHOD_EMAIL_PASSWORD = 'email-password'

export async function syncUserToFirestore(user, { isNewUser = false } = {}) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists() || isNewUser) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      authMethod: AUTH_METHOD_EMAIL_PASSWORD,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })
    return
  }

  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  })
}

export async function deleteUserAccount(user) {
  await deleteUserStorageFiles(user.uid)
  await deleteDoc(doc(db, 'users', user.uid))
  await deleteUser(user)
}
