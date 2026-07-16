import { VISIBILITY } from '../fieldVisibility'
import { formatLinkLabel } from '../utils/previewHelpers'

export function isFieldVisible(fieldVisibility, field) {
  return fieldVisibility?.[field] !== VISIBILITY.HIDDEN
}

export function formatDateRange(start, end, currentlyWorking, t) {
  if (!start?.trim() && !end?.trim()) return ''
  const startLabel = start?.trim() || '—'
  const endLabel = currentlyWorking ? t('createCv.preview.present') : (end?.trim() || '—')
  return `${startLabel} – ${endLabel}`
}

export function linkLabel(url) {
  return formatLinkLabel(url)
}

export function nonEmptyLines(items) {
  return (items || []).map((item) => String(item || '').trim()).filter(Boolean)
}
