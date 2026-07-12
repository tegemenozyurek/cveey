import BulletListEditor from '../shared/BulletListEditor'
import CreateCvSectionHead from '../shared/CreateCvSectionHead'
import FieldLabel from '../shared/FieldLabel'
import { VISIBILITY } from '../../../createCv/fieldVisibility'
import { createEmptySidebar } from '../../../createCv/cvDocument'

export default function SidebarSection({
  value: sidebar,
  onChange,
  t,
  stepNumber = '13',
}) {
  const defaults = createEmptySidebar()
  const safeSidebar = {
    ...defaults,
    ...(sidebar && typeof sidebar === 'object' ? sidebar : {}),
    highlights: Array.isArray(sidebar?.highlights) && sidebar.highlights.length > 0
      ? sidebar.highlights
      : defaults.highlights,
  }
  const set = (field, nextValue) => onChange({ ...safeSidebar, [field]: nextValue })

  return (
    <div className="create-cv-section">
      <CreateCvSectionHead
        stepNumber={stepNumber}
        title={t('createCv.sectionSidebar')}
        description={t('createCv.sectionSidebarDesc')}
      />

      <div className="create-cv-grid">
        <div className="form-field create-cv-field--full">
          <FieldLabel htmlFor="sidebar-headline" label={t('createCv.sidebarHeadline')} t={t} />
          <input
            id="sidebar-headline"
            className="form-input"
            value={safeSidebar.headline}
            onChange={(e) => set('headline', e.target.value)}
            placeholder={t('createCv.sidebarHeadlinePlaceholder')}
          />
        </div>
      </div>

      <BulletListEditor
        idPrefix="sidebar-highlights"
        label={t('createCv.sidebarHighlights')}
        items={safeSidebar.highlights}
        onChange={(highlights) => set('highlights', highlights)}
        placeholder={t('createCv.sidebarHighlightPlaceholder')}
        addLabel={t('createCv.addBullet')}
        removeLabel={t('createCv.removeItem')}
      />

      <div className="form-field create-cv-field--full">
        <FieldLabel
          htmlFor="sidebar-note"
          label={t('createCv.sidebarNote')}
          visibility={VISIBILITY.OPTIONAL}
          t={t}
        />
        <textarea
          id="sidebar-note"
          className="form-input form-textarea"
          rows={3}
          value={safeSidebar.note}
          onChange={(e) => set('note', e.target.value)}
          placeholder={t('createCv.sidebarNotePlaceholder')}
        />
        <p className="create-cv-field-hint">{t('createCv.sidebarHint')}</p>
      </div>
    </div>
  )
}
