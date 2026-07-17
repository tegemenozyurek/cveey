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

function asTrimmedString(value, maxLength) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return ''
  return trimmed
}

export async function saveUserOnboarding(userId, payload) {
  const username = asTrimmedString(payload.username, 30)
  const homeCity = asTrimmedString(payload.homeCity, 80)

  if (!username || !homeCity) {
    throw new Error('INVALID_ONBOARDING')
  }

  await updateDoc(doc(db, 'users', userId), {
    username,
    homeCity,
    locationSetupComplete: true,
  })
}

/** @deprecated Use saveUserOnboarding */
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
      username: '',
      homeCity: '',
      preferredWorkCities: [],
      bachelor: '',
      education: emptyEducation(),
      summary: '',
    }
  }

  const data = snap.data()
  return {
    username: typeof data.username === 'string' ? data.username : '',
    homeCity: typeof data.homeCity === 'string' ? data.homeCity : '',
    preferredWorkCities: Array.isArray(data.preferredWorkCities)
      ? data.preferredWorkCities.filter((city) => typeof city === 'string' && city.trim())
      : [],
    bachelor: typeof data.bachelor === 'string' ? data.bachelor : '',
    education: normalizeEducation(data),
    summary: typeof data.summary === 'string' ? data.summary : '',
  }
}

const EDUCATION_DEGREE_TYPES = new Set(['associate', 'bachelor', 'master', 'doctorate', 'other'])

function emptyEducation() {
  return {
    degreeType: '',
    degreeOther: '',
    university: '',
    universityIsOther: false,
    program: '',
  }
}

function normalizeEducation(data) {
  const degreeType = EDUCATION_DEGREE_TYPES.has(data.educationDegreeType)
    ? data.educationDegreeType
    : ''
  const degreeOther = typeof data.educationDegreeOther === 'string' ? data.educationDegreeOther : ''
  const university = typeof data.educationUniversity === 'string' ? data.educationUniversity : ''
  const universityIsOther = data.educationUniversityIsOther === true
  const program =
    typeof data.educationProgram === 'string' && data.educationProgram.trim()
      ? data.educationProgram
      : typeof data.bachelor === 'string'
        ? data.bachelor
        : ''

  return {
    degreeType,
    degreeOther,
    university,
    universityIsOther,
    program,
  }
}

export async function saveUserEducation(userId, payload) {
  const degreeType = EDUCATION_DEGREE_TYPES.has(payload.degreeType) ? payload.degreeType : ''
  const degreeOther =
    degreeType === 'other' ? asTrimmedString(payload.degreeOther, 80) : ''
  const universityIsOther = payload.universityIsOther === true
  const university = asTrimmedString(payload.university, 120)
  const program = asTrimmedString(payload.program, 120)

  if (!degreeType || !university || !program) {
    throw new Error('INVALID_EDUCATION')
  }
  if (degreeType === 'other' && !degreeOther) {
    throw new Error('INVALID_EDUCATION')
  }

  await updateDoc(doc(db, 'users', userId), {
    educationDegreeType: degreeType,
    educationDegreeOther: degreeOther,
    educationUniversity: university,
    educationUniversityIsOther: universityIsOther,
    educationProgram: program,
    bachelor: program,
  })

  return {
    degreeType,
    degreeOther,
    university,
    universityIsOther,
    program,
  }
}

const PROFILE_FIELD_LIMITS = {
  summary: 500,
}

export async function saveUserProfileField(userId, field, value) {
  const maxLength = PROFILE_FIELD_LIMITS[field]
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!maxLength || !normalizedValue || normalizedValue.length > maxLength) {
    throw new Error('INVALID_PROFILE_FIELD')
  }

  await updateDoc(doc(db, 'users', userId), {
    [field]: normalizedValue,
  })
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
        displayName: data.username || data.email || docSnap.id,
        headline: data.educationProgram || data.bachelor || data.email || '',
        location: data.homeCity || '',
        photoURL: null,
      }
    })
    .filter((person) => person.uid !== excludeUid && person.email)
}
