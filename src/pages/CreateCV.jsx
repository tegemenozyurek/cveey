import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CvPreviewPanel from '../components/createCv/CvPreviewPanel'
import CvPreviewErrorBoundary from '../components/createCv/CvPreviewErrorBoundary'
import OccupationSelect from '../components/createCv/OccupationSelect'
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
    selectOccupation,
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
        inert={showTemplateOverlay ? '' : undefined}
      >
        <div className="create-cv-topbar">
          <Link to="/my-cv" className="create-cv-back">
            <span aria-hidden="true">←</span>
            {t('createCv.backToMyCv')}
          </Link>
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

        <div className="create-cv-workspace">
          <div className="create-cv-editor">
            <header className="create-cv-header">
              <div className="create-cv-header-copy">
                <h1 className="create-cv-title">{t('createCv.title')}</h1>
                <p className="create-cv-subtitle">{t('createCv.subtitle')}</p>
              </div>
              <OccupationSelect
                value={document.occupationId}
                onChange={selectOccupation}
                t={t}
              />
            </header>

            <nav className="create-cv-nav" aria-label={t('createCv.sectionsAria')}>
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  className={`create-cv-nav-item${currentSectionId === section.id ? ' create-cv-nav-item--active' : ''}`}
                  onClick={() => setActiveSectionId(section.id)}
                  aria-current={currentSectionId === section.id ? 'step' : undefined}
                >
                  <span className="create-cv-nav-index">{String(index + 1).padStart(2, '0')}</span>
                  <span>{t(section.navKey)}</span>
                </button>
              ))}
            </nav>

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
                {!isFirstSection && (
                  <button type="button" className="btn btn-ghost" onClick={goPrev}>
                    {t('createCv.prev')}
                  </button>
                )}
                <div className="create-cv-actions-spacer" />
                {!isLastSection ? (
                  <button type="submit" className="btn-gradient-wrap">
                    <span className="btn-gradient-inner">{t('createCv.next')}</span>
                  </button>
                ) : (
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
