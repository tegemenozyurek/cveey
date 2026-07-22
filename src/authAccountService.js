import {
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth'
import {
  AUTH_METHOD_EMAIL_PASSWORD,
  AUTH_METHOD_GITHUB,
  AUTH_METHOD_GOOGLE,
  resolveAuthMethod,
} from './authUtils'
import { findUserByEmail, normalizeEmailKey } from './passwordAccountService'

const GOOGLE_SECURITY_URL = 'https://myaccount.google.com/security'
const GITHUB_SECURITY_URL = 'https://github.com/settings/security'
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function getActionCodeSettings() {
  return {
    url: window.location.origin,
    handleCodeInApp: false,
  }
}

export function getPasswordProviderUrl(method) {
  if (method === AUTH_METHOD_GOOGLE) return GOOGLE_SECURITY_URL
  if (method === AUTH_METHOD_GITHUB) return GITHUB_SECURITY_URL
  return null
}

export function canChangePasswordInApp(method) {
  return method === AUTH_METHOD_EMAIL_PASSWORD
}

export function canChangeEmailInApp(method) {
  return method === AUTH_METHOD_EMAIL_PASSWORD
}

async function reauthenticateWithPassword(user, currentPassword) {
  const email = user.email
  if (!email) throw Object.assign(new Error('EMAIL_MISSING'), { code: 'EMAIL_MISSING' })
  if (!currentPassword) {
    throw Object.assign(new Error('PASSWORD_REQUIRED'), { code: 'PASSWORD_REQUIRED' })
  }

  const credential = EmailAuthProvider.credential(email, currentPassword)
  await reauthenticateWithCredential(user, credential)
}

async function reauthenticateWithOAuth(user, method) {
  const provider =
    method === AUTH_METHOD_GOOGLE ? new GoogleAuthProvider() : new GithubAuthProvider()
  await reauthenticateWithPopup(user, provider)
}

export async function reauthenticateForSensitiveAction(user, { currentPassword } = {}) {
  const method = resolveAuthMethod(user)

  if (method === AUTH_METHOD_EMAIL_PASSWORD) {
    await reauthenticateWithPassword(user, currentPassword)
    return
  }

  if (method === AUTH_METHOD_GOOGLE || method === AUTH_METHOD_GITHUB) {
    await reauthenticateWithOAuth(user, method)
    return
  }

  throw Object.assign(new Error('UNSUPPORTED_AUTH_METHOD'), { code: 'UNSUPPORTED_AUTH_METHOD' })
}

export async function changeEmailPassword(user, { currentPassword, newPassword }) {
  if (resolveAuthMethod(user) !== AUTH_METHOD_EMAIL_PASSWORD) {
    throw Object.assign(new Error('AUTH_METHOD_NOT_PASSWORD'), {
      code: 'AUTH_METHOD_NOT_PASSWORD',
    })
  }

  const trimmedNew = typeof newPassword === 'string' ? newPassword.trim() : ''
  if (trimmedNew.length < 6) {
    throw Object.assign(new Error('WEAK_PASSWORD'), { code: 'auth/weak-password' })
  }

  await reauthenticateWithPassword(user, currentPassword)
  await updatePassword(user, trimmedNew)
}

export async function changeUserEmail(user, { currentPassword, newEmail }) {
  if (resolveAuthMethod(user) !== AUTH_METHOD_EMAIL_PASSWORD) {
    throw Object.assign(new Error('AUTH_METHOD_NOT_PASSWORD'), {
      code: 'AUTH_METHOD_NOT_PASSWORD',
    })
  }

  const trimmed = typeof newEmail === 'string' ? normalizeEmailKey(newEmail) : ''
  if (!trimmed || !EMAIL_PATTERN.test(trimmed)) {
    throw Object.assign(new Error('INVALID_EMAIL'), { code: 'auth/invalid-email' })
  }

  const current = normalizeEmailKey(user.email || '')
  if (trimmed === current) {
    throw Object.assign(new Error('SAME_EMAIL'), { code: 'SAME_EMAIL' })
  }

  // Firebase verifyBeforeUpdateEmail often returns success without sending mail
  // when the address already belongs to another account. Check Firestore first.
  const existing = await findUserByEmail(trimmed)
  if (existing && existing.uid !== user.uid) {
    if (
      existing.authMethod === AUTH_METHOD_GOOGLE ||
      existing.authMethod === AUTH_METHOD_GITHUB
    ) {
      throw Object.assign(new Error('EMAIL_IN_USE_OAUTH'), {
        code: 'EMAIL_IN_USE_OAUTH',
        authMethod: existing.authMethod,
      })
    }
    throw Object.assign(new Error('EMAIL_IN_USE'), { code: 'auth/email-already-in-use' })
  }

  await reauthenticateWithPassword(user, currentPassword)
  await verifyBeforeUpdateEmail(user, trimmed, getActionCodeSettings())
}
