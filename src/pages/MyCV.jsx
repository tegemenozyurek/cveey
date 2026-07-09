import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useResume } from '../context/ResumeContext'
import { getCvDownloadUrl, MAX_CV_COUNT } from '../storageService'

const MAX_SIZE = 5 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso, lang) {
  return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function MyCV() {
  const { user, openLogin, authLoading } = useAuth()
  const { lang, t } = useLanguage()
  const {
    cvs,
    activeCvPath,
    loading,
    error,
    uploadUserCv,
    removeCv,
    setActiveUserCv,
  } = useResume()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [actionError, setActionError] = useState('')
  const [deletingPath, setDeletingPath] = useState(null)
  const [confirmDeletePath, setConfirmDeletePath] = useState(null)
  const [activatingPath, setActivatingPath] = useState(null)
  const [viewingPath, setViewingPath] = useState(null)
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

  const onDelete = async (fullPath) => {
    setDeletingPath(fullPath)
    setActionError('')
    try {
      await removeCv(fullPath)
      setConfirmDeletePath(null)
    } catch {
      setActionError(t('myCv.deleteError'))
    } finally {
      setDeletingPath(null)
    }
  }

  const onSetActive = async (fullPath) => {
    setActivatingPath(fullPath)
    setActionError('')
    try {
      await setActiveUserCv(fullPath)
    } catch {
      setActionError(t('myCv.activateError'))
    } finally {
      setActivatingPath(null)
    }
  }

  const onView = async (fullPath) => {
    setViewingPath(fullPath)
    setActionError('')
    try {
      const url = await getCvDownloadUrl(fullPath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setActionError(t('myCv.viewError'))
    } finally {
      setViewingPath(null)
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
          <button type="button" className="btn btn-primary" onClick={openLogin}>
            {t('nav.signIn')}
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

      {!showInitialLoading && !error && cvs.length > 0 && (
        <div className="cv-list">
          {cvs.map((cv) => {
            const isActive = cv.fullPath === activeCvPath
            const isDeleting = deletingPath === cv.fullPath
            const isActivating = activatingPath === cv.fullPath

            return (
              <article
                key={cv.fullPath}
                className={`cv-list-item${isActive ? ' cv-list-item--active' : ''}`}
              >
                <div className="cv-list-item-main">
                  <div className="cv-list-item-info">
                    <div className="cv-list-item-top">
                      <h2 className="cv-list-item-name">{cv.displayName}</h2>
                      {isActive && (
                        <span className="cv-active-badge">{t('myCv.active')}</span>
                      )}
                    </div>
                    <p className="cv-list-item-meta">
                      {formatBytes(cv.size)} · {formatDate(cv.updated, lang)}
                    </p>
                  </div>

                  <div className="cv-list-item-actions">
                    <button
                      type="button"
                      className="btn-gradient-wrap btn-gradient-wrap--sm"
                      onClick={() => onView(cv.fullPath)}
                      disabled={viewingPath === cv.fullPath}
                    >
                      <span className="btn-gradient-inner">
                        {viewingPath === cv.fullPath ? t('myCv.opening') : t('myCv.view')}
                      </span>
                    </button>
                    {!isActive && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onSetActive(cv.fullPath)}
                        disabled={isActivating || isDeleting}
                      >
                        {isActivating ? t('myCv.activating') : t('myCv.setActive')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDeletePath(cv.fullPath)}
                      disabled={isDeleting || isActivating}
                    >
                      {t('myCv.delete')}
                    </button>
                  </div>
                </div>

                {confirmDeletePath === cv.fullPath && (
                  <div className="cv-delete-confirm">
                    <p className="cv-delete-text">{t('myCv.deleteConfirm')}</p>
                    <div className="cv-delete-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirmDeletePath(null)}
                        disabled={isDeleting}
                      >
                        {t('myCv.cancel')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-destructive btn-sm"
                        onClick={() => onDelete(cv.fullPath)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? t('myCv.deleting') : t('myCv.delete')}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

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
