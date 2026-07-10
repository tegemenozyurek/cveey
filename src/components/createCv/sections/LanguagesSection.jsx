import { createEmptyLanguageItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function LanguagesSection({ value: items, onChange, t, stepNumber = '08' }) {
  const safeItems = normalizeCvListSection(items, createEmptyLanguageItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyLanguageItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyLanguageItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionLanguages')} description={t('createCv.sectionLanguagesDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card create-cv-language-row">
            <div className="form-field">
              <FieldLabel htmlFor={`lang-name-${item.id}`} label={t('createCv.language')} visibility={VISIBILITY.REQUIRED} t={t} />
              <input id={`lang-name-${item.id}`} className="form-input" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} placeholder={t('createCv.languageNamePlaceholder')} required />
            </div>
            <div className="form-field">
              <FieldLabel htmlFor={`lang-level-${item.id}`} label={t('createCv.proficiency')} visibility={VISIBILITY.REQUIRED} t={t} />
              <input id={`lang-level-${item.id}`} className="form-input" value={item.level} onChange={(e) => updateItem(index, { level: e.target.value })} placeholder={t('createCv.proficiencyPlaceholder')} required />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addLanguage')}</button>
    </div>
  )
}
