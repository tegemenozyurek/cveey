import { createEmptyExperienceItem } from '../../../createCv/cvDocument'
import BulletListEditor from '../shared/BulletListEditor'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import DateRangeFields from '../shared/DateRangeFields'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function ExperienceSection({
  value: items,
  onChange,
  t,
  stepNumber = '03',
}) {
  const safeItems = Array.isArray(items) && items.length > 0
    ? items.map((item) => {
      const fallback = createEmptyExperienceItem()
      const source = item && typeof item === 'object' ? item : {}
      return {
        ...fallback,
        ...source,
        bullets: Array.isArray(source.bullets) && source.bullets.length > 0
          ? source.bullets
          : [''],
        achievements: Array.isArray(source.achievements) && source.achievements.length > 0
          ? source.achievements
          : [''],
      }
    })
    : [createEmptyExperienceItem()]

  const updateItem = (index, patch) => {
    const next = safeItems.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange(next)
  }

  const addItem = () => onChange([...safeItems, createEmptyExperienceItem()])

  const removeItem = (index) => {
    if (safeItems.length <= 1) {
      onChange([createEmptyExperienceItem()])
      return
    }
    onChange(safeItems.filter((_, i) => i !== index))
  }

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionExperience')}
        description={t('createCv.sectionExperienceDesc')}
      />

      <div className="create-cv-repeater">
        {safeItems.map((item, index) => (
          <article key={item.id} className="create-cv-repeater-card">
            <div className="create-cv-repeater-card-head">
              <h3 className="create-cv-repeater-card-title">
                {t('createCv.experienceItem')} {index + 1}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeItem(index)}
              >
                {t('createCv.removeItem')}
              </button>
            </div>

            <div className="create-cv-grid">
              <div className="form-field">
                <FieldLabel htmlFor={`exp-company-${item.id}`} label={t('createCv.company')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`exp-company-${item.id}`}
                  className="form-input"
                  value={item.company}
                  onChange={(e) => updateItem(index, { company: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <FieldLabel htmlFor={`exp-position-${item.id}`} label={t('createCv.position')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`exp-position-${item.id}`}
                  className="form-input"
                  value={item.position}
                  onChange={(e) => updateItem(index, { position: e.target.value })}
                  required
                />
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel htmlFor={`exp-location-${item.id}`} label={t('createCv.location')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`exp-location-${item.id}`}
                  className="form-input"
                  value={item.location}
                  onChange={(e) => updateItem(index, { location: e.target.value })}
                  required
                />
              </div>
            </div>

            <DateRangeFields
              startId={`exp-start-${item.id}`}
              endId={`exp-end-${item.id}`}
              startLabel={t('createCv.startDate')}
              endLabel={t('createCv.endDate')}
              startValue={item.startDate}
              endValue={item.endDate}
              onStartChange={(v) => updateItem(index, { startDate: v })}
              onEndChange={(v) => updateItem(index, { endDate: v })}
              currentlyWorking={item.currentlyWorking}
              onCurrentlyWorkingChange={(v) => updateItem(index, { currentlyWorking: v, endDate: v ? '' : item.endDate })}
              currentlyWorkingLabel={t('createCv.currentlyWorking')}
              endDisabled={item.currentlyWorking}
              startVisibility={VISIBILITY.REQUIRED}
              endVisibility={item.currentlyWorking ? VISIBILITY.OPTIONAL : VISIBILITY.REQUIRED}
              t={t}
            />

            <BulletListEditor
              idPrefix={`exp-bullets-${item.id}`}
              label={t('createCv.descriptionBullets')}
              items={item.bullets}
              onChange={(bullets) => updateItem(index, { bullets })}
              placeholder={t('createCv.bulletPlaceholder')}
              addLabel={t('createCv.addBullet')}
              removeLabel={t('createCv.removeItem')}
              visibility={VISIBILITY.REQUIRED}
              t={t}
            />

            <BulletListEditor
              idPrefix={`exp-ach-${item.id}`}
              label={t('createCv.achievements')}
              items={item.achievements}
              onChange={(achievements) => updateItem(index, { achievements })}
              placeholder={t('createCv.achievementPlaceholder')}
              addLabel={t('createCv.addBullet')}
              removeLabel={t('createCv.removeItem')}
              visibility={VISIBILITY.OPTIONAL}
              t={t}
            />
          </article>
        ))}
      </div>

      <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addItem}>
        + {t('createCv.addExperience')}
      </button>
    </div>
  )
}
