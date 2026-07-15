import ScandiAtsPreview from './previews/ScandiAtsPreview'
import { DEFAULT_TEMPLATE_ID } from '../constants'
import { CV_ALL_SECTION_IDS } from '../fieldVisibility'

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
    id: 'scandi-ats',
    nameKey: 'createCv.template.scandiAts.name',
    descriptionKey: 'createCv.template.scandiAts.description',
    badgeKey: 'createCv.template.scandiAts.badge',
    layout: 'single',
    thumbClass: 'scandi-ats',
    sectionIds: CV_ALL_SECTION_IDS,
    Preview: ScandiAtsPreview,
    previewClassName: 'cv-preview-doc cv-preview-doc--scandi',
    sectionConfig: {
      summary: { maxLength: 600 },
      skills: { mode: 'categories' },
    },
  },
]

/** @type {Record<string, CvTemplateDefinition>} */
export const CV_TEMPLATE_REGISTRY = Object.fromEntries(
  CV_TEMPLATE_LIST.map((template) => [template.id, template]),
)

export function getCvTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  // Fall back to the default template for unknown/legacy ids (e.g. drafts saved
  // with a template that no longer exists) instead of throwing.
  return CV_TEMPLATE_REGISTRY[templateId]
    ?? CV_TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID]
    ?? CV_TEMPLATE_LIST[0]
}

export function getSelectableTemplates() {
  return CV_TEMPLATE_LIST
}
