import AwardsSection from '../../components/createCv/sections/AwardsSection'
import CertificationsSection from '../../components/createCv/sections/CertificationsSection'
import CustomCategorySection from '../../components/createCv/sections/CustomCategorySection'
import EducationSection from '../../components/createCv/sections/EducationSection'
import ExperienceSection from '../../components/createCv/sections/ExperienceSection'
import LanguagesSection from '../../components/createCv/sections/LanguagesSection'
import PersonalInfoSection from '../../components/createCv/sections/PersonalInfoSection'
import ProfessionalSummarySection from '../../components/createCv/sections/ProfessionalSummarySection'
import ProjectsSection from '../../components/createCv/sections/ProjectsSection'
import PublicationsSection from '../../components/createCv/sections/PublicationsSection'
import ReferencesSection from '../../components/createCv/sections/ReferencesSection'
import SidebarSection from '../../components/createCv/sections/SidebarSection'
import SkillsSection from '../../components/createCv/sections/SkillsSection'
import VolunteerSection from '../../components/createCv/sections/VolunteerSection'
import {
  createEmptyAwardItem,
  createEmptyCertificationItem,
  createEmptyCustomSection,
  createEmptyEducationItem,
  createEmptyExperienceItem,
  createEmptyLanguageItem,
  createEmptyPersonalInfo,
  createEmptyProjectItem,
  createEmptyPublicationItem,
  createEmptyReferenceItem,
  createEmptySidebar,
  createEmptySkills,
  createEmptyVolunteerItem,
  isCustomSectionId,
} from '../cvDocument'

/** @type {Record<string, import('../cvDocument').CvSectionDefinition>} */
export const CV_SECTION_REGISTRY = {
  personal: {
    id: 'personal',
    navKey: 'createCv.navPersonal',
    titleKey: 'createCv.sectionPersonal',
    descKey: 'createCv.sectionPersonalDesc',
    Editor: PersonalInfoSection,
    getValue: (content) => content.personal,
    setValue: (content, value) => ({ ...content, personal: value }),
    createDefault: createEmptyPersonalInfo,
  },
  summary: {
    id: 'summary',
    navKey: 'createCv.navSummary',
    titleKey: 'createCv.sectionSummary',
    descKey: 'createCv.sectionSummaryDesc',
    Editor: ProfessionalSummarySection,
    getValue: (content) => content.summary,
    setValue: (content, value) => ({ ...content, summary: value }),
    createDefault: () => '',
  },
  experience: {
    id: 'experience',
    navKey: 'createCv.navExperience',
    titleKey: 'createCv.sectionExperience',
    descKey: 'createCv.sectionExperienceDesc',
    Editor: ExperienceSection,
    getValue: (content) => content.experience,
    setValue: (content, value) => ({ ...content, experience: value }),
    createDefault: () => [createEmptyExperienceItem()],
  },
  education: {
    id: 'education',
    navKey: 'createCv.navEducation',
    titleKey: 'createCv.sectionEducation',
    descKey: 'createCv.sectionEducationDesc',
    Editor: EducationSection,
    getValue: (content) => content.education,
    setValue: (content, value) => ({ ...content, education: value }),
    createDefault: () => [createEmptyEducationItem()],
  },
  skills: {
    id: 'skills',
    navKey: 'createCv.navSkills',
    titleKey: 'createCv.sectionSkills',
    descKey: 'createCv.sectionSkillsDesc',
    Editor: SkillsSection,
    getValue: (content) => content.skills,
    setValue: (content, value) => ({ ...content, skills: value }),
    createDefault: createEmptySkills,
  },
  projects: {
    id: 'projects',
    navKey: 'createCv.navProjects',
    titleKey: 'createCv.sectionProjects',
    descKey: 'createCv.sectionProjectsDesc',
    Editor: ProjectsSection,
    getValue: (content) => content.projects,
    setValue: (content, value) => ({ ...content, projects: value }),
    createDefault: () => [createEmptyProjectItem()],
  },
  certifications: {
    id: 'certifications',
    navKey: 'createCv.navCertifications',
    titleKey: 'createCv.sectionCertifications',
    descKey: 'createCv.sectionCertificationsDesc',
    Editor: CertificationsSection,
    getValue: (content) => content.certifications,
    setValue: (content, value) => ({ ...content, certifications: value }),
    createDefault: () => [createEmptyCertificationItem()],
  },
  languages: {
    id: 'languages',
    navKey: 'createCv.navLanguages',
    titleKey: 'createCv.sectionLanguages',
    descKey: 'createCv.sectionLanguagesDesc',
    Editor: LanguagesSection,
    getValue: (content) => content.languages,
    setValue: (content, value) => ({ ...content, languages: value }),
    createDefault: () => [createEmptyLanguageItem()],
  },
  awards: {
    id: 'awards',
    navKey: 'createCv.navAwards',
    titleKey: 'createCv.sectionAwards',
    descKey: 'createCv.sectionAwardsDesc',
    Editor: AwardsSection,
    getValue: (content) => content.awards,
    setValue: (content, value) => ({ ...content, awards: value }),
    createDefault: () => [createEmptyAwardItem()],
  },
  volunteer: {
    id: 'volunteer',
    navKey: 'createCv.navVolunteer',
    titleKey: 'createCv.sectionVolunteer',
    descKey: 'createCv.sectionVolunteerDesc',
    Editor: VolunteerSection,
    getValue: (content) => content.volunteer,
    setValue: (content, value) => ({ ...content, volunteer: value }),
    createDefault: () => [createEmptyVolunteerItem()],
  },
  publications: {
    id: 'publications',
    navKey: 'createCv.navPublications',
    titleKey: 'createCv.sectionPublications',
    descKey: 'createCv.sectionPublicationsDesc',
    Editor: PublicationsSection,
    getValue: (content) => content.publications,
    setValue: (content, value) => ({ ...content, publications: value }),
    createDefault: () => [createEmptyPublicationItem()],
  },
  references: {
    id: 'references',
    navKey: 'createCv.navReferences',
    titleKey: 'createCv.sectionReferences',
    descKey: 'createCv.sectionReferencesDesc',
    Editor: ReferencesSection,
    getValue: (content) => content.references,
    setValue: (content, value) => ({ ...content, references: value }),
    createDefault: () => [createEmptyReferenceItem()],
  },
  sidebar: {
    id: 'sidebar',
    navKey: 'createCv.navSidebar',
    titleKey: 'createCv.sectionSidebar',
    descKey: 'createCv.sectionSidebarDesc',
    Editor: SidebarSection,
    getValue: (content) => content.sidebar,
    setValue: (content, value) => ({ ...content, sidebar: value }),
    createDefault: createEmptySidebar,
  },
}

