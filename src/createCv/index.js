/**
 * Create CV builder — public entry points for extending the system.
 */
export { DEFAULT_TEMPLATE_ID, MILITARY_STATUS_OPTIONS, A4_WIDTH_MM, A4_HEIGHT_MM, A4_WIDTH_PX, A4_HEIGHT_PX } from './constants'
export {
  createEmptyCvContent,
  createEmptyCvDocument,
  createEmptyPersonalInfo,
  normalizeCvContent,
  normalizeCvDocument,
  updateCvContent,
  setCvTemplate,
  setCvOccupation,
} from './cvDocument'
export { VISIBILITY, CV_ALL_SECTION_IDS, resolveActiveSectionIds, resolvePersonalFieldVisibility } from './fieldVisibility'
export { useCvBuilder } from './hooks/useCvBuilder'
export { CV_SECTION_REGISTRY, resolveCvSections } from './sections/registry'
export { CV_TEMPLATE_LIST, CV_TEMPLATE_REGISTRY, getCvTemplate } from './templates/registry'
export { CV_OCCUPATION_LIST, CV_OCCUPATION_REGISTRY, getCvOccupation, DEFAULT_OCCUPATION_ID } from './occupations/registry'
