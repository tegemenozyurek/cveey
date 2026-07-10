import ClassicAtsPreview from './previews/ClassicAtsPreview'
import CompactAtsPreview from './previews/CompactAtsPreview'
import ModernSidebarPreview from './previews/ModernSidebarPreview'
import { DEFAULT_TEMPLATE_ID } from '../constants'
import { CV_ALL_SECTION_IDS, VISIBILITY } from '../fieldVisibility'

/**
 * @typedef {object} CvTemplateDefinition
 * @property {string} id
 * @property {string} nameKey
 * @property {string} descriptionKey
 * @property {string} [badgeKey]
 * @property {'single' | 'sidebar' | 'compact'} layout
 * @property {string} thumbClass
 * @property {string[]} sectionIds
 * @property {import('react').ComponentType} Preview
 * @property {string} previewClassName
 * @property {Record<string, object>} [sectionConfig]
 */

/** @type {CvTemplateDefinition[]} */
export const CV_TEMPLATE_LIST = [
  {
    id: 'classic-ats',
    nameKey: 'createCv.template.classicAts.name',
    descriptionKey: 'createCv.template.classicAts.description',
    badgeKey: 'createCv.template.classicAts.badge',
    layout: 'single',
    thumbClass: 'classic-ats',
    sectionIds: CV_ALL_SECTION_IDS,
    Preview: ClassicAtsPreview,
    previewClassName: 'cv-preview-doc cv-preview-doc--classic-ats',
    sectionConfig: {
      summary: { maxLength: 600 },
      skills: { mode: 'categories' },
    },
  },
  {
    id: 'modern-sidebar',
    nameKey: 'createCv.template.modernSidebar.name',
    descriptionKey: 'createCv.template.modernSidebar.description',
    badgeKey: 'createCv.template.modernSidebar.badge',
    layout: 'sidebar',
    thumbClass: 'modern-sidebar',
    sectionIds: CV_ALL_SECTION_IDS,
    Preview: ModernSidebarPreview,
    previewClassName: 'cv-preview-doc cv-preview-doc--modern-sidebar',
    sectionConfig: {
      summary: { maxLength: 600 },
      skills: { mode: 'categories' },
      sidebar: { visibility: VISIBILITY.REQUIRED },
    },
  },
  {
    id: 'compact-ats',
    nameKey: 'createCv.template.compactAts.name',
    descriptionKey: 'createCv.template.compactAts.description',
    badgeKey: 'createCv.template.compactAts.badge',
    layout: 'compact',
    thumbClass: 'compact-ats',
    sectionIds: CV_ALL_SECTION_IDS,
    Preview: CompactAtsPreview,
    previewClassName: 'cv-preview-doc cv-preview-doc--compact-ats',
    sectionConfig: {
      summary: { maxLength: 500 },
      skills: { mode: 'rated' },
    },
  },
]

/** @type {Record<string, CvTemplateDefinition>} */
export const CV_TEMPLATE_REGISTRY = Object.fromEntries(
  CV_TEMPLATE_LIST.map((template) => [template.id, template]),
)

export function getCvTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  const template = CV_TEMPLATE_REGISTRY[templateId]
  if (!template) throw new Error(`Unknown CV template: ${templateId}`)
  return template
}

export function getSelectableTemplates() {
  return CV_TEMPLATE_LIST
}
