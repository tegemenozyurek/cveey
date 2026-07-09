import { useRef, useState } from 'react'
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
    uploadUserCv,
    removeCv,
    renameUserCv,
    setActiveUserCv,
  } = useResume()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [actionError, setActionError] = useState('')
  const [dragging, setDragging] = useState(false)

  const canUpload = cvs.length < MAX_CV_COUNT

  const handleFile = async (file) => {
    if (!file || !canUpload) return

    setActionError('')

    if (file.type !== 'application/pdf') {
      setActionError(t('myCv.errorPdfOnly'))
      return
    }

    if (file.size > MAX_SIZE) {
      setActionError(t('myCv.errorTooLarge'))
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      await uploadUserCv(file, setUploadProgress)
    } catch (err) {
      if (err?.code === 'MAX_CV_COUNT') {
        setActionError(t('myCv.errorMaxCvs', { max: MAX_CV_COUNT }))
      } else {
        setActionError(t('myCv.uploadError'))
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onFileChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
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

  return (
    <main className="main my-cv-main">
      {showInitialLoading && (
        <p className="page-loading">{t('myCv.loading')}</p>
      )}

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

      {!showInitialLoading && !error && cvs.length > 0 && (() => {
        const activeCv = cvs.find((cv) => cv.fullPath === activeCvPath)
        const otherCvs = cvs.filter((cv) => cv.fullPath !== activeCvPath)

        return (
          <div className="cv-list">
            {activeCv && (
              <section className="cv-section">
                <h2 className="cv-section-label">{t('myCv.sectionActive')}</h2>
                <CvCard
                  cv={activeCv}
                  isActive
                  onRename={renameUserCv}
                  onDelete={removeCv}
                  onSetActive={setActiveUserCv}
                />
              </section>
            )}

            {otherCvs.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-section-label">{t('myCv.sectionOthers')}</h2>
                <div className="cv-section-list">
                  {otherCvs.map((cv) => (
                    <CvCard
                      key={cv.fullPath}
                      cv={cv}
                      isActive={false}
                      onRename={renameUserCv}
                      onDelete={removeCv}
                      onSetActive={setActiveUserCv}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      })()}

      {!showInitialLoading && !error && canUpload && (
        <div
          className={`cv-upload-card${dragging ? ' dragging' : ''}${uploading ? ' cv-upload-card--busy' : ''}${cvs.length > 0 ? ' cv-upload-card--compact' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="cv-file-input"
            onChange={onFileChange}
            disabled={uploading}
          />
          <div className="cv-upload-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="cv-upload-hint">
            {cvs.length === 0 ? t('myCv.uploadHint') : t('myCv.addAnother')}
          </p>
          <p className="cv-upload-formats">
            {t('myCv.uploadFormats', { max: MAX_CV_COUNT, count: cvs.length })}
          </p>
          {uploading && (
            <div className="cv-upload-progress">
              <div className="upload-progress">
                <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="cv-upload-progress-label">
                {t('myCv.uploading', { progress: Math.round(uploadProgress) })}
              </p>
            </div>
          )}
        </div>
      )}

      {!showInitialLoading && !error && !canUpload && cvs.length > 0 && (
        <p className="cv-limit-note">{t('myCv.limitReached', { max: MAX_CV_COUNT })}</p>
      )}
    </main>
  )
}
