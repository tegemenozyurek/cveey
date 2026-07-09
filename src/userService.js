import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { db } from './firebase'
import { removePasswordAccountIndex, syncPasswordAccountIndex } from './passwordAccountService'
import { deleteUserStorageFiles } from './storageService'

export { getActiveCvPath, setActiveCvPath, clearActiveCvPath } from './activeCvService'
export { AUTH_METHOD_EMAIL_PASSWORD, AUTH_METHOD_GITHUB, AUTH_METHOD_GOOGLE, resolveAuthMethod } from './authUtils'

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
    await syncPasswordAccountIndex(user)
    return
  }

  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  })
  await syncPasswordAccountIndex(user)
}

export async function deleteUserAccount(user) {
  const email = user.email || user.providerData?.find((p) => p.email)?.email || ''
  await deleteUserStorageFiles(user.uid)
  await deleteDoc(doc(db, 'users', user.uid))
  if (email) await removePasswordAccountIndex(email)
  await deleteUser(user)
}
