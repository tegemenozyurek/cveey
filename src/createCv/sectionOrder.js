import {
  hasCustomSectionContent,
  isCustomSectionId,
} from './cvDocument'
import { resolveActiveSectionIds } from './fieldVisibility'

/**
 * Merge saved order with template-visible built-ins and known custom ids.
 * @param {string[] | null | undefined} sectionOrder
 * @param {import('./templates/registry').CvTemplateDefinition} template
 * @param {Record<string, object>} [customSections]
 * @returns {string[]}
 */
export function normalizeSectionOrder(sectionOrder, template, customSections = {}) {
  const base = resolveActiveSectionIds(template)
  const customIds = Object.keys(customSections || {}).filter(isCustomSectionId)
  const activeBuiltIn = new Set(base)
  const knownCustom = new Set(customIds)
  const seen = new Set()
  const result = []

  const pushId = (id) => {
    if (!id || seen.has(id)) return
    if (activeBuiltIn.has(id) || knownCustom.has(id)) {
      result.push(id)
      seen.add(id)
    }
  }

  if (Array.isArray(sectionOrder) && sectionOrder.length > 0) {
    sectionOrder.forEach(pushId)
  }

  base.forEach(pushId)
  customIds.forEach(pushId)

  return result
}

/**
 * @param {object} document
 * @param {import('./templates/registry').CvTemplateDefinition} template
 * @returns {object}
 */
export function withNormalizedSectionOrder(document, template) {
  const sectionOrder = normalizeSectionOrder(
    document?.sectionOrder,
    template,
    document?.content?.customSections,
  )
  return { ...document, sectionOrder }
}

export function hasBuiltInSectionContent(sectionId, content) {
  if (!content) return false

  switch (sectionId) {
    case 'personal': {
      const personal = content.personal || {}
      return Boolean(
        personal.fullName?.trim()
        || personal.jobTitle?.trim()
        || personal.phone?.trim()
        || personal.email?.trim()
        || personal.location?.trim(),
      )
    }
    case 'summary':
      return Boolean(content.summary?.trim())
    case 'experience':
      return (content.experience || []).some((item) => (
        item.company?.trim()
        || item.position?.trim()
        || item.bullets?.some((bullet) => bullet?.trim())
      ))
    case 'education':
      return (content.education || []).some((item) => (
        item.school?.trim() || item.degree?.trim()
      ))
    case 'skills': {
      const skills = content.skills
      if (!skills) return false
      if (skills.mode === 'rated') {
        return (skills.rated || []).some((item) => item.name?.trim())
      }
      return (skills.categories || []).some((cat) => (
        cat.name?.trim() || cat.skills?.some((skill) => skill?.trim())
      ))
    }
    case 'projects':
      return (content.projects || []).some((item) => (
        item.name?.trim() || item.description?.trim()
      ))
    case 'certifications':
      return (content.certifications || []).some((item) => item.name?.trim())
    case 'languages':
      return (content.languages || []).some((item) => item.name?.trim())
    case 'awards':
      return (content.awards || []).some((item) => item.title?.trim())
    case 'volunteer':
      return (content.volunteer || []).some((item) => (
        item.organization?.trim() || item.role?.trim()
      ))
    case 'publications':
      return (content.publications || []).some((item) => item.title?.trim())
    case 'references':
      return (content.references || []).some((item) => item.name?.trim())
    case 'sidebar': {
      const sidebar = content.sidebar || {}
      return Boolean(
        sidebar.headline?.trim()
        || sidebar.note?.trim()
        || sidebar.highlights?.some((item) => item?.trim()),
      )
    }
    default:
      return false
  }
}

export function hasSectionContent(sectionId, content) {
  if (isCustomSectionId(sectionId)) {
    return hasCustomSectionContent(content?.customSections?.[sectionId])
  }
  return hasBuiltInSectionContent(sectionId, content)
}

export function hasContentBelow(sectionOrder, index, content) {
  if (!Array.isArray(sectionOrder) || index < 0) return false
  for (let i = index + 1; i < sectionOrder.length; i += 1) {
    if (hasSectionContent(sectionOrder[i], content)) return true
  }
  return false
}

export function swapSectionOrder(sectionOrder, fromIndex, toIndex) {
  if (
    !Array.isArray(sectionOrder)
    || fromIndex < 0
    || toIndex < 0
    || fromIndex >= sectionOrder.length
    || toIndex >= sectionOrder.length
    || fromIndex === toIndex
  ) {
    return sectionOrder
  }

  const next = [...sectionOrder]
  const temp = next[fromIndex]
  next[fromIndex] = next[toIndex]
  next[toIndex] = temp
  return next
}

export function insertAfterIndex(sectionOrder, index, sectionId) {
  const next = Array.isArray(sectionOrder) ? [...sectionOrder] : []
  const insertAt = Math.min(Math.max(index + 1, 0), next.length)
  next.splice(insertAt, 0, sectionId)
  return next
}

export function removeFromSectionOrder(sectionOrder, sectionId) {
  return (Array.isArray(sectionOrder) ? sectionOrder : []).filter((id) => id !== sectionId)
}
