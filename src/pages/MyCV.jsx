import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CvCard from '../components/CvCard'
import LockIcon from '../components/LockIcon'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import { takePendingCvFile } from '../pendingCvUpload'
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
  const [dragging, setDragging] = useState(false)
  const [actionError, setActionError] = useState('')
  const [otherIndexBottom, setOtherIndexBottom] = useState(0)
  const [promoIndex, setPromoIndex] = useState(0)

  const promoSlides = [
    { title: t('myCv.promo1Title'), text: t('myCv.promo1Text'), accent: 'cyan' },
    { title: t('myCv.promo2Title'), text: t('myCv.promo2Text'), accent: 'pink' },
    { title: t('myCv.promo3Title'), text: t('myCv.promo3Text'), accent: 'amber' },
    { title: t('myCv.promo4Title'), text: t('myCv.promo4Text'), accent: 'violet' },
  ]

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPromoIndex((i) => (i + 1) % promoSlides.length)
    }, 7000)
    return () => window.clearTimeout(id)
  }, [promoIndex, promoSlides.length])

  const goPromo = (dir) => {
    setPromoIndex((i) => (i + dir + promoSlides.length) % promoSlides.length)
  }

  const canUpload = cvs.length < MAX_CV_COUNT

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!uploading && !dragging) setDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (uploading) return
    handleFile(event.dataTransfer?.files?.[0])
  }

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

  useEffect(() => {
    if (authLoading || !user || uploading) return
    const pending = takePendingCvFile()
    if (!pending) return
    void handleFile(pending)
    // Only consume pending upload once the user is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot after auth
  }, [authLoading, user])


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
          <div className="empty-state-icon" aria-hidden="true">
            <LockIcon />
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

  const renderOthersDropzone = () => (
    <button
      type="button"
      className={`cv-others-dropzone${dragging ? ' cv-others-dropzone--dragging' : ''}`}
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={uploading}
    >
      <span className="cv-others-dropzone-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="cv-others-dropzone-title">{t('myCv.addNew')}</span>
      {uploading ? (
        <div className="cv-dropzone-progress">
          <div className="cv-dropzone-progress-bar">
            <span style={{ width: `${Math.round(uploadProgress)}%` }} />
          </div>
          <span className="cv-dropzone-progress-text">
            {t('myCv.uploading', { progress: Math.round(uploadProgress) })}
          </span>
        </div>
      ) : (
        <span className="cv-others-dropzone-hint">{t('myCv.uploadHint')}</span>
      )}
      <span className="cv-dropzone-formats">{t('myCv.emptyUploadText')}</span>
    </button>
  )

  const renderOthersSlider = (index, setIndex) => {
    const hasUploadSlide = canUpload
    const slideCount = otherCvs.length + (hasUploadSlide ? 1 : 0)
    const maxIndex = Math.max(0, slideCount - 1)
    const safeIndex = Math.min(index, maxIndex)

    const dropHandlers = hasUploadSlide ? {
      onDragOver: handleDragOver,
      onDragEnter: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    } : {}

    return (
      <div className="cv-others-group">
        <div className="cv-others-head">
          <h3 className="cv-section-label">{t('myCv.sectionOthers', { max: MAX_CV_COUNT })}</h3>
          {slideCount > 1 && (
            <div className="cv-slider-nav">
              <button
                type="button"
                className="cv-slider-arrow"
                onClick={() => setIndex((safeIndex - 1 + slideCount) % slideCount)}
                aria-label={t('myCv.prev')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="cv-slider-count">{safeIndex + 1} / {slideCount}</span>
              <button
                type="button"
                className="cv-slider-arrow"
                onClick={() => setIndex((safeIndex + 1) % slideCount)}
                aria-label={t('myCv.next')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>

        {slideCount === 0 ? (
          <div className="cv-slider-viewport cv-others-slot">
            <div className="cv-others-empty cv-others-empty--full">
              <p className="cv-others-empty-text">{t('myCv.othersEmpty')}</p>
            </div>
          </div>
        ) : otherCvs.length === 0 ? (
          <div className="cv-slider-viewport cv-others-slot">
            {renderOthersDropzone()}
          </div>
        ) : (
          <div
            className={`cv-slider-viewport cv-others-slot${dragging && hasUploadSlide ? ' cv-others-slot--dragging' : ''}`}
            {...dropHandlers}
          >
            {dragging && hasUploadSlide && (
              <div className="cv-others-drop-overlay" aria-hidden="true">
                <span className="cv-others-dropzone-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>{t('myCv.uploadHint')}</span>
              </div>
            )}
            <div
              className="cv-slider-track"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {otherCvs.map((cv, i) => (
                <div className="cv-slider-slide" key={cv.id}>
                  <CvCard
                    cv={cv}
                    isActive={false}
                    colorIndex={i}
                    onRename={renameUserCv}
                    onDelete={removeCv}
                    onSetActive={setActiveUserCv}
                  />
                </div>
              ))}
              {hasUploadSlide && (
                <div className="cv-slider-slide">
                  {renderOthersDropzone()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="main my-cv-main">

      {/* ── Page header (only when CVs exist) ── */}
      {cvs.length > 0 && (
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
            <Link to="/create-cv" className="btn-gradient-wrap my-cv-cta">
              <span className="btn-gradient-inner">{t('myCv.guideAtsCreate')}</span>
            </Link>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="cv-file-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={uploading}
      />

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

          <section className="cv-section cv-others-col">
              <div className="cv-others-group cv-promo-group">
                <div className="cv-others-head">
                  <h3 className="cv-section-label">{t('myCv.promoHeading')}</h3>
                  <div className="cv-slider-nav">
                    <button
                      type="button"
                      className="cv-slider-arrow"
                      onClick={() => goPromo(-1)}
                      aria-label={t('myCv.prev')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span className="cv-slider-count">{promoIndex + 1} / {promoSlides.length}</span>
                    <button
                      type="button"
                      className="cv-slider-arrow"
                      onClick={() => goPromo(1)}
                      aria-label={t('myCv.next')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>

                <div className="cv-slider-viewport cv-promo-viewport">
                  <div
                    className="cv-slider-track"
                    style={{ transform: `translateX(-${promoIndex * 100}%)` }}
                  >
                    {promoSlides.map((slide, i) => (
                      <div className="cv-slider-slide" key={i}>
                        <div className={`cv-promo-card cv-promo-card--${slide.accent}`}>
                          <h4 className="cv-promo-title">{slide.title}</h4>
                          <p className="cv-promo-text">{slide.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cv-promo-dots" role="tablist">
                    {promoSlides.map((s, di) => (
                      <button
                        key={di}
                        type="button"
                        className={`cv-promo-dot${di === promoIndex ? ' cv-promo-dot--active' : ''}`}
                        onClick={() => setPromoIndex(di)}
                        aria-label={s.title}
                        aria-selected={di === promoIndex}
                        role="tab"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {renderOthersSlider(otherIndexBottom, setOtherIndexBottom)}
            </section>
        </div>
      )}

      {/* ── Empty state: no CVs yet ── */}
      {!showInitialLoading && !error && cvs.length === 0 && (
        <div className="cv-empty">
          <div className="cv-empty-hero">
            <span className="cv-empty-badge">{t('myCv.emptyBadge')}</span>
            <h2 className="cv-empty-title">{t('myCv.emptyTitle')}</h2>
            <p className="cv-empty-text">{t('myCv.emptyText')}</p>
          </div>

          <div className="cv-empty-actions">
            <button
              type="button"
              className={`cv-empty-card cv-empty-card--upload${dragging ? ' cv-empty-card--dragging' : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              disabled={uploading}
            >
              <span className="cv-empty-card-icon cv-empty-card-icon--upload" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="cv-empty-card-title">{t('myCv.emptyUploadTitle')}</h3>
              {uploading ? (
                <div className="cv-dropzone-progress">
                  <div className="cv-dropzone-progress-bar">
                    <span style={{ width: `${Math.round(uploadProgress)}%` }} />
                  </div>
                  <span className="cv-dropzone-progress-text">
                    {t('myCv.uploading', { progress: Math.round(uploadProgress) })}
                  </span>
                </div>
              ) : (
                <p className="cv-empty-card-text">{t('myCv.uploadHint')}</p>
              )}
              <span className="cv-dropzone-formats">{t('myCv.emptyUploadText')}</span>
            </button>

            <div className="cv-empty-or">
              <span>{t('myCv.emptyOr')}</span>
            </div>

            <Link to="/create-cv" className="btn-gradient-wrap cv-empty-create-link">
              <span className="btn-gradient-inner cv-empty-cta-inner">
                {t('myCv.guideAtsCreate')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      )}

      {!showInitialLoading && !error && !canUpload && cvs.length > 0 && (
        <p className="cv-limit-note">{t('myCv.limitReached', { max: MAX_CV_COUNT })}</p>
      )}

    </main>
  )
}
