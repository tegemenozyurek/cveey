import { deleteUser } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { db } from './firebase'
import { normalizeEmailKey, removePasswordAccountIndex, syncPasswordAccountIndex } from './passwordAccountService'
import { deleteUserStorageFiles } from './storageService'

const USERS_SEARCH_LIMIT = 8

export { getActiveFileId, setActiveFileId, clearActiveFileId } from './cvFileService'
export { AUTH_METHOD_EMAIL_PASSWORD, AUTH_METHOD_GITHUB, AUTH_METHOD_GOOGLE, resolveAuthMethod } from './authUtils'

function resolveUserEmail(user) {
  if (user.email) return user.email
  const providerEmail = user.providerData?.find((provider) => provider.email)?.email
  return providerEmail || ''
}

async function withFirestoreAuthRetry(user, operation) {
  await user.getIdToken()
  try {
    return await operation()
  } catch (err) {
    if (err?.code !== 'permission-denied') throw err
    await user.getIdToken(true)
    return operation()
  }
}

export async function needsLocationSetup(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) return true
  return snap.data().locationSetupComplete !== true
}

export async function saveUserLocation(userId, { homeCity, preferredWorkCities }) {
  await updateDoc(doc(db, 'users', userId), {
    homeCity,
    preferredWorkCities,
    locationSetupComplete: true,
  })
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  if (!snap.exists()) {
    return {
      homeCity: '',
      preferredWorkCities: [],
    }
  }

  const data = snap.data()
  return {
    homeCity: typeof data.homeCity === 'string' ? data.homeCity : '',
    preferredWorkCities: Array.isArray(data.preferredWorkCities)
      ? data.preferredWorkCities.filter((city) => typeof city === 'string' && city.trim())
      : [],
  }
}

export async function syncUserToFirestore(user) {
  return withFirestoreAuthRetry(user, async () => {
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)
    const email = resolveUserEmail(user)

    if (!email) {
      throw new Error('USER_EMAIL_MISSING')
    }

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: normalizeEmailKey(email),
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
  })
}

export async function deleteUserAccount(user) {
  const email = user.email || user.providerData?.find((p) => p.email)?.email || ''
  await deleteUserStorageFiles(user.uid)
  await deleteDoc(doc(db, 'users', user.uid))
  if (email) await removePasswordAccountIndex(email)
  await deleteUser(user)
}

export async function searchUsersByEmail(emailQuery, { excludeUid } = {}) {
  const q = normalizeEmailKey(emailQuery)
  if (q.length < 2) return []

  const end = `${q}\uf8ff`
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('email', '>=', q),
      where('email', '<=', end),
      limit(USERS_SEARCH_LIMIT),
    ),
  )

  return snap.docs
    .map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        email: data.email || '',
        homeCity: data.homeCity || '',
        displayName: data.email || docSnap.id,
        headline: data.email || '',
        location: data.homeCity || '',
        photoURL: null,
      }
    })
    .filter((person) => person.uid !== excludeUid && person.email)
}
