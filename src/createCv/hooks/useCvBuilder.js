import { useCallback, useMemo, useRef, useState } from 'react'
import { DEFAULT_TEMPLATE_ID } from '../constants'
import {
  createEmptyCvDocument,
  normalizeCvDocument,
  prefillEmail,
  setCvOccupation,
  setCvTemplate,
  updateCvContent,
} from '../cvDocument'
import {
  resolveActiveSectionIds,
  resolvePersonalFieldVisibility,
} from '../fieldVisibility'
import { getCvOccupation } from '../occupations/registry'
import { resolveCvSections } from '../sections/registry'
import { getCvTemplate } from '../templates/registry'

export function useCvBuilder({ email = '' } = {}) {
  const [document, setDocument] = useState(() =>
    normalizeCvDocument(prefillEmail(createEmptyCvDocument(email), email)),
  )
  const [activeSectionId, setActiveSectionId] = useState(null)
  const occupationIdRef = useRef(document.occupationId)
  const templateIdRef = useRef(document.templateId)
  occupationIdRef.current = document.occupationId
  templateIdRef.current = document.templateId

  const template = useMemo(
    () => getCvTemplate(document.templateId || DEFAULT_TEMPLATE_ID),
    [document.templateId],
  )

  const occupation = useMemo(
    () => getCvOccupation(document.occupationId),
    [document.occupationId],
  )

  const activeSectionIds = useMemo(
    () => resolveActiveSectionIds(occupation, template),
    [occupation, template],
  )

  const sections = useMemo(
    () => resolveCvSections(activeSectionIds),
    [activeSectionIds],
  )

  const fieldVisibility = useMemo(
    () => resolvePersonalFieldVisibility(occupation, template),
    [occupation, template],
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
    occupationIdRef.current = normalized.occupationId
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
      const nextIds = resolveActiveSectionIds(
        getCvOccupation(occupationIdRef.current),
        nextTemplate,
      )
      if (prev && nextIds.includes(prev)) return prev
      return nextIds[0] || null
    })
  }, [])

  const selectOccupation = useCallback((occupationId) => {
    const nextOccupation = getCvOccupation(occupationId)
    occupationIdRef.current = nextOccupation.id
    setDocument((prev) => setCvOccupation(prev, nextOccupation.id))
    setActiveSectionId((prev) => {
      const nextIds = resolveActiveSectionIds(
        nextOccupation,
        getCvTemplate(templateIdRef.current),
      )
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
    occupation,
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
    selectOccupation,
    goNext,
    goPrev,
    prefillUserEmail,
  }
}
