/** @typedef {'required' | 'optional' | 'hidden'} Visibility */

export const VISIBILITY = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  HIDDEN: 'hidden',
}

export const CV_ALL_SECTION_IDS = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
  'volunteer',
  'publications',
  'references',
  'sidebar',
]

/** @type {Record<string, Visibility>} */
export const DEFAULT_SECTION_VISIBILITY = {
  personal: VISIBILITY.REQUIRED,
  summary: VISIBILITY.REQUIRED,
  experience: VISIBILITY.REQUIRED,
  education: VISIBILITY.REQUIRED,
  skills: VISIBILITY.REQUIRED,
  projects: VISIBILITY.OPTIONAL,
  certifications: VISIBILITY.OPTIONAL,
  languages: VISIBILITY.OPTIONAL,
  awards: VISIBILITY.HIDDEN,
  volunteer: VISIBILITY.HIDDEN,
  publications: VISIBILITY.HIDDEN,
  references: VISIBILITY.HIDDEN,
  sidebar: VISIBILITY.HIDDEN,
}

/** @type {Record<string, Visibility>} */
export const DEFAULT_PERSONAL_FIELD_VISIBILITY = {
  fullName: VISIBILITY.REQUIRED,
  jobTitle: VISIBILITY.REQUIRED,
  phone: VISIBILITY.OPTIONAL,
  email: VISIBILITY.REQUIRED,
  location: VISIBILITY.OPTIONAL,
  linkedin: VISIBILITY.OPTIONAL,
  github: VISIBILITY.HIDDEN,
  portfolio: VISIBILITY.HIDDEN,
  behance: VISIBILITY.HIDDEN,
  dribbble: VISIBILITY.HIDDEN,
  stackoverflow: VISIBILITY.HIDDEN,
  dateOfBirth: VISIBILITY.OPTIONAL,
  drivingLicense: VISIBILITY.HIDDEN,
  militaryStatus: VISIBILITY.OPTIONAL,
  medicalLicense: VISIBILITY.HIDDEN,
  specialty: VISIBILITY.HIDDEN,
  residency: VISIBILITY.HIDDEN,
  teachingSubjects: VISIBILITY.HIDDEN,
  teachingCertificate: VISIBILITY.HIDDEN,
  accountingSoftware: VISIBILITY.HIDDEN,
  taxExperience: VISIBILITY.HIDDEN,
  licenseClass: VISIBILITY.HIDDEN,
  adrCertificate: VISIBILITY.HIDDEN,
  drivingExperience: VISIBILITY.HIDDEN,
  flightHours: VISIBILITY.HIDDEN,
  aircraftTypes: VISIBILITY.HIDDEN,
  pilotLicense: VISIBILITY.HIDDEN,
  clinicalExperience: VISIBILITY.HIDDEN,
  nurseCertifications: VISIBILITY.HIDDEN,
  salesTarget: VISIBILITY.HIDDEN,
  crmExperience: VISIBILITY.HIDDEN,
  cuisineTypes: VISIBILITY.HIDDEN,
  michelinExperience: VISIBILITY.HIDDEN,
  pmp: VISIBILITY.HIDDEN,
  autocad: VISIBILITY.HIDDEN,
  sap2000: VISIBILITY.HIDDEN,
  adobeSkills: VISIBILITY.HIDDEN,
}

function mergeVisibility(base, ...overrides) {
  const result = { ...base }
  for (const patch of overrides) {
    if (!patch) continue
    for (const [key, value] of Object.entries(patch)) {
      if (value) result[key] = value
    }
  }
  return result
}

/**
 * @param {import('./occupations/registry').CvOccupationDefinition} occupation
 * @param {import('./templates/registry').CvTemplateDefinition} template
 * @param {string} sectionId
 * @returns {Visibility}
 */
export function resolveSectionVisibility(occupation, template, sectionId) {
  let visibility = DEFAULT_SECTION_VISIBILITY[sectionId] ?? VISIBILITY.OPTIONAL

  if (occupation?.sections?.[sectionId]) {
    visibility = occupation.sections[sectionId]
  }

  if (template?.sectionConfig?.[sectionId]?.visibility) {
    visibility = template.sectionConfig[sectionId].visibility
  }

  if (sectionId === 'sidebar' && template?.layout !== 'sidebar') {
    return VISIBILITY.HIDDEN
  }

  return visibility
}

/**
 * @param {import('./occupations/registry').CvOccupationDefinition} occupation
 * @param {import('./templates/registry').CvTemplateDefinition} template
 * @returns {Record<string, Visibility>}
 */
export function resolvePersonalFieldVisibility(occupation, template) {
  return mergeVisibility(
    DEFAULT_PERSONAL_FIELD_VISIBILITY,
    occupation?.personalFields,
    template?.sectionConfig?.personal?.fields,
  )
}

/**
 * @param {import('./occupations/registry').CvOccupationDefinition} occupation
 * @param {import('./templates/registry').CvTemplateDefinition} template
 * @returns {string[]}
 */
export function resolveActiveSectionIds(occupation, template) {
  const ordered = template?.sectionIds?.length ? template.sectionIds : CV_ALL_SECTION_IDS

  return ordered.filter((sectionId) => {
    const visibility = resolveSectionVisibility(occupation, template, sectionId)
    return visibility !== VISIBILITY.HIDDEN
  })
}

/**
 * @param {Visibility} visibility
 */
export function isFieldVisible(visibility) {
  return visibility !== VISIBILITY.HIDDEN
}

/**
 * @param {Visibility} visibility
 */
export function isFieldRequired(visibility) {
  return visibility === VISIBILITY.REQUIRED
}
