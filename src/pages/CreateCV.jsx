import { useEffect, useRef, useState } from 'react'
import CvPreviewPanel from '../components/createCv/CvPreviewPanel'
import CvPreviewErrorBoundary from '../components/createCv/CvPreviewErrorBoundary'
import CvSectionStepper from '../components/createCv/CvSectionStepper'
import TemplateSelectOverlay from '../components/createCv/TemplateSelectOverlay'
import { useCvBuilder } from '../createCv/hooks/useCvBuilder'
import { getSectionEditorProps } from '../createCv/sections/registry'
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
  const loadedDraftUserRef = useRef(null)
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

  return (
    <main className={`main create-cv-main${showTemplateOverlay ? ' create-cv-main--picker-open' : ''}`}>
      {showTemplateOverlay && (
        <TemplateSelectOverlay
          initialTemplateId={document.templateId}
          onConfirm={handleTemplateConfirm}
          t={t}
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
          t={t}
          prevLabel={t('createCv.prev')}
          nextLabel={t('createCv.next')}
        />

        <div className="create-cv-workspace">
          <div className="create-cv-editor">
            <form className="create-cv-panel" onSubmit={handleSectionSubmit}>
              {SectionEditor && activeSection && (
                <SectionEditor
                  {...getSectionEditorProps(activeSection, {
                    content: document.content,
                    onContentChange: updateContent,
                    t,
                    stepNumber: String(currentSectionIndex + 1).padStart(2, '0'),
                    sectionConfig: template.sectionConfig,
                    fieldVisibility,
                  })}
                />
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

                <div className="create-cv-actions-spacer" />

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
