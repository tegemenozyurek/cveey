import {
  PreviewAwards,
  PreviewCertifications,
  PreviewEducation,
  PreviewExperience,
  PreviewLanguages,
  PreviewPersonalHeader,
  PreviewProjects,
  PreviewPublications,
  PreviewReferences,
  PreviewSection,
  PreviewSidebarPanel,
  PreviewSkills,
  PreviewVolunteer,
  renderBullets,
} from './previewBlocks'
import { CV_ALL_SECTION_IDS } from '../../fieldVisibility'
import { hasCustomSectionContent, isCustomSectionId } from '../../cvDocument'

function pushGroupedItems(blocks, {
  sectionId,
  items,
  isFilled,
  render,
}) {
  const filled = (Array.isArray(items) ? items : []).filter(isFilled)
  filled.forEach((item, index) => {
    blocks.push({
      id: `${sectionId}-${item.id || index}`,
      groupId: sectionId,
      render: () => render(item, index === 0),
    })
  })
}

function pushCustomSectionBlock(blocks, sectionId, custom, t) {
  if (!hasCustomSectionContent(custom)) return

  const title = custom.title?.trim() || t('createCv.custom.fallbackTitle')
  const subtitle = custom.subtitle?.trim()

  blocks.push({
    id: sectionId,
    groupId: sectionId,
    render: () => (
      <PreviewSection title={title}>
        {subtitle && <p className="cv-preview-entry-meta">{subtitle}</p>}
        {custom.mode === 'bullets'
          ? renderBullets(custom.bullets)
          : (custom.body?.trim()
            ? <p className="cv-preview-entry-text">{custom.body.trim()}</p>
            : null)}
      </PreviewSection>
    ),
  })
}

