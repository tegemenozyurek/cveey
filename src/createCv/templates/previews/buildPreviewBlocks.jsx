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
} from './previewBlocks'
import { CV_ALL_SECTION_IDS } from '../../fieldVisibility'

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

export function buildClassicPreviewBlocks({
  content,
  t,
  compact = false,
  excludeInSidebar = false,
  includeHeader = true,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const { personal, summary, experience, education, skills, projects, certifications, languages, awards, volunteer, publications, references } = content
  const summaryText = summary?.trim() ? summary.trim() : t('createCv.preview.summaryPlaceholder')
  const blocks = []
  const visible = new Set(
    visibleSectionIds.length > 0 ? visibleSectionIds : CV_ALL_SECTION_IDS,
  )

  if (includeHeader && visible.has('personal')) {
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
  }

  if (visible.has('summary')) {
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
  }

  if (visible.has('experience')) {
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
  }

  if (visible.has('education')) {
    pushGroupedItems(blocks, {
      sectionId: 'education',
      items: education,
      isFilled: (item) => item.school?.trim() || item.degree?.trim(),
      render: (item, showHeading) => (
        <PreviewEducation items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    })
  }

  if (visible.has('skills') && !excludeInSidebar) {
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
  }

  const groupedSections = [
    {
      id: 'projects',
      items: projects,
      isFilled: (item) => item.name?.trim() || item.description?.trim(),
      render: (item, showHeading) => (
        <PreviewProjects items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    },
    {
      id: 'certifications',
      items: certifications,
      exclude: excludeInSidebar,
      isFilled: (item) => item.name?.trim(),
      render: (item, showHeading) => (
        <PreviewCertifications items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    },
    {
      id: 'languages',
      items: languages,
      exclude: excludeInSidebar,
      isFilled: (item) => item.name?.trim(),
      render: (item, showHeading) => (
        <PreviewLanguages items={[item]} t={t} showHeading={showHeading} />
      ),
    },
    {
      id: 'awards',
      items: awards,
      isFilled: (item) => item.title?.trim(),
      render: (item, showHeading) => (
        <PreviewAwards items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    },
    {
      id: 'volunteer',
      items: volunteer,
      isFilled: (item) => item.organization?.trim() || item.role?.trim(),
      render: (item, showHeading) => (
        <PreviewVolunteer items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    },
    {
      id: 'publications',
      items: publications,
      isFilled: (item) => item.title?.trim(),
      render: (item, showHeading) => (
        <PreviewPublications items={[item]} t={t} compact={compact} showHeading={showHeading} />
      ),
    },
    {
      id: 'references',
      items: references,
      isFilled: (item) => item.name?.trim(),
      render: (item, showHeading) => (
        <PreviewReferences items={[item]} t={t} showHeading={showHeading} />
      ),
    },
  ]

  groupedSections.forEach((section) => {
    if (!section.exclude && visible.has(section.id)) {
      pushGroupedItems(blocks, {
        sectionId: section.id,
        items: section.items,
        isFilled: section.isFilled,
        render: section.render,
      })
    }
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
