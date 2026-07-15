import {
  createEmptyRatedSkill,
  createEmptySkillCategory,
  createEmptySkills,
} from '../../../createCv/cvDocument'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import StarRating from '../shared/StarRating'
import { VISIBILITY } from '../../../createCv/fieldVisibility'

export default function SkillsSection({
  value: skills,
  onChange,
  t,
  stepNumber = '05',
  mode: defaultMode = 'categories',
}) {
  const defaults = createEmptySkills()
  const source = skills && typeof skills === 'object' ? skills : defaults
  const categories = Array.isArray(source.categories) && source.categories.length > 0
    ? source.categories.map((category) => {
      const fallback = createEmptySkillCategory()
      return {
        ...fallback,
        ...(category && typeof category === 'object' ? category : {}),
        skills: Array.isArray(category?.skills) && category.skills.length > 0
          ? category.skills
          : [''],
      }
    })
    : defaults.categories
  const rated = Array.isArray(source.rated) && source.rated.length > 0
    ? source.rated.map((item) => ({
      ...createEmptyRatedSkill(),
      ...(item && typeof item === 'object' ? item : {}),
    }))
    : defaults.rated
  const mode = source.mode === 'rated' || source.mode === 'categories'
    ? source.mode
    : defaultMode === 'rated' ? 'rated' : 'categories'
  const safeSkills = { ...defaults, ...source, mode, categories, rated }
  const isRated = mode === 'rated'

  const setMode = (nextMode) => onChange({ ...safeSkills, mode: nextMode })

  const updateCategory = (index, patch) => {
    const nextCategories = categories.map((cat, i) => (i === index ? { ...cat, ...patch } : cat))
    onChange({ ...safeSkills, categories: nextCategories })
  }

  const updateCategorySkill = (catIndex, skillIndex, value) => {
    const nextCategories = categories.map((cat, i) => {
      if (i !== catIndex) return cat
      const nextSkills = [...cat.skills]
      nextSkills[skillIndex] = value
      return { ...cat, skills: nextSkills }
    })
    onChange({ ...safeSkills, categories: nextCategories })
  }

  const addCategorySkill = (catIndex) => {
    const nextCategories = categories.map((cat, i) => (
      i === catIndex ? { ...cat, skills: [...cat.skills, ''] } : cat
    ))
    onChange({ ...safeSkills, categories: nextCategories })
  }

  const removeCategorySkill = (catIndex, skillIndex) => {
    const nextCategories = categories.map((cat, i) => {
      if (i !== catIndex) return cat
      const nextSkills = cat.skills.filter((_, j) => j !== skillIndex)
      return { ...cat, skills: nextSkills.length ? nextSkills : [''] }
    })
    onChange({ ...safeSkills, categories: nextCategories })
  }

  const addCategory = () => {
    onChange({ ...safeSkills, categories: [...categories, createEmptySkillCategory()] })
  }

  const removeCategory = (index) => {
    const nextCategories = categories.length <= 1
      ? [createEmptySkillCategory()]
      : categories.filter((_, i) => i !== index)
    onChange({ ...safeSkills, categories: nextCategories })
  }

  const updateRated = (index, patch) => {
    const nextRated = rated.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange({ ...safeSkills, rated: nextRated })
  }

  const addRated = () => onChange({ ...safeSkills, rated: [...rated, createEmptyRatedSkill()] })
  const removeRated = (index) => {
    const nextRated = rated.length <= 1
      ? [createEmptyRatedSkill()]
      : rated.filter((_, i) => i !== index)
    onChange({ ...safeSkills, rated: nextRated })
  }

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionSkills')}
        description={t('createCv.sectionSkillsDesc')}
      />

      <div className="create-cv-skills-mode">
        <button
          type="button"
          className={`btn btn-sm${!isRated ? ' btn-ghost create-cv-mode-active' : ' btn-ghost'}`}
          onClick={() => setMode('categories')}
        >
          {t('createCv.skillsModeCategories')}
        </button>
        <button
          type="button"
          className={`btn btn-sm${isRated ? ' btn-ghost create-cv-mode-active' : ' btn-ghost'}`}
          onClick={() => setMode('rated')}
        >
          {t('createCv.skillsModeRated')}
        </button>
      </div>

      {!isRated ? (
        <>
          <div className="create-cv-repeater">
          {categories.map((category, catIndex) => (
            <article key={category.id} className="create-cv-repeater-card create-cv-skill-category-card">
              <div className="create-cv-repeater-card-head">
                <h3 className="create-cv-repeater-card-title">{t('createCv.skillCategory')} {catIndex + 1}</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeCategory(catIndex)}>
                  {t('createCv.removeItem')}
                </button>
              </div>
              <div className="form-field create-cv-field--full">
                <FieldLabel
                  htmlFor={`skill-cat-${category.id}`}
                  label={t('createCv.categoryName')}
                  visibility={VISIBILITY.REQUIRED}
                  t={t}
                />
                <input
                  id={`skill-cat-${category.id}`}
                  className="form-input"
                  value={category.name}
                  onChange={(e) => updateCategory(catIndex, { name: e.target.value })}
                  placeholder={t('createCv.categoryNamePlaceholder')}
                  required
                />
              </div>
              <ul className="create-cv-bullet-items">
                {category.skills.map((skill, skillIndex) => (
                  <li key={`${category.id}-${skillIndex}`} className="create-cv-bullet-item">
                    <span className="create-cv-bullet-marker" aria-hidden="true">•</span>
                    <input
                      className="form-input"
                      value={skill}
                      onChange={(e) => updateCategorySkill(catIndex, skillIndex, e.target.value)}
                      placeholder={t('createCv.skillPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm create-cv-item-remove"
                      onClick={() => removeCategorySkill(catIndex, skillIndex)}
                      aria-label={t('createCv.removeItem')}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => addCategorySkill(catIndex)}>
                + {t('createCv.addSkill')}
              </button>
            </article>
          ))}
          </div>
          <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addCategory}>
            + {t('createCv.addCategory')}
          </button>
        </>
      ) : (
        <>
          <div className="create-cv-repeater">
          {rated.map((item, index) => (
            <article key={item.id} className="create-cv-repeater-card create-cv-rated-skill-row">
              <div className="form-field create-cv-rated-skill-name">
                <FieldLabel htmlFor={`rated-${item.id}`} label={t('createCv.skill')} visibility={VISIBILITY.REQUIRED} t={t} />
                <input
                  id={`rated-${item.id}`}
                  className="form-input"
                  value={item.name}
                  onChange={(e) => updateRated(index, { name: e.target.value })}
                  placeholder={t('createCv.skillExamplePlaceholder')}
                  required
                />
              </div>
              <div className="form-field create-cv-rated-skill-level">
                <FieldLabel label={t('createCv.level')} visibility={VISIBILITY.REQUIRED} t={t} />
                <StarRating value={item.level} onChange={(level) => updateRated(index, { level })} />
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRated(index)}>
                {t('createCv.removeItem')}
              </button>
            </article>
          ))}
          </div>
          <button type="button" className="btn btn-ghost create-cv-add-card" onClick={addRated}>
            + {t('createCv.addSkill')}
          </button>
        </>
      )}
    </div>
  )
}
