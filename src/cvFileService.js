import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { resolveAuthMethod } from './authUtils'
import { auth, db } from './firebase'
import { normalizeExtractedText } from './cvTextService'

export const MAX_CV_NAME_LENGTH = 120
const PDF_EXTENSION = '.pdf'

/**
 * CV visibility encodes who can see the active CV (audiences joined by `+`).
 * Audiences: public (non-connections), networks (connections), firms (companies).
 *
 * Switch → value map (hide* = true means that audience is excluded):
 *   default (hide public)              → networks+firms
 *   + hide connections                 → firms
 *   + hide companies                   → nobody
 *   hide companies only                → networks
 *   show public too                    → everybody
 *   public + firms                     → public+firms
 *   public + networks                  → public+networks
 *   public only                        → public
 */
export const CV_FILE_VISIBILITY = {
  NOBODY: 'nobody',
  EVERYBODY: 'everybody',
  PUBLIC: 'public',
  NETWORKS: 'networks',
  FIRMS: 'firms',
  PUBLIC_AND_NETWORKS: 'public+networks',
  PUBLIC_AND_FIRMS: 'public+firms',
  NETWORKS_AND_FIRMS: 'networks+firms',
}

export const DEFAULT_CV_FILE_VISIBILITY = CV_FILE_VISIBILITY.NETWORKS_AND_FIRMS

const VALID_CV_FILE_VISIBILITY = new Set(Object.values(CV_FILE_VISIBILITY))

/** UI defaults matching `networks+firms`. */
export const DEFAULT_CV_VISIBILITY_SWITCHES = {
  hideFromNonConnections: true,
  hideFromConnections: false,
  hideFromCompanies: false,
}

export function normalizeCvFileVisibility(value) {
  const normalized = String(value ?? '').trim()
  // Legacy alias from early drafts.
  if (normalized === 'public+networks+firms') return CV_FILE_VISIBILITY.EVERYBODY
  if (VALID_CV_FILE_VISIBILITY.has(normalized)) return normalized
  return DEFAULT_CV_FILE_VISIBILITY
}

/** Map modal switches → Firestore `visibility` string. */
export function visibilityFromSwitches({
  hideFromNonConnections = true,
  hideFromConnections = false,
  hideFromCompanies = false,
} = {}) {
  const audiences = []
  if (!hideFromNonConnections) audiences.push('public')
  if (!hideFromConnections) audiences.push('networks')
  if (!hideFromCompanies) audiences.push('firms')
  if (audiences.length === 0) return CV_FILE_VISIBILITY.NOBODY
  if (audiences.length === 3) return CV_FILE_VISIBILITY.EVERYBODY
  return audiences.join('+')
}

/** Map Firestore `visibility` → modal switches. */
export function switchesFromVisibility(visibility) {
  const value = normalizeCvFileVisibility(visibility)
  if (value === CV_FILE_VISIBILITY.NOBODY) {
    return {
      hideFromNonConnections: true,
      hideFromConnections: true,
      hideFromCompanies: true,
    }
  }
  if (value === CV_FILE_VISIBILITY.EVERYBODY) {
    return {
      hideFromNonConnections: false,
      hideFromConnections: false,
      hideFromCompanies: false,
    }
  }

  const parts = new Set(value.split('+'))
  return {
    hideFromNonConnections: !parts.has('public'),
    hideFromConnections: !parts.has('networks'),
    hideFromCompanies: !parts.has('firms'),
  }
}

const CV_VISIBILITY_INTRO_KEYS = {
  everybody: 'profile.cvIntro.everybody',
  'networks+firms': 'profile.cvIntro.networksFirms',
  firms: 'profile.cvIntro.firms',
  networks: 'profile.cvIntro.networks',
  nobody: 'profile.cvIntro.nobody',
  public: 'profile.cvIntro.public',
  'public+networks': 'profile.cvIntro.publicNetworks',
  'public+firms': 'profile.cvIntro.publicFirms',
}

const CV_VISIBILITY_SHEET_KEYS = {
  nobody: 'profile.cvSheet.nobody',
  firms: 'profile.cvSheet.firms',
  networks: 'profile.cvSheet.networks',
  public: 'profile.cvSheet.public',
  'public+networks': 'profile.cvSheet.publicNetworks',
  'public+firms': 'profile.cvSheet.publicFirms',
}

