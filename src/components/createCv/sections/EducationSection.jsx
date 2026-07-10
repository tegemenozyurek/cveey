import {
  createEmptyEducationItem,
  normalizeCvListSection,
} from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import DateRangeFields from '../shared/DateRangeFields'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function EducationSection({
  value: items,
  onChange,
  t,
  stepNumber = '04',
}) {
  const safeItems = normalizeCvListSection(items, createEmptyEducationItem)

  const updateItem = (index, patch) => {
    const next = safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange(next)
  }

  const addItem = () => onChange([...safeItems, createEmptyEducationItem()])
  const removeItem = (index) => {
    if (safeItems.length <= 1) {
      onChange([createEmptyEducationItem()])
      return
    }
    onChange(safeItems.filter((_, i) => i !== index))
  }

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionEducation')}
        description={t('createCv.sectionEducationDesc')}
      />

      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">
                {t('createCv.educationItem')} {index + 1}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>
                {t('createCv.removeItem')}
              </button>
            </div>

            <div className="create-cv-grid">
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`edu-school-${item.id}`} label={t('createCv.school')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`edu-school-${item.id}`}
                  className="form-input"
                  value={item.school}
                  onChange={(e) => updateItem(index, { school: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`edu-degree-${item.id}`} label={t('createCv.degree')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`edu-degree-${item.id}`}
                  className="form-input"
                  value={item.degree}
                  onChange={(e) => updateItem(index, { degree: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`edu-dept-${item.id}`} label={t('createCv.department')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`edu-dept-${item.id}`}
                  className="form-input"
                  value={item.department}
                  onChange={(e) => updateItem(index, { department: e.target.value })}
                  required
                />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`edu-loc-${item.id}`} label={t('createCv.location')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`edu-loc-${item.id}`}
                  className="form-input"
                  value={item.location}
                  onChange={(e) => updateItem(index, { location: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <FieldLabel
                  htmlFor={`edu-gpa-${item.id}`}
                  label={t('createCv.gpa')}
                  visibility={VISIBILITY.OPTIONAL}
                  t={t}
                />
                <input
                  id={`edu-gpa-${item.id}`}
                  className="form-input"
                  value={item.gpa}
                  onChange={(e) => updateItem(index, { gpa: e.target.value })}
                  placeholder={t('createCv.gpaPlaceholder')}
                />
              </div>
            </div>

            <DateRangeFields
              startId={`edu-start-${item.id}`}
              endId={`edu-end-${item.id}`}
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
              <FieldLabel
                htmlFor={`edu-desc-${item.id}`}
                label={t('createCv.description')}
                visibility={VISIBILITY.OPTIONAL}
                t={t}
              />
              <textarea
                id={`edu-desc-${item.id}`}
                className="form-input form-textarea"
                rows={3}
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
              />
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>
        + {t('createCv.addEducation')}
      </button>
    </div>
  )
}
