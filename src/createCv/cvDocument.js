import { DEFAULT_TEMPLATE_ID } from './constants'
import { createItemId } from './ids'

export function createEmptyExperienceItem() {
  return {
    id: createItemId(),
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    bullets: [''],
    achievements: [''],
  }
}

export function createEmptyEducationItem() {
  return {
    id: createItemId(),
    school: '',
    degree: '',
    department: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    description: '',
  }
}

export function createEmptySkillCategory() {
  return {
    id: createItemId(),
    name: '',
    skills: [''],
  }
}

export function createEmptyRatedSkill() {
  return {
    id: createItemId(),
    name: '',
    level: 3,
  }
}

export function createEmptySkills() {
  return {
    mode: 'categories',
    categories: [createEmptySkillCategory()],
    rated: [createEmptyRatedSkill()],
  }
}

export function createEmptyProjectItem() {
  return {
    id: createItemId(),
    name: '',
    description: '',
    technologies: '',
    github: '',
    demo: '',
    startDate: '',
    endDate: '',
  }
}

export function createEmptyCertificationItem() {
  return {
    id: createItemId(),
    name: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
  }
}

export function createEmptyLanguageItem() {
  return {
    id: createItemId(),
    name: '',
    level: '',
  }
}

export function createEmptyAwardItem() {
  return {
    id: createItemId(),
    title: '',
    issuer: '',
    date: '',
    description: '',
  }
}

export function createEmptyVolunteerItem() {
  return {
    id: createItemId(),
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
  }
}

export function createEmptyPublicationItem() {
  return {
    id: createItemId(),
    title: '',
    publisher: '',
    date: '',
    url: '',
  }
}

export function createEmptyReferenceItem() {
  return {
    id: createItemId(),
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
  }
}

export function createEmptySidebar() {
  return {
    headline: '',
    highlights: [''],
    note: '',
  }
}

export function createCustomSectionId() {
  return `custom-${createItemId()}`
}

export function isCustomSectionId(sectionId) {
  return typeof sectionId === 'string' && sectionId.startsWith('custom-')
}

export function createEmptyCustomSection(id = createCustomSectionId()) {
  return {
    id,
    title: '',
    subtitle: '',
    mode: 'text',
    body: '',
    bullets: [''],
  }
}

export function hasCustomSectionContent(section) {
  if (!section || typeof section !== 'object') return false
  if (section.title?.trim() || section.subtitle?.trim() || section.body?.trim()) return true
  return Array.isArray(section.bullets) && section.bullets.some((item) => item?.trim())
}

function normalizeCustomSection(raw, fallbackId) {
  const base = createEmptyCustomSection(fallbackId || createCustomSectionId())
  const id = typeof raw?.id === 'string' && raw.id.startsWith('custom-')
    ? raw.id
    : base.id
  return {
    ...base,
    ...raw,
    id,
    title: typeof raw?.title === 'string' ? raw.title : '',
    subtitle: typeof raw?.subtitle === 'string' ? raw.subtitle : '',
    mode: raw?.mode === 'bullets' ? 'bullets' : 'text',
    body: typeof raw?.body === 'string' ? raw.body : '',
    bullets: Array.isArray(raw?.bullets) && raw.bullets.length > 0
      ? raw.bullets.map((item) => (typeof item === 'string' ? item : ''))
      : [''],
  }
}

export function normalizeCustomSections(customSections) {
  if (!customSections || typeof customSections !== 'object') return {}

  const result = {}
  for (const [key, value] of Object.entries(customSections)) {
    const normalized = normalizeCustomSection(value, key.startsWith('custom-') ? key : undefined)
    result[normalized.id] = normalized
  }
  return result
}

export function createEmptyPersonalInfo(email = '') {
  return {
    fullName: '',
    jobTitle: '',
    phone: '',
    email,
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    behance: '',
    dribbble: '',
    stackoverflow: '',
    dateOfBirth: '',
    drivingLicense: '',
    militaryStatus: 'notApplicable',
    medicalLicense: '',
    specialty: '',
    residency: '',
    teachingSubjects: '',
    teachingCertificate: '',
    accountingSoftware: '',
    taxExperience: '',
    licenseClass: '',
    adrCertificate: '',
    drivingExperience: '',
    flightHours: '',
    aircraftTypes: '',
    pilotLicense: '',
    clinicalExperience: '',
    nurseCertifications: '',
    salesTarget: '',
    crmExperience: '',
    cuisineTypes: '',
    michelinExperience: '',
    pmp: '',
    autocad: '',
    sap2000: '',
    adobeSkills: '',
  }
}

