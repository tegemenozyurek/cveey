import { useEffect, useRef, useState } from 'react'
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

  const renderOthersSlider = (index, setIndex) => {
    const safeIndex = Math.min(index, Math.max(0, otherCvs.length - 1))
    return (
      <div className="cv-others-group">
        <div className="cv-others-head">
          <h3 className="cv-section-label">{t('myCv.sectionOthers', { max: MAX_CV_COUNT })}</h3>
          {otherCvs.length > 1 && (
            <div className="cv-slider-nav">
              <button
                type="button"
                className="cv-slider-arrow"
                onClick={() => setIndex((safeIndex - 1 + otherCvs.length) % otherCvs.length)}
                aria-label={t('myCv.prev')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="cv-slider-count">{safeIndex + 1} / {otherCvs.length}</span>
              <button
                type="button"
                className="cv-slider-arrow"
                onClick={() => setIndex((safeIndex + 1) % otherCvs.length)}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="main my-cv-main">

      {/* ── Page header ── */}
      <div className="my-cv-header">
        <div className="my-cv-header-left">
          <h1 className="my-cv-title">{t('myCv.title')}</h1>
          <p className="my-cv-subtitle">{t('myCv.subtitle')}</p>
        </div>
        <div className="my-cv-actions">
          {cvs.length > 0 && canUpload && (
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
          {cvs.length > 0 && (
            <Link to="/create-cv" className="btn-gradient-wrap my-cv-cta">
              <span className="btn-gradient-inner">{t('myCv.guideAtsCreate')}</span>
            </Link>
          )}
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
          )}
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

          <div className="cv-empty-options">
            <Link to="/create-cv" className="cv-empty-card cv-empty-card--create">
              <span className="cv-empty-card-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l2.09 4.99L19 9.27l-3.5 3.34.92 5.09L12 15.4l-4.42 2.3.92-5.09L5 9.27l4.91-1.28L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="cv-empty-card-title">{t('myCv.emptyCreateTitle')}</h3>
              <p className="cv-empty-card-text">{t('myCv.emptyCreateText')}</p>
              <span className="cv-empty-card-action btn-gradient-wrap">
                <span className="btn-gradient-inner">{t('myCv.guideAtsCreate')}</span>
              </span>
            </Link>

            <button
              type="button"
              className="cv-empty-card cv-empty-card--upload"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span className="cv-empty-card-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <h3 className="cv-empty-card-title">{t('myCv.emptyUploadTitle')}</h3>
              <p className="cv-empty-card-text">{t('myCv.emptyUploadText')}</p>
              <span className="cv-empty-card-action cv-empty-card-action--ghost">
                {uploading
                  ? t('myCv.uploading', { progress: Math.round(uploadProgress) })
                  : t('myCv.addNew')}
              </span>
            </button>
          </div>
        </div>
      )}

      {!showInitialLoading && !error && !canUpload && cvs.length > 0 && (
        <p className="cv-limit-note">{t('myCv.limitReached', { max: MAX_CV_COUNT })}</p>
      )}

    </main>
  )
}
