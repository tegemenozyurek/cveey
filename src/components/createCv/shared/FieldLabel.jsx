import { isFieldRequired, VISIBILITY } from '../../../createCv/fieldVisibility'

export default function FieldLabel({ htmlFor, label, visibility, t }) {
  return (
    <label className="form-label" htmlFor={htmlFor}>
      {label}
      {t && visibility === VISIBILITY.REQUIRED && (
        <span className="create-cv-required-tag">{t('createCv.required')}</span>
      )}
      {t && visibility === VISIBILITY.OPTIONAL && (
        <span className="create-cv-optional-tag">{t('createCv.optional')}</span>
      )}
    </label>
  )
}

export function isVisible(visibility) {
  return visibility !== VISIBILITY.HIDDEN
}

export function fieldIsRequired(visibility) {
  return isFieldRequired(visibility)
}
