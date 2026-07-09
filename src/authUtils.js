export const AUTH_METHOD_EMAIL_PASSWORD = 'email-password'
export const AUTH_METHOD_GOOGLE = 'google'
export const AUTH_METHOD_GITHUB = 'github'

export function resolveAuthMethod(user) {
  if (user.providerData?.some((provider) => provider.providerId === 'google.com')) {
    return AUTH_METHOD_GOOGLE
  }
  if (user.providerData?.some((provider) => provider.providerId === 'github.com')) {
    return AUTH_METHOD_GITHUB
  }
  return AUTH_METHOD_EMAIL_PASSWORD
}
