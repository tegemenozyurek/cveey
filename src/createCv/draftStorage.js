import { normalizeCvDocument, prefillEmail } from './cvDocument'

const DRAFT_VERSION = 1

function getDraftKey(userId) {
  return `cveey:create-cv:draft:${userId}`
}

export function loadCvDraft(userId, email = '') {
  if (!userId || typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(getDraftKey(userId))
    if (!raw) return null
    const saved = JSON.parse(raw)
    return prefillEmail(normalizeCvDocument(saved?.document || saved, email), email)
  } catch {
    return null
  }
}

export function saveCvDraft(userId, document) {
  if (!userId || typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(getDraftKey(userId), JSON.stringify({
      version: DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      document: normalizeCvDocument(document),
    }))
    return true
  } catch {
    return false
  }
}
