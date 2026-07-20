const CACHE_PREFIX = 'cveey.profile.'

function normalizeCachedProfile(raw) {
  if (!raw || typeof raw !== 'object') return null

  return {
    username: typeof raw.username === 'string' ? raw.username : '',
    homeCity: typeof raw.homeCity === 'string' ? raw.homeCity : '',
    preferredWorkCities: Array.isArray(raw.preferredWorkCities)
      ? raw.preferredWorkCities.filter((city) => typeof city === 'string' && city.trim())
      : [],
    educations: Array.isArray(raw.educations) ? raw.educations : [],
    summary: typeof raw.summary === 'string' ? raw.summary : '',
  }
}

export function readCachedProfile(userId) {
  if (!userId || typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${userId}`)
    if (!raw) return null
    return normalizeCachedProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeCachedProfile(userId, profile) {
  if (!userId || typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(normalizeCachedProfile(profile)))
  } catch {
    // Ignore quota or serialization errors.
  }
}

export function clearCachedProfile(userId) {
  if (!userId || typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(`${CACHE_PREFIX}${userId}`)
  } catch {
    // Ignore storage errors.
  }
}
