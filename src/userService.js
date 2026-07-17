import { deleteUser } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { db } from './firebase'
import { normalizeEmailKey, removePasswordAccountIndex, syncPasswordAccountIndex } from './passwordAccountService'
import { deleteUserStorageFiles } from './storageService'

const USERS_SEARCH_LIMIT = 8

export { getActiveFileId, setActiveFileId, clearActiveFileId } from './cvFileService'
export { AUTH_METHOD_EMAIL_PASSWORD, AUTH_METHOD_GITHUB, AUTH_METHOD_GOOGLE, resolveAuthMethod } from './authUtils'

function educationCollection(uid) {
  return collection(db, 'users', uid, 'education')
}

function educationDoc(uid, educationId) {
  return doc(db, 'users', uid, 'education', educationId)
}

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

const EDUCATION_DEGREE_TYPES = new Set(['associate', 'bachelor', 'master', 'doctorate', 'other'])
const EDUCATION_STATUSES = new Set(['studying', 'graduated'])
export const MAX_EDUCATIONS = 3

async function listEducationDocs(userId) {
  const snap = await getDocs(educationCollection(userId))
  return snap.docs
    .map((docSnap) => normalizeEducationItem({ id: docSnap.id, ...docSnap.data() }))
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id) || a.id.localeCompare(b.id))
    .slice(0, MAX_EDUCATIONS)
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
  const fromSubcollection = await listEducationDocs(userId)
  const educations =
    fromSubcollection.length > 0 ? fromSubcollection : normalizeLegacyEducations(data)

  return {
    username: typeof data.username === 'string' ? data.username : '',
    homeCity: typeof data.homeCity === 'string' ? data.homeCity : '',
    preferredWorkCities: Array.isArray(data.preferredWorkCities)
      ? data.preferredWorkCities.filter((city) => typeof city === 'string' && city.trim())
      : [],
    bachelor:
      (typeof educations[0]?.program === 'string' && educations[0].program) ||
      '',
    educations,
    summary: typeof data.summary === 'string' ? data.summary : '',
  }
}

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

function pickEducationField(raw, shortKey, prefixedKey) {
  if (raw[shortKey] !== undefined) return raw[shortKey]
  return raw[prefixedKey]
}

function normalizeEducationItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const rawDegreeType = pickEducationField(raw, 'degreeType', 'educationDegreeType')
  const rawDegreeOther = pickEducationField(raw, 'degreeOther', 'educationDegreeOther')
  const rawStatus = pickEducationField(raw, 'status', 'educationStatus')
  const rawGraduationYear = pickEducationField(raw, 'graduationYear', 'educationGraduationYear')
  const rawUniversity = pickEducationField(raw, 'university', 'educationUniversity')
  const rawUniversityIsOther = pickEducationField(
    raw,
    'universityIsOther',
    'educationUniversityIsOther',
  )
  const rawProgram = pickEducationField(raw, 'program', 'educationProgram')
  const programFromBachelor =
    typeof raw.bachelor === 'string' ? raw.bachelor.trim() : ''

  const degreeType = EDUCATION_DEGREE_TYPES.has(rawDegreeType) ? rawDegreeType : ''
  const degreeOther = typeof rawDegreeOther === 'string' ? rawDegreeOther.trim() : ''
  const status = EDUCATION_STATUSES.has(rawStatus) ? rawStatus : ''
  const graduationYear =
    Number.isInteger(rawGraduationYear) && rawGraduationYear > 0 ? rawGraduationYear : null
  const university = typeof rawUniversity === 'string' ? rawUniversity.trim() : ''
  const universityIsOther = rawUniversityIsOther === true
  const program =
    typeof rawProgram === 'string' && rawProgram.trim()
      ? rawProgram.trim()
      : programFromBachelor
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
    educationDegreeType: data.educationDegreeType,
    educationDegreeOther: data.educationDegreeOther,
    educationStatus: data.educationStatus,
    educationGraduationYear: data.educationGraduationYear,
    educationUniversity: data.educationUniversity,
    educationUniversityIsOther: data.educationUniversityIsOther === true,
    educationProgram:
      typeof data.educationProgram === 'string' && data.educationProgram.trim()
        ? data.educationProgram
        : typeof data.bachelor === 'string'
          ? data.bachelor
          : '',
  })
}

