import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CvCard from '../components/CvCard'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import { MAX_CV_COUNT } from '../storageService'

const MAX_SIZE = 5 * 1024 * 1024


export default function MyCV() {
  const { user, openLogin, authLoading } = useAuth()
  const { t } = useLanguage()
  const {
    cvs,
    activeCvPath,
    loading,
    error,
    activePreviewUrl,
    activePreviewLoading,
    uploadUserCv,
    removeCv,
    renameUserCv,
    setActiveUserCv,
  } = useResume()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [actionError, setActionError] = useState('')
  const [otherIndex, setOtherIndex] = useState(0)

  const canUpload = cvs.length < MAX_CV_COUNT

  const handleFile = async (file) => {
    if (!file || !canUpload) return
    setActionError('')
    if (file.type !== 'application/pdf') { setActionError(t('myCv.errorPdfOnly')); return }
    if (file.size > MAX_SIZE) { setActionError(t('myCv.errorTooLarge')); return }
    setUploading(true)
    setUploadProgress(0)
    try {
      await uploadUserCv(file, setUploadProgress)
    } catch (err) {
      setActionError(err?.code === 'MAX_CV_COUNT'
        ? t('myCv.errorMaxCvs', { max: MAX_CV_COUNT })
        : t('myCv.uploadError'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }


  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('myCv.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="main">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 15v2M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="empty-state-title">{t('myCv.signInRequired')}</h2>
          <p className="empty-state-text">{t('myCv.signInText')}</p>
          <button type="button" className="btn-gradient-wrap" onClick={openLogin}>
            <span className="btn-gradient-inner">{t('nav.signIn')}</span>
          </button>
        </div>
      </main>
    )
  }

  const showInitialLoading = loading && cvs.length === 0 && !error
  const activeCv = cvs.find((cv) => cv.id === activeCvPath || cv.fullPath === activeCvPath)
  const otherCvs = cvs.filter((cv) => cv !== activeCv)
  const safeIndex = Math.min(otherIndex, Math.max(0, otherCvs.length - 1))

  return (
    <main className="main my-cv-main">

      {/* ── Page header ── */}
      <div className="my-cv-header">
        <div className="my-cv-header-left">
          <h1 className="my-cv-title">{t('myCv.title')}</h1>
          <p className="my-cv-subtitle">{t('myCv.subtitle')}</p>
        </div>
        <div className="my-cv-actions">
          {canUpload && (
            <button
              type="button"
              className="my-cv-upload-btn"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span className="my-cv-upload-progress-text">{t('myCv.uploading', { progress: Math.round(uploadProgress) })}</span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {t('myCv.addNew')}
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="cv-file-input"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={uploading}
          />
          <Link to="/create-cv" className="btn-gradient-wrap my-cv-cta">
            <span className="btn-gradient-inner">{t('myCv.guideAtsCreate')}</span>
          </Link>
        </div>
      </div>

      {/* ── Errors ── */}
      {error && (
        <div className="file-errors cv-errors">
          <p className="file-error-item">{t('myCv.loadError')}</p>
        </div>
      )}
      {actionError && (
        <div className="file-errors cv-errors">
          <p className="file-error-item">{actionError}</p>
        </div>
      )}

      {showInitialLoading && <p className="page-loading">{t('myCv.loading')}</p>}

      {/* ── CV workspace: active + others slider ── */}
      {!showInitialLoading && !error && cvs.length > 0 && (
        <div className="cv-workspace">
          {activeCv && (
            <section className="cv-section cv-active-col">
              <h3 className="cv-section-label">{t('myCv.sectionActive')}</h3>
              <CvCard
                cv={activeCv}
                isActive
                previewUrl={activePreviewUrl}
                previewLoading={activePreviewLoading}
                onRename={renameUserCv}
                onDelete={removeCv}
                onSetActive={setActiveUserCv}
              />
            </section>
          )}

          {otherCvs.length > 0 && (
            <section className="cv-section cv-others-col">
              <div className="cv-others-head">
                <h3 className="cv-section-label">{t('myCv.sectionOthers')}</h3>
                {otherCvs.length > 1 && (
                  <div className="cv-slider-nav">
                    <button
                      type="button"
                      className="cv-slider-arrow"
                      onClick={() => setOtherIndex((i) => Math.max(0, Math.min(i, otherCvs.length - 1) - 1))}
                      disabled={safeIndex === 0}
                      aria-label={t('myCv.prev')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span className="cv-slider-count">{safeIndex + 1} / {otherCvs.length}</span>
                    <button
                      type="button"
                      className="cv-slider-arrow"
                      onClick={() => setOtherIndex((i) => Math.min(otherCvs.length - 1, Math.min(i, otherCvs.length - 1) + 1))}
                      disabled={safeIndex === otherCvs.length - 1}
                      aria-label={t('myCv.next')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="cv-slider-viewport">
                <div
                  className="cv-slider-track"
                  style={{ transform: `translateX(-${safeIndex * 100}%)` }}
                >
                  {otherCvs.map((cv) => (
                    <div className="cv-slider-slide" key={cv.id}>
                      <CvCard
                        cv={cv}
                        isActive={false}
                        onRename={renameUserCv}
                        onDelete={removeCv}
                        onSetActive={setActiveUserCv}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {!showInitialLoading && !error && !canUpload && cvs.length > 0 && (
        <p className="cv-limit-note">{t('myCv.limitReached', { max: MAX_CV_COUNT })}</p>
      )}

    </main>
  )
}
