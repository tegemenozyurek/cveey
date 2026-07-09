import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { db } from './firebase'
import { deleteUserStorageFiles } from './storageService'

export { getActiveCvPath, setActiveCvPath, clearActiveCvPath } from './activeCvService'
export { AUTH_METHOD_EMAIL_PASSWORD, AUTH_METHOD_GOOGLE, resolveAuthMethod } from './authUtils'

function resolveUserEmail(user) {
  if (user.email) return user.email
  const providerEmail = user.providerData?.find((provider) => provider.email)?.email
  return providerEmail || ''
}

export async function syncUserToFirestore(user) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  const email = resolveUserEmail(user)

  if (!email) {
    throw new Error('USER_EMAIL_MISSING')
  }

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email,
      authMethod: resolveAuthMethod(user),
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