/** i18n keys + restricted flag for the profile active-CV panel. */
export function getCvVisibilityCopyKeys(visibility) {
  const value = normalizeCvFileVisibility(visibility)
  const switches = switchesFromVisibility(value)
  const restricted = switches.hideFromConnections || switches.hideFromCompanies

  return {
    value,
    restricted,
    introKey: CV_VISIBILITY_INTRO_KEYS[value] || 'profile.cvIntro.networksFirms',
    sheetKey: restricted
      ? (CV_VISIBILITY_SHEET_KEYS[value] || 'profile.cvHidden')
      : null,
  }
}

export function normalizeStoragePath(fullPath) {
  return fullPath.replace(/^\/+/, '')
}

export function storageNameFromPath(fullPath) {
  const normalized = normalizeStoragePath(fullPath)
  const slash = normalized.lastIndexOf('/')
  return slash === -1 ? normalized : normalized.slice(slash + 1)
}

export function buildCvStoragePath(uid, fileId) {
  return `users/${uid}/${fileId}.pdf`
}

export function normalizeCvDisplayName(name) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) throw new Error('EMPTY_NAME')

  const baseName = trimmed.replace(/\.pdf$/i, '').trim()
  if (!baseName) throw new Error('EMPTY_NAME')

  const normalized = `${baseName}${PDF_EXTENSION}`
  if (normalized.length > MAX_CV_NAME_LENGTH) throw new Error('NAME_TOO_LONG')

  return normalized
}

function filesCollection(uid) {
  return collection(db, 'users', uid, 'files')
}

function fileDoc(uid, fileId) {
  return doc(db, 'users', uid, 'files', fileId)
}

function isDefaultStoragePath(uid, fileId, filePath) {
  return normalizeStoragePath(filePath) === buildCvStoragePath(uid, fileId)
}

export function resolveFilePath(uid, fileId, data) {
  if (data?.storageObject) {
    return `users/${uid}/${data.storageObject}`
  }
  if (data?.filePath) {
    return normalizeStoragePath(data.filePath)
  }
  return buildCvStoragePath(uid, fileId)
}

function parseDisplayNameFromStorageName(storageName) {
  const parts = storageName.split('_')
  if (parts.length > 1) return parts.slice(1).join('_')
  return storageName
}

function storageObjectFromData(uid, fileId, data) {
  if (data.storageObject) return data.storageObject
  const filePath = data.filePath
    ? normalizeStoragePath(data.filePath)
    : buildCvStoragePath(uid, fileId)
  return storageNameFromPath(filePath)
}

function compactFileData(uid, fileId, data) {
  const compact = {
    displayName: normalizeCvDisplayName(data.displayName || 'cv.pdf'),
    visibility: normalizeCvFileVisibility(data.visibility),
  }

  if (typeof data.extractedText === 'string') {
    compact.extractedText = data.extractedText
  }

  const filePath = resolveFilePath(uid, fileId, data)
  if (!isDefaultStoragePath(uid, fileId, filePath)) {
    compact.storageObject = storageObjectFromData(uid, fileId, data)
  }

  return compact
}

function needsFileCompaction(uid, fileId, data) {
  const allowed = new Set(['displayName', 'storageObject', 'extractedText', 'visibility'])
  const keys = Object.keys(data ?? {})
  if (keys.some((key) => !allowed.has(key))) return true
  if (!('visibility' in (data ?? {}))) return true

  const filePath = resolveFilePath(uid, fileId, data)
  const shouldHaveStorageObject = !isDefaultStoragePath(uid, fileId, filePath)
  return shouldHaveStorageObject
    ? data.storageObject !== storageObjectFromData(uid, fileId, data)
    : 'storageObject' in data
}