function normalizeLegacyEducations(data) {
  if (Array.isArray(data.educations)) {
    return data.educations
      .map((item) => normalizeEducationItem(item))
      .filter(Boolean)
      .slice(0, MAX_EDUCATIONS)
  }

  const legacy = legacyEducationFromData(data)
  return legacy ? [legacy] : []
}

function isSlotEducationId(id) {
  return typeof id === 'string' && /^[1-9]\d*$/.test(id)
}

function resolveEducationId(item) {
  const id =
    typeof item?.id === 'string' && item.id.trim()
      ? item.id.trim().slice(0, 64)
      : ''
  if (id && !isSlotEducationId(id) && id !== 'legacy') return id
  return createEducationId()
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
  const id = resolveEducationId(item)

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

function toEducationFirestoreData(item) {
  return {
    educationDegreeType: item.degreeType,
    educationDegreeOther: item.degreeOther,
    educationStatus: item.status,
    educationGraduationYear: item.graduationYear,
    educationUniversity: item.university,
    educationUniversityIsOther: item.universityIsOther,
    educationProgram: item.program,
  }
}

async function deleteAllEducationDocs(userId) {
  const snap = await getDocs(educationCollection(userId))
  if (snap.empty) return

  const batch = writeBatch(db)
  snap.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  await batch.commit()
}

export async function saveUserEducations(userId, educations) {
  if (!Array.isArray(educations) || educations.length > MAX_EDUCATIONS) {
    throw new Error('INVALID_EDUCATION')
  }

  const stored = educations.map((item) => serializeEducationItem(item))
  const existingSnap = await getDocs(educationCollection(userId))
  const nextIds = new Set(stored.map((item) => item.id))
  const batch = writeBatch(db)

  existingSnap.docs.forEach((docSnap) => {
    if (!nextIds.has(docSnap.id)) {
      batch.delete(docSnap.ref)
    }
  })

  stored.forEach((item) => {
    batch.set(educationDoc(userId, item.id), toEducationFirestoreData(item))
  })

  batch.update(doc(db, 'users', userId), {
    bachelor: deleteField(),
    educations: deleteField(),
    educationDegreeType: deleteField(),
    educationDegreeOther: deleteField(),
    educationStatus: deleteField(),
    educationGraduationYear: deleteField(),
    educationUniversity: deleteField(),
    educationUniversityIsOther: deleteField(),
    educationProgram: deleteField(),
  })

  await batch.commit()

  return stored
}

/** @deprecated Prefer saveUserEducations */
export async function saveUserEducation(userId, payload) {
  return saveUserEducations(userId, [payload])
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

    const data = snap.data()
    const nextEmail = normalizeEmailKey(email)
    const prevEmail = typeof data.email === 'string' ? normalizeEmailKey(data.email) : ''
    const patch = { lastLoginAt: serverTimestamp() }

    if (prevEmail && nextEmail && prevEmail !== nextEmail) {
      patch.email = nextEmail
    }

    await updateDoc(userRef, patch)

    if (prevEmail && nextEmail && prevEmail !== nextEmail) {
      try {
        await removePasswordAccountIndex(prevEmail)
      } catch (err) {
        if (err?.code !== 'not-found') console.warn('Old email index cleanup failed:', err)
      }
    }

    await syncPasswordAccountIndex(user)
  })
}

export async function deleteUserAccount(user) {
  const email = user.email || user.providerData?.find((p) => p.email)?.email || ''

  // Storage + files subcollection first, then education, then user doc, then auth index, then Auth.
  await deleteUserStorageFiles(user.uid)
  await deleteAllEducationDocs(user.uid)

  try {
    await deleteDoc(doc(db, 'users', user.uid))
  } catch (err) {
    if (err?.code !== 'not-found') throw err
  }

  if (email) {
    try {
      await removePasswordAccountIndex(email)
    } catch (err) {
      if (err?.code !== 'not-found') throw err
    }
  }

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

  const people = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data()
      const uid = data.uid || docSnap.id
      let headline = data.email || ''

      try {
        const educations = await listEducationDocs(uid)
        if (educations[0]?.program) {
          headline = educations[0].program
        }
      } catch {
        // Keep email fallback when education is unreadable.
      }

      return {
        id: docSnap.id,
        uid,
        email: data.email || '',
        homeCity: data.homeCity || '',
        displayName: data.username || data.email || docSnap.id,
        headline,
        location: data.homeCity || '',
        photoURL: null,
      }
    }),
  )

  return people.filter((person) => person.uid !== excludeUid && person.email)
}
