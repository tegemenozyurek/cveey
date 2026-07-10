import { VISIBILITY } from '../fieldVisibility'

export const DEFAULT_OCCUPATION_ID = 'general'

/**
 * @typedef {object} CvOccupationDefinition
 * @property {string} id
 * @property {string} nameKey
 * @property {string} [descriptionKey]
 * @property {Record<string, import('../fieldVisibility').Visibility>} [sections]
 * @property {Record<string, import('../fieldVisibility').Visibility>} [personalFields]
 */

const V = VISIBILITY

/** @type {CvOccupationDefinition[]} */
export const CV_OCCUPATION_LIST = [
  {
    id: 'general',
    nameKey: 'createCv.occupation.general',
    descriptionKey: 'createCv.occupation.generalDesc',
    sections: {
      awards: V.OPTIONAL,
      volunteer: V.OPTIONAL,
      references: V.OPTIONAL,
    },
  },
  {
    id: 'software-engineer',
    nameKey: 'createCv.occupation.softwareEngineer',
    personalFields: {
      github: V.REQUIRED,
      portfolio: V.OPTIONAL,
      stackoverflow: V.OPTIONAL,
      linkedin: V.OPTIONAL,
      drivingLicense: V.HIDDEN,
    },
    sections: {
      projects: V.REQUIRED,
      certifications: V.OPTIONAL,
      languages: V.OPTIONAL,
    },
  },
  {
    id: 'graphic-designer',
    nameKey: 'createCv.occupation.graphicDesigner',
    personalFields: {
      behance: V.REQUIRED,
      dribbble: V.OPTIONAL,
      portfolio: V.REQUIRED,
      adobeSkills: V.REQUIRED,
      github: V.HIDDEN,
    },
    sections: {
      projects: V.REQUIRED,
      awards: V.OPTIONAL,
    },
  },
  {
    id: 'doctor',
    nameKey: 'createCv.occupation.doctor',
    personalFields: {
      medicalLicense: V.REQUIRED,
      specialty: V.REQUIRED,
      residency: V.OPTIONAL,
      github: V.HIDDEN,
      portfolio: V.HIDDEN,
    },
    sections: {
      certifications: V.REQUIRED,
      publications: V.OPTIONAL,
      languages: V.OPTIONAL,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'teacher',
    nameKey: 'createCv.occupation.teacher',
    personalFields: {
      teachingSubjects: V.REQUIRED,
      teachingCertificate: V.REQUIRED,
      github: V.HIDDEN,
    },
    sections: {
      certifications: V.OPTIONAL,
      volunteer: V.OPTIONAL,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'accountant',
    nameKey: 'createCv.occupation.accountant',
    personalFields: {
      accountingSoftware: V.REQUIRED,
      taxExperience: V.OPTIONAL,
      github: V.HIDDEN,
      portfolio: V.HIDDEN,
    },
    sections: {
      certifications: V.REQUIRED,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'driver',
    nameKey: 'createCv.occupation.driver',
    personalFields: {
      licenseClass: V.REQUIRED,
      adrCertificate: V.OPTIONAL,
      drivingExperience: V.REQUIRED,
      drivingLicense: V.REQUIRED,
      github: V.HIDDEN,
      portfolio: V.HIDDEN,
      linkedin: V.HIDDEN,
    },
    sections: {
      experience: V.REQUIRED,
      education: V.OPTIONAL,
      skills: V.OPTIONAL,
      projects: V.HIDDEN,
      publications: V.HIDDEN,
    },
  },
  {
    id: 'pilot',
    nameKey: 'createCv.occupation.pilot',
    personalFields: {
      flightHours: V.REQUIRED,
      aircraftTypes: V.REQUIRED,
      pilotLicense: V.REQUIRED,
      github: V.HIDDEN,
      portfolio: V.HIDDEN,
    },
    sections: {
      certifications: V.REQUIRED,
      languages: V.REQUIRED,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'nurse',
    nameKey: 'createCv.occupation.nurse',
    personalFields: {
      clinicalExperience: V.REQUIRED,
      nurseCertifications: V.REQUIRED,
      github: V.HIDDEN,
      portfolio: V.HIDDEN,
    },
    sections: {
      certifications: V.REQUIRED,
      languages: V.OPTIONAL,
      volunteer: V.OPTIONAL,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'sales',
    nameKey: 'createCv.occupation.sales',
    personalFields: {
      salesTarget: V.OPTIONAL,
      crmExperience: V.REQUIRED,
      linkedin: V.OPTIONAL,
      github: V.HIDDEN,
    },
    sections: {
      awards: V.OPTIONAL,
      languages: V.OPTIONAL,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'chef',
    nameKey: 'createCv.occupation.chef',
    personalFields: {
      cuisineTypes: V.REQUIRED,
      michelinExperience: V.OPTIONAL,
      portfolio: V.OPTIONAL,
      github: V.HIDDEN,
    },
    sections: {
      awards: V.OPTIONAL,
      certifications: V.OPTIONAL,
      projects: V.HIDDEN,
    },
  },
  {
    id: 'construction-engineer',
    nameKey: 'createCv.occupation.constructionEngineer',
    personalFields: {
      pmp: V.OPTIONAL,
      autocad: V.REQUIRED,
      sap2000: V.OPTIONAL,
      portfolio: V.OPTIONAL,
      github: V.HIDDEN,
    },
    sections: {
      certifications: V.REQUIRED,
      projects: V.REQUIRED,
    },
  },
  {
    id: 'academic',
    nameKey: 'createCv.occupation.academic',
    personalFields: {
      portfolio: V.OPTIONAL,
      linkedin: V.OPTIONAL,
      github: V.HIDDEN,
    },
    sections: {
      publications: V.REQUIRED,
      awards: V.OPTIONAL,
      references: V.OPTIONAL,
      projects: V.OPTIONAL,
    },
  },
]

/** @type {Record<string, CvOccupationDefinition>} */
export const CV_OCCUPATION_REGISTRY = Object.fromEntries(
  CV_OCCUPATION_LIST.map((occupation) => [occupation.id, occupation]),
)

export function getCvOccupation(occupationId = DEFAULT_OCCUPATION_ID) {
  return CV_OCCUPATION_REGISTRY[occupationId] || CV_OCCUPATION_REGISTRY[DEFAULT_OCCUPATION_ID]
}

export function getSelectableOccupations() {
  return CV_OCCUPATION_LIST
}
