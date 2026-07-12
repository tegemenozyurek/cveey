import { formatLinkLabel, displayValue } from '../../utils/previewHelpers'
import { VISIBILITY } from '../../fieldVisibility'

export function formatDateRange(start, end, currentlyWorking, t) {
  if (!start?.trim() && !end?.trim()) return ''
  const startLabel = start?.trim() || '—'
  const endLabel = currentlyWorking ? t('createCv.preview.present') : (end?.trim() || '—')
  return `${startLabel} – ${endLabel}`
}

export function renderBullets(items, className = 'cv-preview-bullets') {
  const filled = items?.filter((item) => item?.trim()) || []
  if (!filled.length) return null
  return (
    <ul className={className}>
      {filled.map((item, index) => (
        <li key={index}>{item.trim()}</li>
      ))}
    </ul>
  )
}

export function PreviewSection({ title, children, className = '' }) {
  if (!children) return null
  return (
    <section className={`cv-preview-section ${className}`.trim()}>
      {title && <h2 className="cv-preview-section-title">{title}</h2>}
      {children}
    </section>
  )
}

export function PreviewExperience({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) =>
    item.company?.trim() || item.position?.trim() || item.bullets?.some((b) => b?.trim()),
  ) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.experienceHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head">
            <strong>{displayValue(item.position, t('createCv.preview.positionPlaceholder'))}</strong>
            {item.company?.trim() && <span className="cv-preview-entry-at"> @ {item.company.trim()}</span>}
          </div>
          <p className="cv-preview-entry-meta">
            {[item.location?.trim(), formatDateRange(item.startDate, item.endDate, item.currentlyWorking, t)]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {renderBullets(item.bullets)}
          {item.achievements?.some((a) => a?.trim()) && (
            <>
              <p className="cv-preview-subheading">{t('createCv.achievements')}</p>
              {renderBullets(item.achievements)}
            </>
          )}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewEducation({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.school?.trim() || item.degree?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.educationHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head">
            <strong>{displayValue(item.degree, t('createCv.preview.degreePlaceholder'))}</strong>
            {item.school?.trim() && <span className="cv-preview-entry-at"> — {item.school.trim()}</span>}
          </div>
          <p className="cv-preview-entry-meta">
            {[
              item.department?.trim(),
              item.location?.trim(),
              formatDateRange(item.startDate, item.endDate, false, t),
              item.gpa?.trim() && `${t('createCv.gpa')}: ${item.gpa.trim()}`,
            ].filter(Boolean).join(' · ')}
          </p>
          {item.description?.trim() && <p className="cv-preview-entry-text">{item.description.trim()}</p>}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewSkills({ skills, t, compact = false, showHeading = true }) {
  if (!skills) return null

  if (skills.mode === 'rated') {
    const filled = skills.rated?.filter((item) => item.name?.trim()) || []
    if (!filled.length) return null
    return (
      <PreviewSection title={showHeading ? t('createCv.preview.skillsHeading') : null}>
        <ul className={`cv-preview-rated-skills${compact ? ' cv-preview-rated-skills--compact' : ''}`}>
          {filled.map((item) => (
            <li key={item.id}>
              <span>{item.name.trim()}</span>
              <span className="cv-preview-stars" aria-hidden="true">
                {'★'.repeat(item.level)}{'☆'.repeat(5 - item.level)}
              </span>
            </li>
          ))}
        </ul>
      </PreviewSection>
    )
  }

  const filled = skills.categories?.filter((cat) =>
    cat.name?.trim() || cat.skills?.some((s) => s?.trim()),
  ) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.skillsHeading') : null}>
      {filled.map((category) => (
        <div key={category.id} className="cv-preview-skill-category">
          {category.name?.trim() && (
            <p className="cv-preview-subheading">{category.name.trim()}</p>
          )}
          <p className="cv-preview-skill-list">
            {category.skills.filter((s) => s?.trim()).join(' · ')}
          </p>
        </div>
      ))}
    </PreviewSection>
  )
}

export function PreviewProjects({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.name?.trim() || item.description?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.projectsHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head">
            <strong>{item.name.trim()}</strong>
          </div>
          <p className="cv-preview-entry-meta">
            {[
              formatDateRange(item.startDate, item.endDate, false, t),
              item.technologies?.trim(),
            ].filter(Boolean).join(' · ')}
          </p>
          {item.description?.trim() && <p className="cv-preview-entry-text">{item.description.trim()}</p>}
          <p className="cv-preview-entry-links">
            {item.github?.trim() && `GitHub: ${formatLinkLabel(item.github)}`}
            {item.demo?.trim() && ` · Demo: ${formatLinkLabel(item.demo)}`}
          </p>
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewCertifications({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.name?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.certificationsHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head"><strong>{item.name.trim()}</strong></div>
          <p className="cv-preview-entry-meta">
            {[item.issuer?.trim(), item.issueDate?.trim()].filter(Boolean).join(' · ')}
          </p>
          {item.credentialUrl?.trim() && (
            <p className="cv-preview-entry-links">{formatLinkLabel(item.credentialUrl)}</p>
          )}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewLanguages({ items, t, showHeading = true }) {
  const filled = items?.filter((item) => item.name?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.languagesHeading') : null}>
      <ul className="cv-preview-inline-list">
        {filled.map((item) => (
          <li key={item.id}>
            {item.name.trim()}{item.level?.trim() ? ` — ${item.level.trim()}` : ''}
          </li>
        ))}
      </ul>
    </PreviewSection>
  )
}

export function PreviewAwards({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.title?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.awardsHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head"><strong>{item.title.trim()}</strong></div>
          <p className="cv-preview-entry-meta">{[item.issuer?.trim(), item.date?.trim()].filter(Boolean).join(' · ')}</p>
          {item.description?.trim() && <p className="cv-preview-entry-text">{item.description.trim()}</p>}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewVolunteer({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.organization?.trim() || item.role?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.volunteerHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head">
            <strong>{displayValue(item.role, t('createCv.role'))}</strong>
            {item.organization?.trim() && <span className="cv-preview-entry-at"> @ {item.organization.trim()}</span>}
          </div>
          <p className="cv-preview-entry-meta">
            {formatDateRange(item.startDate, item.endDate, false, t)}
          </p>
          {item.description?.trim() && <p className="cv-preview-entry-text">{item.description.trim()}</p>}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewPublications({ items, t, compact = false, showHeading = true }) {
  const filled = items?.filter((item) => item.title?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.publicationsHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className={`cv-preview-entry${compact ? ' cv-preview-entry--compact' : ''}`}>
          <div className="cv-preview-entry-head"><strong>{item.title.trim()}</strong></div>
          <p className="cv-preview-entry-meta">
            {[item.publisher?.trim(), item.date?.trim()].filter(Boolean).join(' · ')}
          </p>
          {item.url?.trim() && <p className="cv-preview-entry-links">{formatLinkLabel(item.url)}</p>}
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewReferences({ items, t, showHeading = true }) {
  const filled = items?.filter((item) => item.name?.trim()) || []
  if (!filled.length) return null

  return (
    <PreviewSection title={showHeading ? t('createCv.preview.referencesHeading') : null}>
      {filled.map((item) => (
        <article key={item.id} className="cv-preview-entry">
          <div className="cv-preview-entry-head"><strong>{item.name.trim()}</strong></div>
          <p className="cv-preview-entry-meta">
            {[item.title?.trim(), item.company?.trim(), item.phone?.trim(), item.email?.trim()]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </article>
      ))}
    </PreviewSection>
  )
}

export function PreviewPersonalHeader({
  personal,
  t,
  className = '',
  fieldVisibility = {},
}) {
  const isVisible = (field) => fieldVisibility[field] !== VISIBILITY.HIDDEN
  const name = displayValue(personal.fullName, t('createCv.preview.namePlaceholder'))
  const title = displayValue(personal.jobTitle, t('createCv.preview.titlePlaceholder'))
  const hasName = Boolean(personal.fullName?.trim())

  const contactItems = [
    isVisible('email') && personal.email?.trim(),
    isVisible('phone') && personal.phone?.trim(),
    isVisible('location') && personal.location?.trim(),
  ].filter(Boolean)

  const linkDefs = [
    { key: 'linkedin', href: personal.linkedin },
    { key: 'github', href: personal.github },
    { key: 'stackoverflow', href: personal.stackoverflow },
    { key: 'portfolio', href: personal.portfolio },
    { key: 'behance', href: personal.behance },
    { key: 'dribbble', href: personal.dribbble },
  ].filter((item) => isVisible(item.key) && item.href?.trim())

  const metaFields = [
    'dateOfBirth',
    'drivingLicense',
    'licenseClass',
    'adrCertificate',
    'drivingExperience',
    'medicalLicense',
    'specialty',
    'residency',
    'teachingSubjects',
    'teachingCertificate',
    'accountingSoftware',
    'taxExperience',
    'flightHours',
    'aircraftTypes',
    'pilotLicense',
    'clinicalExperience',
    'nurseCertifications',
    'salesTarget',
    'crmExperience',
    'cuisineTypes',
    'michelinExperience',
    'pmp',
    'autocad',
    'sap2000',
    'adobeSkills',
  ]
  const extraMeta = metaFields
    .filter((field) => isVisible(field) && personal[field]?.trim())
    .map((field) => `${t(`createCv.${field}`)}: ${personal[field].trim()}`)

  if (
    isVisible('militaryStatus')
    && personal.militaryStatus
    && personal.militaryStatus !== 'notApplicable'
  ) {
    extraMeta.push(
      `${t('createCv.militaryStatus')}: ${t(`createCv.military.${personal.militaryStatus}`)}`,
    )
  }

  return (
    <header className={`cv-preview-header ${className}`.trim()}>
      <div className="cv-preview-header-text">
        <h1 className={`cv-preview-name${hasName ? '' : ' cv-preview-name--placeholder'}`}>{name}</h1>
        <p className={`cv-preview-title${personal.jobTitle?.trim() ? '' : ' cv-preview-title--placeholder'}`}>{title}</p>
        {contactItems.length > 0 ? (
          <p className="cv-preview-contact">{contactItems.join(' · ')}</p>
        ) : (
          <p className="cv-preview-contact cv-preview-contact--placeholder">{t('createCv.preview.contactPlaceholder')}</p>
        )}
        {linkDefs.length > 0 && (
          <ul className="cv-preview-links">
            {linkDefs.map((item) => (
              <li key={item.key}>
                <span className="cv-preview-link-label">{t(`createCv.${item.key}`)}:</span>{' '}
                {formatLinkLabel(item.href)}
              </li>
            ))}
          </ul>
        )}
        {extraMeta.length > 0 && <div className="cv-preview-meta">{extraMeta.map((line, i) => <span key={i}>{line}</span>)}</div>}
      </div>
    </header>
  )
}

export function PreviewSidebarPanel({
  personal,
  content,
  sidebar,
  t,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const visibleSections = new Set(visibleSectionIds)
  const isVisible = (field) => fieldVisibility[field] !== VISIBILITY.HIDDEN
  const languages = content.languages?.filter((l) => l.name?.trim()) || []
  const categories = content.skills?.categories?.filter((c) => c.skills?.some((s) => s?.trim())) || []
  const ratedSkills = content.skills?.rated?.filter((item) => item.name?.trim()) || []
  const certs = content.certifications?.filter((c) => c.name?.trim()) || []
  const highlights = sidebar?.highlights?.filter((h) => h?.trim()) || []

  return (
    <aside className="cv-preview-sidebar">
      {sidebar?.headline?.trim() && (
        <p className="cv-preview-sidebar-headline">{sidebar.headline.trim()}</p>
      )}

      <div className="cv-preview-sidebar-block">
        <h3 className="cv-preview-sidebar-title">{t('createCv.preview.contactHeading')}</h3>
        <ul className="cv-preview-sidebar-list">
          {isVisible('email') && personal.email?.trim() && <li>{personal.email.trim()}</li>}
          {isVisible('phone') && personal.phone?.trim() && <li>{personal.phone.trim()}</li>}
          {isVisible('location') && personal.location?.trim() && <li>{personal.location.trim()}</li>}
          {isVisible('linkedin') && personal.linkedin?.trim() && <li>{formatLinkLabel(personal.linkedin)}</li>}
          {isVisible('github') && personal.github?.trim() && <li>{formatLinkLabel(personal.github)}</li>}
        </ul>
      </div>

      {highlights.length > 0 && (
        <div className="cv-preview-sidebar-block">
          <h3 className="cv-preview-sidebar-title">{t('createCv.sidebarHighlights')}</h3>
          <ul className="cv-preview-sidebar-list">
            {highlights.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      )}

      {visibleSections.has('skills') && content.skills?.mode !== 'rated' && categories.length > 0 && (
        <div className="cv-preview-sidebar-block">
          <h3 className="cv-preview-sidebar-title">{t('createCv.preview.skillsHeading')}</h3>
          {categories.map((cat) => (
            <div key={cat.id}>
              {cat.name?.trim() && <p className="cv-preview-sidebar-sub">{cat.name.trim()}</p>}
              <p className="cv-preview-sidebar-text">
                {cat.skills.filter((s) => s?.trim()).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {visibleSections.has('skills') && content.skills?.mode === 'rated' && ratedSkills.length > 0 && (
        <div className="cv-preview-sidebar-block">
          <h3 className="cv-preview-sidebar-title">{t('createCv.preview.skillsHeading')}</h3>
          <ul className="cv-preview-sidebar-list">
            {ratedSkills.map((item) => (
              <li key={item.id}>
                {item.name.trim()} — {'★'.repeat(Math.min(5, Math.max(1, Number(item.level) || 1)))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {visibleSections.has('languages') && languages.length > 0 && (
        <div className="cv-preview-sidebar-block">
          <h3 className="cv-preview-sidebar-title">{t('createCv.preview.languagesHeading')}</h3>
          <ul className="cv-preview-sidebar-list">
            {languages.map((lang) => (
              <li key={lang.id}>{lang.name.trim()}{lang.level?.trim() ? ` — ${lang.level.trim()}` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      {visibleSections.has('certifications') && certs.length > 0 && (
        <div className="cv-preview-sidebar-block">
          <h3 className="cv-preview-sidebar-title">{t('createCv.preview.certificationsHeading')}</h3>
          <ul className="cv-preview-sidebar-list">
            {certs.map((cert) => <li key={cert.id}>{cert.name.trim()}</li>)}
          </ul>
        </div>
      )}

      {sidebar?.note?.trim() && (
        <div className="cv-preview-sidebar-block">
          <p className="cv-preview-sidebar-text">{sidebar.note.trim()}</p>
        </div>
      )}
    </aside>
  )
}

export function PreviewMainSections({ content, t, compact = false, excludeInSidebar = false }) {
  const { summary, experience, education, skills, projects, certifications, languages, awards, volunteer, publications, references } = content

  const summaryText = summary?.trim() ? summary.trim() : t('createCv.preview.summaryPlaceholder')

  return (
    <>
      <PreviewSection title={t('createCv.preview.summaryHeading')}>
        <p className={`cv-preview-summary${summary?.trim() ? '' : ' cv-preview-summary--placeholder'}`}>{summaryText}</p>
      </PreviewSection>
      <PreviewExperience items={experience} t={t} compact={compact} />
      <PreviewEducation items={education} t={t} compact={compact} />
      {!excludeInSidebar && <PreviewSkills skills={skills} t={t} compact={compact} />}
      <PreviewProjects items={projects} t={t} compact={compact} />
      {!excludeInSidebar && <PreviewCertifications items={certifications} t={t} compact={compact} />}
      {!excludeInSidebar && <PreviewLanguages items={languages} t={t} />}
      <PreviewAwards items={awards} t={t} compact={compact} />
      <PreviewVolunteer items={volunteer} t={t} compact={compact} />
      <PreviewPublications items={publications} t={t} compact={compact} />
      <PreviewReferences items={references} t={t} />
    </>
  )
}
