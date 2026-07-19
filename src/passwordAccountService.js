import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import {
  AUTH_METHOD_EMAIL_PASSWORD,
  AUTH_METHOD_GITHUB,
  AUTH_METHOD_GOOGLE,
} from './authUtils'
import { db } from './firebase'

export function normalizeEmailKey(email) {
  return email.trim().toLowerCase()
}

/**
 * Forgot-password gate: look up authMethod on the existing users collection
 * (single source of truth). No separate accountAuth index.
 */
export async function assertPasswordResetAllowed(email) {
  const trimmed = email.trim()
  if (!trimmed) throw new Error('EMPTY_EMAIL')

  const emailKey = normalizeEmailKey(trimmed)
  const snap = await getDocs(
    query(collection(db, 'users'), where('email', '==', emailKey), limit(1)),
  )

  if (snap.empty) {
    const err = new Error('EMAIL_NOT_REGISTERED')
    err.code = 'EMAIL_NOT_REGISTERED'
    throw err
  }

  const authMethod = snap.docs[0].data().authMethod
  if (
    authMethod === AUTH_METHOD_GOOGLE ||
    authMethod === AUTH_METHOD_GITHUB ||
    authMethod !== AUTH_METHOD_EMAIL_PASSWORD
  ) {
    const err = new Error('AUTH_METHOD_NOT_PASSWORD')
    err.code = 'AUTH_METHOD_NOT_PASSWORD'
    throw err
  }
}