export function createEmptyCvContent(email = '') {
  return {
    personal: createEmptyPersonalInfo(email),
    summary: '',
    experience: [createEmptyExperienceItem()],
    education: [createEmptyEducationItem()],
    skills: createEmptySkills(),
    projects: [createEmptyProjectItem()],
    certifications: [createEmptyCertificationItem()],
    languages: [createEmptyLanguageItem()],
    awards: [createEmptyAwardItem()],
    volunteer: [createEmptyVolunteerItem()],
    publications: [createEmptyPublicationItem()],
    references: [createEmptyReferenceItem()],
    sidebar: createEmptySidebar(),
    customSections: {},
  }
}

export function createEmptyCvDocument(
  email = '',
  templateId = DEFAULT_TEMPLATE_ID,
  sectionOrder = null,
) {
  return {
    templateId,
    sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : null,
    content: createEmptyCvContent(email),
  }
}

export function updateCvContent(document, patch) {
  return {
    ...document,
    content: {
      ...document.content,
      ...patch,
    },
  }
}

export function setCvTemplate(document, templateId) {
  return {
    ...document,
    templateId,
  }
}

export function prefillEmail(document, email) {
  if (!email || document.content.personal.email) return document
  return updateCvContent(document, {
    personal: { ...document.content.personal, email },
  })
}

function normalizeExperienceItem(item) {
  const base = createEmptyExperienceItem()
  return {
    ...base,
    ...item,
    id: item?.id || base.id,
    bullets: Array.isArray(item?.bullets) && item.bullets.length > 0 ? item.bullets : [''],
    achievements: Array.isArray(item?.achievements) && item.achievements.length > 0 ? item.achievements : [''],
  }
}

function normalizeListSection(items, createItem) {
  if (!Array.isArray(items) || items.length === 0) {
    return [createItem()]
  }
  return items.map((item) => {
    const base = createItem()
    return { ...base, ...item, id: item?.id || base.id }
  })
}

export function normalizeCvListSection(items, createItem) {
  return normalizeListSection(items, createItem)
}

function clampSkillLevel(level) {
  const numericLevel = Number(level)
  if (!Number.isFinite(numericLevel)) return createEmptyRatedSkill().level
  return Math.min(5, Math.max(1, Math.round(numericLevel)))
}

/** Ensures older/incomplete documents have every section the builder expects. */
export function normalizeCvContent(content, email = '') {
  const defaults = createEmptyCvContent(email)

  return {
    personal: { ...defaults.personal, ...(content?.personal || {}) },
    summary: typeof content?.summary === 'string' ? content.summary : '',
    experience: Array.isArray(content?.experience) && content.experience.length > 0
      ? content.experience.map(normalizeExperienceItem)
      : defaults.experience,
    education: normalizeListSection(content?.education, createEmptyEducationItem),
    skills: {
      ...defaults.skills,
      ...(content?.skills || {}),
      mode: content?.skills?.mode === 'rated' ? 'rated' : 'categories',
      categories: Array.isArray(content?.skills?.categories) && content.skills.categories.length > 0
        ? content.skills.categories.map((cat) => ({
          ...createEmptySkillCategory(),
          ...cat,
          id: cat?.id || createEmptySkillCategory().id,
          skills: Array.isArray(cat?.skills) && cat.skills.length > 0 ? cat.skills : [''],
        }))
        : defaults.skills.categories,
      rated: Array.isArray(content?.skills?.rated) && content.skills.rated.length > 0
        ? content.skills.rated.map((item) => ({
          ...createEmptyRatedSkill(),
          ...item,
          id: item?.id || createEmptyRatedSkill().id,
          level: clampSkillLevel(item?.level),
        }))
        : defaults.skills.rated,
    },
    projects: normalizeListSection(content?.projects, createEmptyProjectItem),
    certifications: normalizeListSection(content?.certifications, createEmptyCertificationItem),
    languages: normalizeListSection(content?.languages, createEmptyLanguageItem),
    awards: normalizeListSection(content?.awards, createEmptyAwardItem),
    volunteer: normalizeListSection(content?.volunteer, createEmptyVolunteerItem),
    publications: normalizeListSection(content?.publications, createEmptyPublicationItem),
    references: normalizeListSection(content?.references, createEmptyReferenceItem),
    sidebar: {
      ...defaults.sidebar,
      ...(content?.sidebar || {}),
      highlights: Array.isArray(content?.sidebar?.highlights) && content.sidebar.highlights.length > 0
        ? content.sidebar.highlights
        : [''],
    },
    customSections: normalizeCustomSections(content?.customSections),
  }
}

export function normalizeCvDocument(document, email = '') {
  const sectionOrder = Array.isArray(document?.sectionOrder)
    ? document.sectionOrder.filter((id) => typeof id === 'string' && id.trim())
    : null

  return {
    templateId: document?.templateId || DEFAULT_TEMPLATE_ID,
    sectionOrder: sectionOrder && sectionOrder.length > 0 ? sectionOrder : null,
    content: normalizeCvContent(document?.content, email || document?.content?.personal?.email),
  }
}
