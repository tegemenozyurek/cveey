import { createEmptyProjectItem, normalizeCvListSection } from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import DateRangeFields from '../shared/DateRangeFields'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function ProjectsSection({ value: items, onChange, t, stepNumber = '06' }) {
  const safeItems = normalizeCvListSection(items, createEmptyProjectItem)
  const updateItem = (index, patch) => {
    onChange(safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }
  const addItem = () => onChange([...safeItems, createEmptyProjectItem()])
  const removeItem = (index) => {
    onChange(safeItems.length <= 1 ? [createEmptyProjectItem()] : safeItems.filter((_, i) => i !== index))
  }

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionProjects')}
        description={t('createCv.sectionProjectsDesc')}
      />
      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">{t('createCv.projectItem')} {index + 1}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>
                {t('createCv.removeItem')}
              </button>
            </div>
            <div className="create-cv-grid">
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`proj-name-${item.id}`} label={t('createCv.projectName')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`proj-name-${item.id}`} className="form-input" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} required />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`proj-desc-${item.id}`} label={t('createCv.description')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <textarea id={`proj-desc-${item.id}`} className="form-input form-textarea" rows={3} value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`proj-tech-${item.id}`} label={t('createCv.technologies')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input id={`proj-tech-${item.id}`} className="form-input" value={item.technologies} onChange={(e) => updateItem(index, { technologies: e.target.value })} placeholder={t('createCv.technologiesPlaceholder')} required />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`proj-gh-${item.id}`} label={t('createCv.github')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`proj-gh-${item.id}`} className="form-input" type="url" value={item.github} onChange={(e) => updateItem(index, { github: e.target.value })} />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`proj-demo-${item.id}`} label={t('createCv.demo')} visibility={VISIBILITY.OPTIONAL} t={t} />
                <input id={`proj-demo-${item.id}`} className="form-input" type="url" value={item.demo} onChange={(e) => updateItem(index, { demo: e.target.value })} />
              </div>
            </div>
            <DateRangeFields
              startId={`proj-start-${item.id}`}
              endId={`proj-end-${item.id}`}
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
          </article>
        ))}
      </div>
      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>+ {t('createCv.addProject')}</button>
    </div>
  )
}
