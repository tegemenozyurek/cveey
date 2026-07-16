import { useEffect, useRef, useState } from 'react'
import ConfirmResetCvModal from '../components/createCv/ConfirmResetCvModal'
import CvPreviewPanel from '../components/createCv/CvPreviewPanel'
import CvPreviewErrorBoundary from '../components/createCv/CvPreviewErrorBoundary'
import CvSectionStepper from '../components/createCv/CvSectionStepper'
import TemplateSelectOverlay from '../components/createCv/TemplateSelectOverlay'
import { useCvBuilder } from '../createCv/hooks/useCvBuilder'
import {
  createSectionDefault,
  getSectionEditorProps,
} from '../createCv/sections/registry'
import {
  createEmptyCvDocument,
  isCustomSectionId,
  prefillEmail,
} from '../createCv/cvDocument'
import { loadCvDraft, saveCvDraft } from '../createCv/draftStorage'
import { buildCvPdfFileName } from '../createCv/exportCvPdf'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function CreateCV() {
  const { user, openLogin, authLoading } = useAuth()
  const { t } = useLanguage()
  const [showTemplateOverlay, setShowTemplateOverlay] = useState(true)
  const [saveStatus, setSaveStatus] = useState('')
  const [draftSaved, setDraftSaved] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [deleteCustomId, setDeleteCustomId] = useState(null)
  const loadedDraftUserRef = useRef(null)
  const pendingStatusRef = useRef('')
  const previewRef = useRef(null)
  const {
    document,
    template,
    sections,
    fieldVisibility,
    currentSectionId,
    currentSectionIndex,
    isFirstSection,
    isLastSection,
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
  } = useCvBuilder()

  useEffect(() => {
    prefillUserEmail(user?.email)
  }, [user?.email, prefillUserEmail])

  useEffect(() => {
    if (!user?.uid || loadedDraftUserRef.current === user.uid) return
    loadedDraftUserRef.current = user.uid
    const draft = loadCvDraft(user.uid, user.email)
    if (draft) replaceDocument(draft)
  }, [replaceDocument, user?.email, user?.uid])

  useEffect(() => {
    if (pendingStatusRef.current) {
      setSaveStatus(pendingStatusRef.current)
      pendingStatusRef.current = ''
      setDraftSaved(false)
      setDownloadStatus('')
      return
    }
    setSaveStatus('')
    setDraftSaved(false)
    setDownloadStatus('')
  }, [document])

  if (authLoading) {
    return (
      <main className="main create-cv-main">
        <p className="page-loading">{t('createCv.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="main create-cv-main">
        <div className="empty-state">
          <h2 className="empty-state-title">{t('createCv.signInRequired')}</h2>
          <p className="empty-state-text">{t('createCv.signInText')}</p>
          <button type="button" className="btn-gradient-wrap" onClick={openLogin}>
            <span className="btn-gradient-inner">{t('nav.signIn')}</span>
          </button>
        </div>
      </main>
    )
  }

  const activeSection = sections.find((section) => section.id === currentSectionId)
  const SectionEditor = activeSection?.Editor
  const activeSectionLabel = activeSection
    ? (activeSection.navLabel
      || (activeSection.navKey ? t(activeSection.navKey) : t('createCv.custom.fallbackTitle')))
    : ''

  const handleTemplateConfirm = (templateId) => {
    selectTemplate(templateId)
    setShowTemplateOverlay(false)
  }

  const handleSaveDraft = () => {
    const saved = saveCvDraft(user.uid, document)
    if (saved) {
      setSaveStatus(t('createCv.draftSaved'))
      setDraftSaved(true)
    } else {
      setSaveStatus(t('createCv.draftSaveFailed'))
      setDraftSaved(false)
    }
  }

  const handleDownloadCv = async () => {
    if (!previewRef.current) return

    setIsDownloading(true)
    setDownloadStatus('')
    try {
      const fileName = buildCvPdfFileName(document.content.personal.fullName)
      await previewRef.current.downloadPdf(fileName)
      setDownloadStatus(t('createCv.downloadSuccess'))
    } catch {
      setDownloadStatus(t('createCv.downloadFailed'))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSectionSubmit = (event) => {
    event.preventDefault()
    goNext()
  }

  const handleConfirmReset = () => {
    if (resetTarget === 'current' && currentSectionId) {
      const empty = createSectionDefault(currentSectionId, {
        email: user.email || '',
        skillsMode: document.content.skills?.mode ?? template.sectionConfig?.skills?.mode,
        customSections: document.content.customSections,
      })
      pendingStatusRef.current = t('createCv.resetCurrentDone')
      if (isCustomSectionId(currentSectionId)) {
        updateContent({
          customSections: {
            ...(document.content.customSections || {}),
            [currentSectionId]: empty,
          },
        })
      } else {
        updateContent({ [currentSectionId]: empty })
      }
    }

    if (resetTarget === 'all') {
      const emptyDoc = prefillEmail(
        createEmptyCvDocument(user.email || '', document.templateId),
        user.email || '',
      )
      pendingStatusRef.current = t('createCv.resetAllDone')
      replaceDocument(emptyDoc)
      saveCvDraft(user.uid, emptyDoc)
    }

    setResetTarget(null)
  }

  const handleConfirmDeleteCustom = () => {
    if (!deleteCustomId) return
    pendingStatusRef.current = t('createCv.custom.deleted')
    removeCustomSection(deleteCustomId)
    setDeleteCustomId(null)
  }

  const editorProps = activeSection
    ? getSectionEditorProps(activeSection, {
      content: document.content,
      onContentChange: updateContent,
      t,
      stepNumber: String(currentSectionIndex + 1).padStart(2, '0'),
      sectionConfig: template.sectionConfig,
      fieldVisibility,
      onMoveUp: () => moveCustomSection(currentSectionId, 'up'),
      onMoveDown: () => moveCustomSection(currentSectionId, 'down'),
      onDelete: () => setDeleteCustomId(currentSectionId),
      canMoveUp: canMoveCustomUp(currentSectionId),
      canMoveDown: canMoveCustomDown(currentSectionId),
    })
    : null

  return (
    <main className={`main create-cv-main${showTemplateOverlay ? ' create-cv-main--picker-open' : ''}`}>
      {showTemplateOverlay && (
        <TemplateSelectOverlay
          initialTemplateId={document.templateId}
          onConfirm={handleTemplateConfirm}
          t={t}
        />
      )}

      {resetTarget && (
        <ConfirmResetCvModal
          title={
            resetTarget === 'all'
              ? t('createCv.resetAllTitle')
              : t('createCv.resetCurrentTitle')
          }
          message={
            resetTarget === 'all'
              ? t('createCv.resetAllMessage')
              : t('createCv.resetCurrentMessage', { section: activeSectionLabel })
          }
          confirmLabel={
            resetTarget === 'all'
              ? t('createCv.resetAllConfirm')
              : t('createCv.resetCurrentConfirm')
          }
          onConfirm={handleConfirmReset}
          onCancel={() => setResetTarget(null)}
        />
      )}

      {deleteCustomId && (
        <ConfirmResetCvModal
          title={t('createCv.custom.deleteTitle')}
          message={t('createCv.custom.deleteMessage')}
          confirmLabel={t('createCv.custom.deleteConfirm')}
          onConfirm={handleConfirmDeleteCustom}
          onCancel={() => setDeleteCustomId(null)}
        />
      )}

      <div
        className={`create-cv-page-content${showTemplateOverlay ? ' create-cv-page-content--hidden' : ' create-cv-page-content--visible'}`}
        aria-hidden={showTemplateOverlay}
        inert={showTemplateOverlay}
      >
        <div className="create-cv-topbar">
          <h1 className="create-cv-page-title">{t('createCv.title')}</h1>

          <div className="create-cv-topbar-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm create-cv-change-template"
              onClick={() => setShowTemplateOverlay(true)}
            >
              {t('createCv.template.change')}
            </button>
            <span className="create-cv-ats-badge">{t('createCv.atsBadge')}</span>
          </div>
        </div>

        <CvSectionStepper
          sections={sections}
          currentSectionId={currentSectionId}
          currentSectionIndex={currentSectionIndex}
          onSelect={setActiveSectionId}
          onAddCategory={addCustomSection}
          t={t}
          prevLabel={t('createCv.prev')}
          nextLabel={t('createCv.next')}
          addCategoryLabel={t('createCv.custom.add')}
        />

        <div className="create-cv-workspace">
          <div className="create-cv-editor">
            <form className="create-cv-panel" onSubmit={handleSectionSubmit}>
              {SectionEditor && editorProps && (
                <SectionEditor {...editorProps} />
              )}

              <div className="create-cv-actions">
                <button
                  type="button"
                  className="create-cv-nav-arrow-btn"
                  onClick={goPrev}
                  disabled={isFirstSection}
                  aria-label={t('createCv.prev')}
                >
                  ‹
                </button>

                <div className="create-cv-actions-spacer create-cv-reset-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm create-cv-reset-btn"
                    onClick={() => setResetTarget('current')}
                  >
                    {t('createCv.resetCurrent')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm create-cv-reset-btn create-cv-reset-btn--all"
                    onClick={() => setResetTarget('all')}
                  >
                    {t('createCv.resetAll')}
                  </button>
                </div>

                {isLastSection ? (
                  <div className="create-cv-final-actions">
                    <button type="button" className="btn-gradient-wrap" onClick={handleSaveDraft}>
                      <span className="btn-gradient-inner">{t('createCv.saveDraft')}</span>
                    </button>
                    {draftSaved && (
                      <button
                        type="button"
                        className="btn btn-ghost create-cv-download-btn"
                        onClick={handleDownloadCv}
                        disabled={isDownloading}
                      >
                        {isDownloading ? t('createCv.downloading') : t('createCv.downloadCv')}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="create-cv-nav-arrow-btn"
                    aria-label={t('createCv.next')}
                  >
                    ›
                  </button>
                )}
              </div>
              {(saveStatus || downloadStatus) && (
                <p className="create-cv-save-status" role="status">
                  {[saveStatus, downloadStatus].filter(Boolean).join(' · ')}
                </p>
              )}
            </form>
          </div>

          <CvPreviewErrorBoundary
            resetKey={document}
            title={t('createCv.preview.errorTitle')}
            message={t('createCv.preview.errorMessage')}
          >
            <CvPreviewPanel
              ref={previewRef}
              document={document}
              template={template}
              visibleSectionIds={sections.map((section) => section.id)}
              fieldVisibility={fieldVisibility}
              t={t}
            />
          </CvPreviewErrorBoundary>
        </div>
      </div>
    </main>
  )
}
