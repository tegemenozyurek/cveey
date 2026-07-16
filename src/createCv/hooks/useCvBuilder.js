import { useCallback, useMemo, useRef, useState } from 'react'
import { DEFAULT_TEMPLATE_ID } from '../constants'
import {
  createCustomSectionId,
  createEmptyCustomSection,
  createEmptyCvDocument,
  hasCustomSectionContent,
  isCustomSectionId,
  normalizeCvDocument,
  prefillEmail,
  setCvTemplate,
  updateCvContent,
} from '../cvDocument'
import {
  resolvePersonalFieldVisibility,
} from '../fieldVisibility'
import {
  hasContentBelow,
  insertAfterIndex,
  normalizeSectionOrder,
  removeFromSectionOrder,
  swapSectionOrder,
  withNormalizedSectionOrder,
} from '../sectionOrder'
import { resolveCvSections } from '../sections/registry'
import { getCvTemplate } from '../templates/registry'

function normalizeBuilderDocument(raw, email = '') {
  const normalized = normalizeCvDocument(raw, email)
  const template = getCvTemplate(normalized.templateId || DEFAULT_TEMPLATE_ID)
  return withNormalizedSectionOrder(normalized, template)
}

export function useCvBuilder({ email = '' } = {}) {
  const [document, setDocument] = useState(() =>
    normalizeBuilderDocument(prefillEmail(createEmptyCvDocument(email), email), email),
  )
  const [activeSectionId, setActiveSectionId] = useState(null)
  const templateIdRef = useRef(document.templateId)
  templateIdRef.current = document.templateId

  const template = useMemo(
    () => getCvTemplate(document.templateId || DEFAULT_TEMPLATE_ID),
    [document.templateId],
  )

  const sectionOrder = useMemo(
    () => normalizeSectionOrder(
      document.sectionOrder,
      template,
      document.content?.customSections,
    ),
    [document.content?.customSections, document.sectionOrder, template],
  )

  const sections = useMemo(
    () => resolveCvSections(sectionOrder, document.content?.customSections),
    [document.content?.customSections, sectionOrder],
  )

  const fieldVisibility = useMemo(
    () => resolvePersonalFieldVisibility(template),
    [template],
  )

  const currentSectionId = activeSectionId && sections.some((s) => s.id === activeSectionId)
    ? activeSectionId
    : sections[0]?.id

  const currentSectionIndex = sections.findIndex((section) => section.id === currentSectionId)

  const updateContent = useCallback((patch) => {
    setDocument((prev) => {
      const next = updateCvContent(prev, patch)
      return withNormalizedSectionOrder(next, getCvTemplate(next.templateId || DEFAULT_TEMPLATE_ID))
    })
  }, [])

  const replaceDocument = useCallback((nextDocument) => {
    const normalized = normalizeBuilderDocument(nextDocument)
    templateIdRef.current = normalized.templateId
    setDocument(normalized)
    setActiveSectionId(null)
  }, [])

  const selectTemplate = useCallback((templateId) => {
    const nextTemplate = getCvTemplate(templateId)
    if (nextTemplate.comingSoon) return

    templateIdRef.current = templateId
    setDocument((prev) => {
      const nextMode = nextTemplate.sectionConfig?.skills?.mode
      let next = setCvTemplate(prev, templateId)
      if (nextMode === 'categories' || nextMode === 'rated') {
        next = updateCvContent(next, {
          skills: {
            ...(prev.content?.skills || {}),
            mode: nextMode,
          },
        })
      }
      const ordered = withNormalizedSectionOrder(next, nextTemplate)
      setActiveSectionId((active) => {
        if (active && ordered.sectionOrder.includes(active)) return active
        return ordered.sectionOrder[0] || null
      })
      return ordered
    })
  }, [])

  const goNext = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setActiveSectionId(sections[currentSectionIndex + 1].id)
    }
  }, [currentSectionIndex, sections])

  const goPrev = useCallback(() => {
    if (currentSectionIndex > 0) {
      setActiveSectionId(sections[currentSectionIndex - 1].id)
    }
  }, [currentSectionIndex, sections])

  const prefillUserEmail = useCallback((userEmail) => {
    if (!userEmail) return
    setDocument((prev) => prefillEmail(prev, userEmail))
  }, [])

  const addCustomSection = useCallback(() => {
    const newId = createCustomSectionId()
    const empty = createEmptyCustomSection(newId)

    setDocument((prev) => {
      const tpl = getCvTemplate(prev.templateId || DEFAULT_TEMPLATE_ID)
      const currentOrder = normalizeSectionOrder(
        prev.sectionOrder,
        tpl,
        prev.content?.customSections,
      )
      const activeIndex = currentOrder.indexOf(currentSectionId)
      const index = activeIndex >= 0 ? activeIndex : currentOrder.length - 1
      const nextOrder = insertAfterIndex(currentOrder, index, newId)

      return {
        ...prev,
        sectionOrder: nextOrder,
        content: {
          ...prev.content,
          customSections: {
            ...(prev.content.customSections || {}),
            [newId]: empty,
          },
        },
      }
    })

    setActiveSectionId(newId)
    return newId
  }, [currentSectionId])

  const moveCustomSection = useCallback((sectionId, direction) => {
    if (!isCustomSectionId(sectionId)) return

    setDocument((prev) => {
      const tpl = getCvTemplate(prev.templateId || DEFAULT_TEMPLATE_ID)
      const order = normalizeSectionOrder(
        prev.sectionOrder,
        tpl,
        prev.content?.customSections,
      )
      const index = order.indexOf(sectionId)
      if (index < 0) return prev

      const custom = prev.content?.customSections?.[sectionId]
      if (!hasCustomSectionContent(custom)) return prev

      if (direction === 'up') {
        if (index <= 0) return prev
        return { ...prev, sectionOrder: swapSectionOrder(order, index, index - 1) }
      }

      if (direction === 'down') {
        if (!hasContentBelow(order, index, prev.content)) return prev
        if (index >= order.length - 1) return prev
        return { ...prev, sectionOrder: swapSectionOrder(order, index, index + 1) }
      }

      return prev
    })
  }, [])

  const removeCustomSection = useCallback((sectionId) => {
    if (!isCustomSectionId(sectionId)) return

    let fallbackId = null
    setDocument((prev) => {
      const tpl = getCvTemplate(prev.templateId || DEFAULT_TEMPLATE_ID)
      const order = normalizeSectionOrder(
        prev.sectionOrder,
        tpl,
        prev.content?.customSections,
      )
      const index = order.indexOf(sectionId)
      const nextCustoms = { ...(prev.content.customSections || {}) }
      delete nextCustoms[sectionId]
      const nextOrder = removeFromSectionOrder(order, sectionId)
      fallbackId = nextOrder[Math.max(0, index - 1)] || nextOrder[0] || null

      return {
        ...prev,
        sectionOrder: nextOrder,
        content: {
          ...prev.content,
          customSections: nextCustoms,
        },
      }
    })
    setActiveSectionId(fallbackId)
  }, [])

  const canMoveCustomUp = useCallback((sectionId) => {
    if (!isCustomSectionId(sectionId)) return false
    const index = sectionOrder.indexOf(sectionId)
    if (index <= 0) return false
    return hasCustomSectionContent(document.content?.customSections?.[sectionId])
  }, [document.content?.customSections, sectionOrder])

  const canMoveCustomDown = useCallback((sectionId) => {
    if (!isCustomSectionId(sectionId)) return false
    const index = sectionOrder.indexOf(sectionId)
    if (index < 0 || index >= sectionOrder.length - 1) return false
    if (!hasCustomSectionContent(document.content?.customSections?.[sectionId])) return false
    return hasContentBelow(sectionOrder, index, document.content)
  }, [document.content, sectionOrder])

  return {
    document: { ...document, sectionOrder },
    template,
    sections,
    fieldVisibility,
    currentSectionId,
    currentSectionIndex,
    isFirstSection: currentSectionIndex <= 0,
    isLastSection: currentSectionIndex >= sections.length - 1,
    setActiveSectionId,
    updateContent,
    replaceDocument,
    selectTemplate,
    goNext,
    goPrev,
    prefillUserEmail,
    addCustomSection,
    moveCustomSection,
    removeCustomSection,
    canMoveCustomUp,
    canMoveCustomDown,
  }
}