function mapFileDoc(uid, id, data) {
  const filePath = resolveFilePath(uid, id, data)
  return {
    id,
    filePath,
    fullPath: filePath,
    displayName: data.displayName || storageNameFromPath(filePath),
    storageName: storageNameFromPath(filePath),
    visibility: normalizeCvFileVisibility(data.visibility),
    ...(typeof data.extractedText === 'string' ? { extractedText: data.extractedText } : {}),
  }
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

async function compactFileRecord(uid, fileId, data) {
  const mapped = mapFileDoc(uid, fileId, data)
  if (!needsFileCompaction(uid, fileId, data)) return mapped

  const compact = compactFileData(uid, fileId, data)

  try {
    await setDoc(fileDoc(uid, fileId), compact)
    return mapFileDoc(uid, fileId, compact)
  } catch (err) {
    console.warn('CV file compaction skipped:', fileId, err)
    return mapped
  }
}

export async function pruneLegacyUserFields(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return

  const data = snap.data()
  const cleanup = {}

  if ('activeCvPath' in data) cleanup.activeCvPath = deleteField()
  if ('cvDisplayNames' in data) cleanup.cvDisplayNames = deleteField()

  if (Object.keys(cleanup).length === 0) return

  try {
    await updateDoc(userRef, cleanup)
  } catch (err) {
    console.warn('Legacy user field cleanup skipped:', err)
  }
}

export async function listCvFileRecords(uid) {
  const snap = await getDocs(filesCollection(uid))
  return Promise.all(
    snap.docs.map((entry) => compactFileRecord(uid, entry.id, entry.data())),
  )
}

export async function getCvFileRecord(uid, fileId) {
  const snap = await getDoc(fileDoc(uid, fileId))
  if (!snap.exists()) return null
  return compactFileRecord(uid, snap.id, snap.data())
}

export async function createCvFileRecord(uid, {
  displayName,
  fileId,
  storageObject,
  extractedText,
  visibility = DEFAULT_CV_FILE_VISIBILITY,
}) {
  await ensureUserDoc(uid)

  const fileRef = fileId ? fileDoc(uid, fileId) : doc(filesCollection(uid))
  const payload = {
    displayName: normalizeCvDisplayName(displayName),
    visibility: normalizeCvFileVisibility(visibility),
  }

  if (storageObject) {
    payload.storageObject = storageObject
  }

  if (typeof extractedText === 'string') {
    payload.extractedText = normalizeExtractedText(extractedText)
  }

  await setDoc(fileRef, payload)
  const saved = await getDoc(fileRef)
  return mapFileDoc(uid, saved.id, saved.data())
}

export async function updateCvFileExtractedText(uid, fileId, extractedText) {
  await updateDoc(fileDoc(uid, fileId), {
    extractedText: normalizeExtractedText(extractedText),
  })
}

export async function updateCvFileDisplayName(uid, fileId, displayName) {
  await updateDoc(fileDoc(uid, fileId), {
    displayName: normalizeCvDisplayName(displayName),
  })
}

export async function updateCvFileVisibility(uid, fileId, visibility) {
  await updateDoc(fileDoc(uid, fileId), {
    visibility: normalizeCvFileVisibility(visibility),
  })
}

export async function deleteCvFileRecord(uid, fileId) {
  await deleteDoc(fileDoc(uid, fileId))
}

export async function deleteAllCvFileRecords(uid) {
  const snap = await getDocs(filesCollection(uid))
  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)))
}

export async function getActiveFileId(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null

  const data = snap.data()
  if (data.activeFileId) return data.activeFileId

  const legacyPath = data.activeCvPath ? normalizeStoragePath(data.activeCvPath) : null
  if (!legacyPath) return null

  // Prefer deriving the file id from the default path so non-owners don't need list.
  const defaultPrefix = `users/${uid}/`
  if (legacyPath.startsWith(defaultPrefix) && legacyPath.toLowerCase().endsWith('.pdf')) {
    const storageName = legacyPath.slice(defaultPrefix.length)
    const fileId = storageName.replace(/\.pdf$/i, '')
    if (fileId && !storageName.includes('/')) return fileId
  }

  try {
    const files = await listCvFileRecords(uid)
    return files.find((file) => file.filePath === legacyPath)?.id ?? null
  } catch (err) {
    console.warn('Could not resolve legacy active CV:', err)
    return null
  }
}

export async function setActiveFileId(uid, fileId) {
  await ensureUserDoc(uid)
  await updateDoc(doc(db, 'users', uid), { activeFileId: fileId })
  await pruneLegacyUserFields(uid)
}

export async function clearActiveFileId(uid) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists() || !('activeFileId' in snap.data())) return
  await updateDoc(userRef, { activeFileId: deleteField() })
}

export function resolveLegacyDisplayName(filePath, storageName, metadataName, legacyNames) {
  try {
    if (legacyNames[storageName]) return normalizeCvDisplayName(legacyNames[storageName])
    if (legacyNames[filePath]) return normalizeCvDisplayName(legacyNames[filePath])
    if (metadataName) return normalizeCvDisplayName(metadataName)
    return normalizeCvDisplayName(parseDisplayNameFromStorageName(storageName))
  } catch {
    return normalizeCvDisplayName(storageName || 'cv.pdf')
  }
}

export async function readLegacyMigrationData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) {
    return { legacyNames: {}, legacyActivePath: null }
  }

  const data = snap.data()
  return {
    legacyNames: data.cvDisplayNames ?? {},
    legacyActivePath: data.activeCvPath ? normalizeStoragePath(data.activeCvPath) : null,
  }
}
