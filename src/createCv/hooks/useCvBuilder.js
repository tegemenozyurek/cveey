import { useCallback, useMemo, useRef, useState } from 'react'
import { DEFAULT_TEMPLATE_ID } from '../constants'
import {
  createEmptyCvDocument,
  normalizeCvDocument,
  prefillEmail,
  setCvTemplate,
  updateCvContent,
} from '../cvDocument'
import {
  resolveActiveSectionIds,
  resolvePersonalFieldVisibility,
} from '../fieldVisibility'
import { resolveCvSections } from '../sections/registry'
import { getCvTemplate } from '../templates/registry'

export function useCvBuilder({ email = '' } = {}) {
  const [document, setDocument] = useState(() =>
    normalizeCvDocument(prefillEmail(createEmptyCvDocument(email), email)),
  )
  const [activeSectionId, setActiveSectionId] = useState(null)
  const templateIdRef = useRef(document.templateId)
  templateIdRef.current = document.templateId

  const template = useMemo(
    () => getCvTemplate(document.templateId || DEFAULT_TEMPLATE_ID),
    [document.templateId],
  )

  const activeSectionIds = useMemo(
    () => resolveActiveSectionIds(template),
    [template],
  )

  const sections = useMemo(
    () => resolveCvSections(activeSectionIds),
    [activeSectionIds],
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
    setDocument((prev) => updateCvContent(prev, patch))
  }, [])

  const replaceDocument = useCallback((nextDocument) => {
    const normalized = normalizeCvDocument(nextDocument)
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
      const next = setCvTemplate(prev, templateId)
      if (nextMode !== 'categories' && nextMode !== 'rated') return next

      return updateCvContent(next, {
        skills: {
          ...(prev.content?.skills || {}),
          mode: nextMode,
        },
      })
    })
    setActiveSectionId((prev) => {
      const nextIds = resolveActiveSectionIds(nextTemplate)
      if (prev && nextIds.includes(prev)) return prev
      return nextIds[0] || null
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

  return {
    document,
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
  }
}
