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
      educations: [],
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
    educations: normalizeEducations(data),
    summary: typeof data.summary === 'string' ? data.summary : '',
  }
}

const EDUCATION_DEGREE_TYPES = new Set(['associate', 'bachelor', 'master', 'doctorate', 'other'])
const EDUCATION_STATUSES = new Set(['studying', 'graduated'])
export const MAX_EDUCATIONS = 3

function createEducationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `edu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function educationItemHasContent(item) {
  return Boolean(
    item?.degreeType &&
      item?.status &&
      item?.university?.trim() &&
      item?.program?.trim() &&
      item?.graduationYear,
  )
}

function normalizeEducationItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const degreeType = EDUCATION_DEGREE_TYPES.has(raw.degreeType) ? raw.degreeType : ''
  const degreeOther = typeof raw.degreeOther === 'string' ? raw.degreeOther.trim() : ''
  const status = EDUCATION_STATUSES.has(raw.status) ? raw.status : ''
  const graduationYear =
    Number.isInteger(raw.graduationYear) && raw.graduationYear > 0 ? raw.graduationYear : null
  const university = typeof raw.university === 'string' ? raw.university.trim() : ''
  const universityIsOther = raw.universityIsOther === true
  const program = typeof raw.program === 'string' ? raw.program.trim() : ''
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim().slice(0, 64)
      : createEducationId()

  const item = {
    id,
    degreeType,
    degreeOther: degreeType === 'other' ? degreeOther : '',
    status,
    graduationYear,
    university,
    universityIsOther,
    program,
  }

  // Legacy studying rows may lack a year; still show them until the user re-saves.
  if (
    status === 'studying' &&
    !graduationYear &&
    degreeType &&
    university &&
    program
  ) {
    return item
  }

  return educationItemHasContent(item) ? item : null
}

function legacyEducationFromData(data) {
  return normalizeEducationItem({
    id: 'legacy',
    degreeType: data.educationDegreeType,
    degreeOther: data.educationDegreeOther,
    status: data.educationStatus,
    graduationYear: data.educationGraduationYear,
    university: data.educationUniversity,
    universityIsOther: data.educationUniversityIsOther === true,
    program:
      typeof data.educationProgram === 'string' && data.educationProgram.trim()
        ? data.educationProgram
        : typeof data.bachelor === 'string'
          ? data.bachelor
          : '',
  })
}

function normalizeEducations(data) {
  if (Array.isArray(data.educations)) {
    return data.educations
      .map((item) => normalizeEducationItem(item))
      .filter(Boolean)
      .slice(0, MAX_EDUCATIONS)
  }

  const legacy = legacyEducationFromData(data)
  return legacy ? [legacy] : []
}

function serializeEducationItem(item) {
  const degreeType = EDUCATION_DEGREE_TYPES.has(item.degreeType) ? item.degreeType : ''
  const degreeOther =
    degreeType === 'other' ? asTrimmedString(item.degreeOther, 80) : ''
  const status = EDUCATION_STATUSES.has(item.status) ? item.status : ''
  const currentYear = new Date().getFullYear()
  const graduationYear = Number(item.graduationYear)
  const universityIsOther = item.universityIsOther === true
  const university = asTrimmedString(item.university, 120)
  const program = asTrimmedString(item.program, 120)
  const id =
    typeof item.id === 'string' && item.id.trim()
      ? item.id.trim().slice(0, 64)
      : createEducationId()

  if (!degreeType || !status || !university || !program) {
    throw new Error('INVALID_EDUCATION')
  }
  if (degreeType === 'other' && !degreeOther) {
    throw new Error('INVALID_EDUCATION')
  }
  if (!Number.isInteger(graduationYear)) {
    throw new Error('INVALID_EDUCATION')
  }
  if (
    status === 'graduated' &&
    (graduationYear < 1900 || graduationYear > currentYear)
  ) {
    throw new Error('INVALID_EDUCATION')
  }
  if (
    status === 'studying' &&
    (graduationYear < currentYear || graduationYear > currentYear + 10)
  ) {
    throw new Error('INVALID_EDUCATION')
  }

  return {
    id,
    degreeType,
    degreeOther,
    status,
    graduationYear,
    university,
    universityIsOther,
    program,
  }
}

export async function saveUserEducations(userId, educations) {
  if (!Array.isArray(educations) || educations.length > MAX_EDUCATIONS) {
    throw new Error('INVALID_EDUCATION')
  }

  const stored = educations.map((item) => serializeEducationItem(item))

  await updateDoc(doc(db, 'users', userId), {
    educations: stored,
    bachelor: stored[0]?.program || '',
  })

  return stored
}

/** @deprecated Prefer saveUserEducations */
export async function saveUserEducation(userId, payload) {
  return saveUserEducations(userId, [
    {
      ...payload,
      id: payload.id || createEducationId(),
    },
  ])
}

const PROFILE_FIELD_LIMITS = {
  summary: 500,
}

export async function saveUserProfileField(userId, field, value) {
  const maxLength = PROFILE_FIELD_LIMITS[field]
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!maxLength || normalizedValue.length > maxLength) {
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
        headline:
          (Array.isArray(data.educations) && data.educations[0]?.program) ||
          data.educationProgram ||
          data.bachelor ||
          data.email ||
          '',
        location: data.homeCity || '',
        photoURL: null,
      }
    })
    .filter((person) => person.uid !== excludeUid && person.email)
}
