export function displayValue(value, fallback) {
  const trimmed = value?.trim()
  return trimmed || fallback
}

export function formatLinkLabel(url) {
  if (!url?.trim()) return ''
  return url.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export function hasOptionalPersonalMeta(personal) {
  return Boolean(
    personal.dateOfBirth?.trim()
    || personal.drivingLicense?.trim()
    || (personal.militaryStatus && personal.militaryStatus !== 'notApplicable'),
  )
}
