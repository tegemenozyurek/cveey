import { createEmptyReferenceItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function ReferencesSection({ value: items, onChange, t, stepNumber = '12' }) {
  const safeItems = normalizeCvListSection(items, createEmptyReferenceItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyReferenceItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyReferenceItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionReferences')} description={t('createCv.sectionReferencesDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.referenceItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field">
                <FieldLabel htmlFor={`ref-name-${item.id}`} label={t('createCv.referenceName')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`ref-name-${item.id}`} className="form-input" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`ref-title-${item.id}`} label={t('createCv.referenceTitle')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`ref-title-${item.id}`} className="form-input" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} required />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`ref-company-${item.id}`} label={t('createCv.company')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`ref-company-${item.id}`} className="form-input" value={item.company} onChange={(e) => updateItem(index, { company: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`ref-phone-${item.id}`} label={t('createCv.phone')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`ref-phone-${item.id}`} className="form-input" type="tel" value={item.phone} onChange={(e) => updateItem(index, { phone: e.target.value })} />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`ref-email-${item.id}`} label={t('createCv.email')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`ref-email-${item.id}`} className="form-input" type="email" value={item.email} onChange={(e) => updateItem(index, { email: e.target.value })} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addReference')}</button>
    </div>
  )
}