function createCustomSectionDefinition(sectionId, data) {
  const title = typeof data?.title === 'string' ? data.title.trim() : ''
  return {
    id: sectionId,
    isCustom: true,
    navKey: null,
    navLabel: title || null,
    titleKey: null,
    descKey: null,
    Editor: CustomCategorySection,
    getValue: (content) => (
      content.customSections?.[sectionId] || createEmptyCustomSection(sectionId)
    ),
    setValue: (content, value) => ({
      ...content,
      customSections: {
        ...(content.customSections || {}),
        [sectionId]: { ...value, id: sectionId },
      },
    }),
    createDefault: () => createEmptyCustomSection(sectionId),
  }
}

export function getCvSection(sectionId, customSections = {}) {
  if (isCustomSectionId(sectionId)) {
    return createCustomSectionDefinition(sectionId, customSections?.[sectionId])
  }

  const section = CV_SECTION_REGISTRY[sectionId]
  if (!section) throw new Error(`Unknown CV section: ${sectionId}`)
  return section
}

export function resolveCvSections(sectionIds, customSections = {}) {
  return sectionIds.map((id) => getCvSection(id, customSections))
}

export function getSectionEditorProps(section, {
  content,
  onContentChange,
  t,
  stepNumber,
  sectionConfig,
  fieldVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}) {
  const rawValue = section.getValue(content)
  const value = rawValue == null && section.createDefault
    ? section.createDefault()
    : rawValue

  const onChange = (next) => {
    if (section.isCustom) {
      const patched = section.setValue(content, next)
      onContentChange({ customSections: patched.customSections })
      return
    }
    onContentChange({ [section.id]: next })
  }

  const base = { value, onChange, t, stepNumber }

  if (section.isCustom) {
    return {
      ...base,
      onMoveUp,
      onMoveDown,
      onDelete,
      canMoveUp,
      canMoveDown,
    }
  }

  if (section.id === 'personal') {
    return { ...base, fieldVisibility }
  }

  if (section.id === 'summary') {
    return { ...base, maxLength: sectionConfig?.summary?.maxLength ?? 600 }
  }

  if (section.id === 'skills') {
    return { ...base, mode: value?.mode ?? sectionConfig?.skills?.mode ?? 'categories' }
  }

  return { ...base, sectionConfig }
}

/**
 * Empty default for a single section, preserving skills mode and personal email.
 * @param {string} sectionId
 * @param {{ email?: string, skillsMode?: 'categories' | 'rated', customSections?: object }} [options]
 */
export function createSectionDefault(sectionId, { email = '', skillsMode, customSections } = {}) {
  if (isCustomSectionId(sectionId)) {
    return createEmptyCustomSection(sectionId)
  }

  const section = getCvSection(sectionId, customSections)

  if (sectionId === 'personal') {
    return section.createDefault(email)
  }

  if (sectionId === 'skills') {
    const empty = section.createDefault()
    const mode = skillsMode === 'rated' || skillsMode === 'categories'
      ? skillsMode
      : empty.mode
    return { ...empty, mode }
  }

  return section.createDefault()
}
