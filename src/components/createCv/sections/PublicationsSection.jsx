import { createEmptyPublicationItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import MonthYearSelect from '../shared/MonthYearSelect'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function PublicationsSection({ value: items, onChange, t, stepNumber = '11' }) {
  const safeItems = normalizeCvListSection(items, createEmptyPublicationItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyPublicationItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyPublicationItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionPublications')} description={t('createCv.sectionPublicationsDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.publicationItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`pub-title-${item.id}`} label={t('createCv.publicationTitle')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`pub-title-${item.id}`} className="form-input" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`pub-pub-${item.id}`} label={t('createCv.publisher')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`pub-pub-${item.id}`} className="form-input" value={item.publisher} onChange={(e) => updateItem(index, { publisher: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`pub-date-${item.id}`} label={t('createCv.date')} visibility={VISIBILITY.REQUIRED} t={t} />
                <MonthYearSelect
                  id={`pub-date-${item.id}`}
                  value={item.date}
                  onChange={(date) => updateItem(index, { date })}
                  required
                  t={t}
                />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`pub-url-${item.id}`} label={t('createCv.url')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`pub-url-${item.id}`} className="form-input" type="url" value={item.url} onChange={(e) => updateItem(index, { url: e.target.value })} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addPublication')}</button>
    </div>
  )
}
