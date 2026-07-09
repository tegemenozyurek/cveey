import {
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { assertPasswordResetAllowed } from './passwordAccountService'

function getActionCodeSettings() {
  return {
    url: window.location.origin,
    handleCodeInApp: false,
  }
}

export async function sendVerificationEmail(user) {
  await sendEmailVerification(user, getActionCodeSettings())
}

export async function refreshAuthUser(user) {
  await reload(user)
  return user
}

export async function sendPasswordResetForEmail(auth, email) {
  await assertPasswordResetAllowed(email)
  await sendPasswordResetEmail(auth, email.trim(), getActionCodeSettings())
}
