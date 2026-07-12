import { createEmptyVolunteerItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import DateRangeFields from '../shared/DateRangeFields'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function VolunteerSection({ value: items, onChange, t, stepNumber = '10' }) {
  const safeItems = normalizeCvListSection(items, createEmptyVolunteerItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyVolunteerItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyVolunteerItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionVolunteer')} description={t('createCv.sectionVolunteerDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.volunteerItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field">
                <FieldLabel htmlFor={`vol-org-${item.id}`} label={t('createCv.organization')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`vol-org-${item.id}`} className="form-input" value={item.organization} onChange={(e) => updateItem(index, { organization: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`vol-role-${item.id}`} label={t('createCv.role')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`vol-role-${item.id}`} className="form-input" value={item.role} onChange={(e) => updateItem(index, { role: e.target.value })} required />
              </div>
            </div>
            <DateRangeFields
              startId={`vol-start-${item.id}`}
              endId={`vol-end-${item.id}`}
              startLabel={t('createCv.startDate')}
              endLabel={t('createCv.endDate')}
              startValue={item.startDate}
              endValue={item.endDate}
              onStartChange={(v) => updateItem(index, { startDate: v })}
              onEndChange={(v) => updateItem(index, { endDate: v })}
              startVisibility={VISIBILITY.REQUIRED}
              endVisibility={VISIBILITY.REQUIRED}
              t={t}
            />
            <div className="form-field create-cv-field--full">
              <FieldLabel htmlFor={`vol-desc-${item.id}`} label={t('createCv.description')} visibility={VISIBILITY.OPTIONAL} t={t} />
              <textarea id={`vol-desc-${item.id}`} className="form-input form-textarea" rows={3} value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addVolunteer')}</button>
    </div>
  )
}
