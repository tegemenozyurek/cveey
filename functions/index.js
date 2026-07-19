const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const functions = require('firebase-functions/v1')

initializeApp()

/** Same Web API key as the client — used only to trigger Firebase Auth email templates. */
const WEB_API_KEY = 'AIzaSyDllXXMOliHnKKhycS-AezkbKCDz6UvGaU'

const PASSWORD_PROVIDER = 'password'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function hasPasswordProvider(userRecord) {
  return (userRecord.providerData || []).some((provider) => provider.providerId === PASSWORD_PROVIDER)
}

function mapAuthAdminError(error) {
  if (error?.code === 'auth/user-not-found') {
    return new functions.https.HttpsError('not-found', 'EMAIL_NOT_REGISTERED')
  }
  if (error?.code === 'auth/invalid-email') {
    return new functions.https.HttpsError('invalid-argument', 'INVALID_EMAIL')
  }
  return new functions.https.HttpsError('internal', 'PASSWORD_RESET_FAILED')
}

async function sendFirebasePasswordResetEmail(email, continueUrl) {
  const body = {
    requestType: 'PASSWORD_RESET',
    email,
  }
  if (continueUrl) {
    body.continueUrl = continueUrl
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error?.message || 'PASSWORD_RESET_FAILED'
    if (message.includes('EMAIL_NOT_FOUND')) {
      throw new functions.https.HttpsError('not-found', 'EMAIL_NOT_REGISTERED')
    }
    if (message.includes('INVALID_EMAIL')) {
      throw new functions.https.HttpsError('invalid-argument', 'INVALID_EMAIL')
    }
    if (message.includes('TOO_MANY_ATTEMPTS') || message.includes('TOO_MANY_REQUESTS')) {
      throw new functions.https.HttpsError('resource-exhausted', 'TOO_MANY_REQUESTS')
    }
    throw new functions.https.HttpsError('internal', 'PASSWORD_RESET_FAILED')
  }
}

/**
 * 1st gen callable: publicly invokable by default (needed while signed out).
 * Rejects OAuth-only accounts before sending Firebase's reset email template.
 */
exports.requestPasswordReset = functions
  .region('europe-west1')
  .https
  .onCall(async (data) => {
    const email = normalizeEmail(data?.email)
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'EMPTY_EMAIL')
    }

    let userRecord
    try {
      userRecord = await getAuth().getUserByEmail(email)
    } catch (error) {
      throw mapAuthAdminError(error)
    }

    if (!hasPasswordProvider(userRecord)) {
      throw new functions.https.HttpsError('failed-precondition', 'AUTH_METHOD_NOT_PASSWORD')
    }

    const continueUrl = String(data?.continueUrl || '').trim()
    await sendFirebasePasswordResetEmail(email, continueUrl || undefined)
    return { ok: true }
  })
