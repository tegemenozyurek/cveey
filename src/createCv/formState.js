/** @deprecated Import from createCv/cvDocument.js and createCv/constants.js */
import { createEmptyCvDocument } from './cvDocument'
import { CV_ALL_SECTION_IDS } from './fieldVisibility'

export {
  MILITARY_STATUS_OPTIONS,
  DEFAULT_TEMPLATE_ID,
} from './constants'

export {
  createEmptyCvContent,
  createEmptyCvDocument,
  createEmptyPersonalInfo,
} from './cvDocument'

/** @deprecated Use createEmptyCvDocument */
export function createEmptyCvForm(email = '') {
  return createEmptyCvDocument(email).content
}

export const CREATE_CV_SECTIONS = [...CV_ALL_SECTION_IDS]
