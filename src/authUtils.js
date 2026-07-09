export const AUTH_METHOD_EMAIL_PASSWORD = 'email-password'
export const AUTH_METHOD_GOOGLE = 'google'

export function resolveAuthMethod(user) {
  if (user.providerData?.some((provider) => provider.providerId === 'google.com')) {
    return AUTH_METHOD_GOOGLE
  }
  return AUTH_METHOD_EMAIL_PASSWORD
}
