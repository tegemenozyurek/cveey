import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import {
  AUTH_METHOD_EMAIL_PASSWORD,
  AUTH_METHOD_GITHUB,
  AUTH_METHOD_GOOGLE,
  resolveAuthMethod,
} from './authUtils'
import { db } from './firebase'

const COLLECTION = 'accountAuth'

function resolveUserEmail(user) {
  if (user.email) return user.email
  const providerEmail = user.providerData?.find((provider) => provider.email)?.email
  return providerEmail || ''
}

function hasPasswordProvider(user) {
  return user.providerData?.some((provider) => provider.providerId === 'password')
}

export function resolveAccountAuthMethod(user) {
  if (hasPasswordProvider(user)) return AUTH_METHOD_EMAIL_PASSWORD
  return resolveAuthMethod(user)
}

export function normalizeEmailKey(email) {
  return email.trim().toLowerCase()
}

export async function syncPasswordAccountIndex(user) {
  const email = resolveUserEmail(user)
  if (!email) return

  await user.getIdToken()

  const emailKey = normalizeEmailKey(email)
  const authMethod = resolveAccountAuthMethod(user)

  await setDoc(doc(db, COLLECTION, emailKey), {
    uid: user.uid,
    authMethod,
  })
}

export async function removePasswordAccountIndex(email) {
  if (!email) return
  await deleteDoc(doc(db, COLLECTION, normalizeEmailKey(email)))
}

export async function assertPasswordResetAllowed(email) {
  const trimmed = email.trim()
  if (!trimmed) throw new Error('EMPTY_EMAIL')

  const snap = await getDoc(doc(db, COLLECTION, normalizeEmailKey(trimmed)))

  if (!snap.exists()) {
    const err = new Error('EMAIL_NOT_REGISTERED')
    err.code = 'EMAIL_NOT_REGISTERED'
    throw err
  }

  const authMethod = snap.data().authMethod
  if (authMethod === AUTH_METHOD_GOOGLE || authMethod === AUTH_METHOD_GITHUB) {
    const err = new Error('AUTH_METHOD_NOT_PASSWORD')
    err.code = 'AUTH_METHOD_NOT_PASSWORD'
    throw err
  }

  if (authMethod !== AUTH_METHOD_EMAIL_PASSWORD) {
    const err = new Error('AUTH_METHOD_NOT_PASSWORD')
    err.code = 'AUTH_METHOD_NOT_PASSWORD'
    throw err
  }
}
