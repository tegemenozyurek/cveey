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
import { AUTH_METHOD_EMAIL_PASSWORD, resolveAuthMethod } from './authUtils'
import { auth, db } from './firebase'
import { normalizeEmailKey } from './passwordAccountService'
import { deleteUserStorageFiles } from './storageService'
import { purgeOutgoingConnectionNotifications, purgeOwnNotifications, purgeUserFromAllNetworks } from './networkService'

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

function normalizeUsernameKey(value) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

export async function saveUserOnboarding(userId, payload) {
  const username = normalizeUsernameKey(asTrimmedString(payload.username, 30))
  const homeCity = asTrimmedString(payload.homeCity, 80)

  if (!username || username.length < 3 || !homeCity) {
    throw new Error('INVALID_ONBOARDING')
  }

  await updateDoc(doc(db, 'users', userId), {
    username,
    homeCity,
    locationSetupComplete: true,
  })
}

const USERNAME_RE = /^[a-zA-Z0-9._]+$/

/** Update username and/or city from Preferences after onboarding. */
export async function saveUserIdentity(userId, { username, homeCity }) {
  const nextUsername = normalizeUsernameKey(asTrimmedString(username, 30))
  const nextCity = asTrimmedString(homeCity, 80)

  if (!nextUsername || nextUsername.length < 3 || !USERNAME_RE.test(nextUsername)) {
    const err = new Error('INVALID_USERNAME')
    err.code = 'INVALID_USERNAME'
    throw err
  }
  if (!nextCity) {
    const err = new Error('INVALID_CITY')
    err.code = 'INVALID_CITY'
    throw err
  }

  await updateDoc(doc(db, 'users', userId), {
    username: nextUsername,
    homeCity: nextCity,
  })

  return { username: nextUsername, homeCity: nextCity }
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

function getBachelorProgramNames(educations) {
  if (!Array.isArray(educations)) return []

  return educations
    .filter((item) => item?.degreeType === 'bachelor' && item?.program?.trim())
    .map((item) => item.program.trim())
}

function resolveUserEducations(userId, userData = {}) {
  return listEducationDocs(userId).then((fromSubcollection) => {
    if (fromSubcollection.length > 0) return fromSubcollection
    return normalizeLegacyEducations(userData)
  })
}

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
      exists: false,
      username: '',
      homeCity: '',
      preferredWorkCities: [],
      bachelor: '',
      educations: [],
      summary: '',
      photoURL: '',
      email: '',
      emailPublic: false,
    }
  }

  const data = snap.data()
  const fromSubcollection = await listEducationDocs(userId)
  const educations =
    fromSubcollection.length > 0 ? fromSubcollection : normalizeLegacyEducations(data)
  const emailPublic = data.emailPublic === true
  const viewerUid = auth.currentUser?.uid
  const canSeeEmail = emailPublic || viewerUid === userId
  const email =
    canSeeEmail && typeof data.email === 'string' ? data.email.trim() : ''

  return {
    exists: true,
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
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    email,
    emailPublic,
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

export async function saveUserPhotoURL(userId, photoURL) {
  const normalized = typeof photoURL === 'string' ? photoURL.trim() : ''
  if (!normalized || normalized.length > 2048 || !/^https:\/\//.test(normalized)) {
    throw new Error('INVALID_PHOTO_URL')
  }

  await updateDoc(doc(db, 'users', userId), {
    photoURL: normalized,
  })
}

export async function saveEmailPublic(userId, emailPublic) {
  if (typeof emailPublic !== 'boolean') {
    throw new Error('INVALID_EMAIL_PUBLIC')
  }

  await updateDoc(doc(db, 'users', userId), {
    emailPublic,
  })
}

export async function syncUserToFirestore(user) {
  return withFirestoreAuthRetry(user, async () => {
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)
    const email = resolveUserEmail(user)
    const photoURL = typeof user.photoURL === 'string' ? user.photoURL.trim() : ''

    if (!email) {
      throw new Error('USER_EMAIL_MISSING')
    }

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: normalizeEmailKey(email),
        authMethod: resolveAuthMethod(user),
        photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      })
      return
    }

    const data = snap.data()
    const nextEmail = normalizeEmailKey(email)
    const prevEmail = typeof data.email === 'string' ? normalizeEmailKey(data.email) : ''
    const prevPhotoURL = typeof data.photoURL === 'string' ? data.photoURL : ''
    const patch = { lastLoginAt: serverTimestamp() }

    if (prevEmail && nextEmail && prevEmail !== nextEmail) {
      // Firestore rules only allow email sync for email-password accounts.
      if (resolveAuthMethod(user) === AUTH_METHOD_EMAIL_PASSWORD) {
        patch.email = nextEmail
      }
    }

    if (photoURL && photoURL !== prevPhotoURL) {
      patch.photoURL = photoURL
    }

    await updateDoc(userRef, patch)
  })
}

export async function deleteUserAccount(user) {
  // Detach from friends' networks / pending requests first, then wipe own data / Auth.
  // Network/notification cleanup must not block Auth deletion if a query is briefly denied.
  try {
    await purgeUserFromAllNetworks(user.uid)
  } catch (err) {
    console.warn('Network purge during account delete failed:', err)
  }
  try {
    await purgeOutgoingConnectionNotifications(user.uid)
  } catch (err) {
    console.warn('Outgoing notification purge during account delete failed:', err)
  }
  try {
    await purgeOwnNotifications(user.uid)
  } catch (err) {
    console.warn('Own notification purge during account delete failed:', err)
  }

  await deleteUserStorageFiles(user.uid)
  await deleteAllEducationDocs(user.uid)

  try {
    await deleteDoc(doc(db, 'users', user.uid))
  } catch (err) {
    if (err?.code !== 'not-found') throw err
  }

  await deleteUser(user)
}

async function mapUserSnapToPerson(docSnap) {
  const data = docSnap.data()
  const uid = data.uid || docSnap.id
  const username = typeof data.username === 'string' ? data.username : ''
  let bachelorNames = []

  try {
    const educations = await resolveUserEducations(uid, data)
    bachelorNames = getBachelorProgramNames(educations)
  } catch {
    // Keep empty bachelor list when education is unreadable.
  }

  return {
    id: docSnap.id,
    uid,
    username,
    bachelorNames,
    homeCity: data.homeCity || '',
    displayName: username || docSnap.id,
    location: data.homeCity || '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
  }
}

export async function getUsersByIds(userIds, { excludeUid } = {}) {
  const ids = [...new Set((userIds || []).filter(Boolean))]
  if (ids.length === 0) return []

  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, 'users', id))))
  const people = await Promise.all(
    snaps.filter((snap) => snap.exists()).map((snap) => mapUserSnapToPerson(snap)),
  )

  const byUid = new Map(people.map((person) => [person.uid, person]))
  return ids
    .map((id) => byUid.get(id))
    .filter((person) => person && person.uid !== excludeUid && person.username)
}

export async function searchUsersByUsername(usernameQuery, { excludeUid } = {}) {
  const q = normalizeUsernameKey(usernameQuery)
  if (q.length < 3) return []

  const end = `${q}\uf8ff`
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('username', '>=', q),
      where('username', '<=', end),
      limit(USERS_SEARCH_LIMIT),
    ),
  )

  const people = await Promise.all(snap.docs.map((docSnap) => mapUserSnapToPerson(docSnap)))

  return people.filter((person) => person.uid !== excludeUid && person.username)
}
