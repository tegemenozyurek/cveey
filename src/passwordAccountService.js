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
 * Look up an existing users/{uid} doc by email (limit 1).
 * Returns null when no match.
 */
export async function findUserByEmail(email) {
  const emailKey = normalizeEmailKey(email)
  if (!emailKey) return null

  const snap = await getDocs(
    query(collection(db, 'users'), where('email', '==', emailKey), limit(1)),
  )
  if (snap.empty) return null

  const data = snap.docs[0].data()
  return {
    uid: typeof data.uid === 'string' && data.uid ? data.uid : snap.docs[0].id,
    email: typeof data.email === 'string' ? data.email : emailKey,
    authMethod: typeof data.authMethod === 'string' ? data.authMethod : '',
  }
}

/**
 * Forgot-password gate: look up authMethod on the existing users collection
 * (single source of truth). No separate accountAuth index.
 */
export async function assertPasswordResetAllowed(email) {
  const trimmed = email.trim()
  if (!trimmed) throw new Error('EMPTY_EMAIL')

  const existing = await findUserByEmail(trimmed)
  if (!existing) {
    const err = new Error('EMAIL_NOT_REGISTERED')
    err.code = 'EMAIL_NOT_REGISTERED'
    throw err
  }

  const authMethod = existing.authMethod
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
