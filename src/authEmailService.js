import { reload, sendEmailVerification } from 'firebase/auth'

function getVerificationSettings() {
  return {
    url: window.location.origin,
    handleCodeInApp: false,
  }
}

export async function sendVerificationEmail(user) {
  await sendEmailVerification(user, getVerificationSettings())
}

export async function refreshAuthUser(user) {
  await reload(user)
  return user
}
