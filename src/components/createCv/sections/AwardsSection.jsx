import { createEmptyAwardItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function AwardsSection({ value: items, onChange, t, stepNumber = '09' }) {
  const safeItems = normalizeCvListSection(items, createEmptyAwardItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyAwardItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyAwardItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionAwards')} description={t('createCv.sectionAwardsDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.awardItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`award-title-${item.id}`} label={t('createCv.awardTitle')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`award-title-${item.id}`} className="form-input" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`award-issuer-${item.id}`} label={t('createCv.issuer')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`award-issuer-${item.id}`} className="form-input" value={item.issuer} onChange={(e) => updateItem(index, { issuer: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`award-date-${item.id}`} label={t('createCv.date')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`award-date-${item.id}`} className="form-input" type="month" value={item.date} onChange={(e) => updateItem(index, { date: e.target.value })} required />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`award-desc-${item.id}`} label={t('createCv.description')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <textarea id={`award-desc-${item.id}`} className="form-input form-textarea" rows={2} value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addAward')}</button>
    </div>
  )
}
