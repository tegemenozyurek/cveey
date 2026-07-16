import BulletListEditor from '../shared/BulletListEditor'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import { createEmptyCustomSection, hasCustomSectionContent } from '../../../createCv/cvDocument'

export default function CustomCategorySection({
  value,
  onChange,
  t,
  stepNumber = '01',
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
}) {
  const safe = value && typeof value === 'object'
    ? { ...createEmptyCustomSection(value.id), ...value }
    : createEmptyCustomSection()
  const mode = safe.mode === 'bullets' ? 'bullets' : 'text'
  const hasContent = hasCustomSectionContent(safe)

  const patch = (next) => onChange({ ...safe, ...next })

  return (
    <div className="create-cv-section create-cv-section--custom">
      <div className="create-cv-custom-toolbar">
        <CreateCvSectionHead
          stepNumber={stepNumber}
          title={safe.title.trim() || t('createCv.custom.fallbackTitle')}
          description={t('createCv.custom.sectionDesc')}
        />
        <div className="create-cv-custom-controls">
          <div className="create-cv-reorder-btns">
            <button
              type="button"
              className="create-cv-reorder-btn"
              onClick={onMoveUp}
              disabled={!canMoveUp || !hasContent}
              aria-label={t('createCv.custom.moveUp')}
              title={t('createCv.custom.moveUp')}
            >
              ↑
            </button>
            <button
              type="button"
              className="create-cv-reorder-btn"
              onClick={onMoveDown}
              disabled={!canMoveDown || !hasContent}
              aria-label={t('createCv.custom.moveDown')}
              title={t('createCv.custom.moveDown')}
            >
              ↓
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm create-cv-custom-delete"
            onClick={onDelete}
          >
            {t('createCv.custom.delete')}
          </button>
        </div>
      </div>

      <div className="create-cv-grid">
        <div className="form-field">
          <label className="form-label" htmlFor={`cv-custom-title-${safe.id}`}>
            {t('createCv.custom.titleLabel')}
          </label>
          <input
            id={`cv-custom-title-${safe.id}`}
            className="form-input"
            type="text"
            value={safe.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={t('createCv.custom.titlePlaceholder')}
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor={`cv-custom-subtitle-${safe.id}`}>
            {t('createCv.custom.subtitleLabel')}
          </label>
          <input
            id={`cv-custom-subtitle-${safe.id}`}
            className="form-input"
            type="text"
            value={safe.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            placeholder={t('createCv.custom.subtitlePlaceholder')}
          />
        </div>
      </div>

      <div className="create-cv-skills-mode create-cv-custom-mode">
        <button
          type="button"
          className={`btn btn-ghost btn-sm${mode === 'text' ? ' create-cv-mode-active' : ''}`}
          onClick={() => patch({ mode: 'text' })}
        >
          {t('createCv.custom.modeText')}
        </button>
        <button
          type="button"
          className={`btn btn-ghost btn-sm${mode === 'bullets' ? ' create-cv-mode-active' : ''}`}
          onClick={() => patch({ mode: 'bullets' })}
        >
          {t('createCv.custom.modeBullets')}
        </button>
      </div>

      {mode === 'text' ? (
        <div className="form-field">
          <label className="form-label" htmlFor={`cv-custom-body-${safe.id}`}>
            {t('createCv.custom.bodyLabel')}
          </label>
          <textarea
            id={`cv-custom-body-${safe.id}`}
            className="form-input form-textarea create-cv-textarea"
            value={safe.body}
            onChange={(e) => patch({ body: e.target.value })}
            placeholder={t('createCv.custom.bodyPlaceholder')}
            rows={6}
          />
        </div>
      ) : (
        <BulletListEditor
          idPrefix={`cv-custom-bullets-${safe.id}`}
          label={t('createCv.custom.bulletsLabel')}
          items={safe.bullets}
          onChange={(bullets) => patch({ bullets })}
          placeholder={t('createCv.custom.bulletPlaceholder')}
          addLabel={t('createCv.addBullet')}
          removeLabel={t('createCv.custom.removeBullet')}
          t={t}
        />
      )}
    </div>
  )
}
