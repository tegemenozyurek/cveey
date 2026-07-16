import { createEmptyCertificationItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import MonthYearSelect from '../shared/MonthYearSelect'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function CertificationsSection({ value: items, onChange, t, stepNumber = '07' }) {
  const safeItems = normalizeCvListSection(items, createEmptyCertificationItem)
  const updateItem = (index, patch) => onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const addItem = () => onChange([...safeItems, createEmptyCertificationItem()])
  const removeItem = (index) => onChange(safeItems.length <= 1 ? [createEmptyCertificationItem()] : safeItems.filter((_, i) => i !== index))

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead stepNumber={stepNumber} title={t('createCv.sectionCertifications')} description={t('createCv.sectionCertificationsDesc')} />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.certificationItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>{t('createCv.removeItem')}</button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`cert-name-${item.id}`} label={t('createCv.certificateName')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`cert-name-${item.id}`} className="form-input" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`cert-issuer-${item.id}`} label={t('createCv.issuer')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`cert-issuer-${item.id}`} className="form-input" value={item.issuer} onChange={(e) => updateItem(index, { issuer: e.target.value })} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`cert-date-${item.id}`} label={t('createCv.issueDate')} visibility={VISIBILITY.REQUIRED} t={t} />
                <MonthYearSelect
                  id={`cert-date-${item.id}`}
                  value={item.issueDate}
                  onChange={(issueDate) => updateItem(index, { issueDate })}
                  required
                  t={t}
                />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`cert-url-${item.id}`} label={t('createCv.credentialUrl')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`cert-url-${item.id}`} className="form-input" type="url" value={item.credentialUrl} onChange={(e) => updateItem(index, { credentialUrl: e.target.value })} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addCertification')}</button>
    </div>
  )
}