function appendBuiltInSection(blocks, sectionId, {
  content,
  t,
  compact,
  excludeInSidebar,
  includeHeader,
  fieldVisibility,
}) {
  const {
    personal,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    awards,
    volunteer,
    publications,
    references,
  } = content

  switch (sectionId) {
    case 'personal':
      if (!includeHeader) return
      blocks.push({
        id: 'header',
        render: () => (
          <PreviewPersonalHeader
            personal={personal}
            t={t}
            fieldVisibility={fieldVisibility}
          />
        ),
      })
      return

    case 'summary': {
      const summaryText = summary?.trim()
        ? summary.trim()
        : t('createCv.preview.summaryPlaceholder')
      blocks.push({
        id: 'summary',
        render: () => (
          <PreviewSection title={t('createCv.preview.summaryHeading')}>
            <p className={`cv-preview-summary${summary?.trim() ? '' : ' cv-preview-summary--placeholder'}`}>
              {summaryText}
            </p>
          </PreviewSection>
        ),
      })
      return
    }

    case 'experience':
      pushGroupedItems(blocks, {
        sectionId: 'experience',
        items: experience,
        isFilled: (item) => item.company?.trim() || item.position?.trim()
          || item.bullets?.some((bullet) => bullet?.trim()),
        render: (item, showHeading) => (
          <PreviewExperience
            items={[item]}
            t={t}
            compact={compact}
            showHeading={showHeading}
          />
        ),
      })
      return

    case 'education':
      pushGroupedItems(blocks, {
        sectionId: 'education',
        items: education,
        isFilled: (item) => item.school?.trim() || item.degree?.trim(),
        render: (item, showHeading) => (
          <PreviewEducation items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'skills':
      if (excludeInSidebar) return
      if (skills?.mode === 'rated') {
        pushGroupedItems(blocks, {
          sectionId: 'skills',
          items: skills.rated,
          isFilled: (item) => item.name?.trim(),
          render: (item, showHeading) => (
            <PreviewSkills
              skills={{ ...skills, rated: [item] }}
              t={t}
              compact={compact}
              showHeading={showHeading}
            />
          ),
        })
      } else {
        pushGroupedItems(blocks, {
          sectionId: 'skills',
          items: skills?.categories,
          isFilled: (item) => item.name?.trim() || item.skills?.some((skill) => skill?.trim()),
          render: (item, showHeading) => (
            <PreviewSkills
              skills={{ ...skills, categories: [item] }}
              t={t}
              compact={compact}
              showHeading={showHeading}
            />
          ),
        })
      }
      return

    case 'projects':
      pushGroupedItems(blocks, {
        sectionId: 'projects',
        items: projects,
        isFilled: (item) => item.name?.trim() || item.description?.trim(),
        render: (item, showHeading) => (
          <PreviewProjects items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'certifications':
      if (excludeInSidebar) return
      pushGroupedItems(blocks, {
        sectionId: 'certifications',
        items: certifications,
        isFilled: (item) => item.name?.trim(),
        render: (item, showHeading) => (
          <PreviewCertifications items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'languages':
      if (excludeInSidebar) return
      pushGroupedItems(blocks, {
        sectionId: 'languages',
        items: languages,
        isFilled: (item) => item.name?.trim(),
        render: (item, showHeading) => (
          <PreviewLanguages items={[item]} t={t} showHeading={showHeading} />
        ),
      })
      return

    case 'awards':
      pushGroupedItems(blocks, {
        sectionId: 'awards',
        items: awards,
        isFilled: (item) => item.title?.trim(),
        render: (item, showHeading) => (
          <PreviewAwards items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'volunteer':
      pushGroupedItems(blocks, {
        sectionId: 'volunteer',
        items: volunteer,
        isFilled: (item) => item.organization?.trim() || item.role?.trim(),
        render: (item, showHeading) => (
          <PreviewVolunteer items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'publications':
      pushGroupedItems(blocks, {
        sectionId: 'publications',
        items: publications,
        isFilled: (item) => item.title?.trim(),
        render: (item, showHeading) => (
          <PreviewPublications items={[item]} t={t} compact={compact} showHeading={showHeading} />
        ),
      })
      return

    case 'references':
      pushGroupedItems(blocks, {
        sectionId: 'references',
        items: references,
        isFilled: (item) => item.name?.trim(),
        render: (item, showHeading) => (
          <PreviewReferences items={[item]} t={t} showHeading={showHeading} />
        ),
      })
      return

    default:
      break
  }
}

export function buildClassicPreviewBlocks({
  content,
  t,
  compact = false,
  excludeInSidebar = false,
  includeHeader = true,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const blocks = []
  const orderedIds = visibleSectionIds.length > 0 ? visibleSectionIds : CV_ALL_SECTION_IDS
  const customSections = content?.customSections || {}

  orderedIds.forEach((sectionId) => {
    if (isCustomSectionId(sectionId)) {
      pushCustomSectionBlock(blocks, sectionId, customSections[sectionId], t)
      return
    }

    appendBuiltInSection(blocks, sectionId, {
      content,
      t,
      compact,
      excludeInSidebar,
      includeHeader,
      fieldVisibility,
    })
  })

  return blocks
}

export function buildSidebarPreviewBlocks({
  content,
  t,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const { personal, sidebar } = content

  return {
    renderSidebar: () => (
      <PreviewSidebarPanel
        personal={personal}
        content={content}
        sidebar={sidebar}
        t={t}
        visibleSectionIds={visibleSectionIds}
        fieldVisibility={fieldVisibility}
      />
    ),
    blocks: [
      {
        id: 'header',
        render: () => (
          <PreviewPersonalHeader
            personal={personal}
            t={t}
            className="cv-preview-header--sidebar-layout"
            fieldVisibility={fieldVisibility}
          />
        ),
      },
      ...buildClassicPreviewBlocks({
        content,
        t,
        excludeInSidebar: true,
        includeHeader: false,
        visibleSectionIds,
        fieldVisibility,
      }),
    ],
  }
}
