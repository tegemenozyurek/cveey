import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { downloadCvFile, getCvDownloadUrl } from '../storageService'

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconView() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v13M12 16l-4-4M12 16l4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l.8 14.2A2 2 0 008.8 22h6.4a2 2 0 001.99-1.8L18 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

const PDF_EXTENSION = '.pdf'
const MAX_CV_BASE_NAME_LENGTH = 116

function stripPdfExtension(name) {
  return name.replace(/\.pdf$/i, '')
}

function buildCvDisplayName(baseName) {
  const trimmed = baseName.trim()
  if (!trimmed) return ''
  return `${stripPdfExtension(trimmed)}${PDF_EXTENSION}`
}

export default function CvCard({
  cv,
  isActive,
  previewUrl = '',
  previewLoading = false,
  onRename,
  onDelete,
  onSetActive,
}) {
  const { lang, t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(stripPdfExtension(cv.displayName))
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setEditName(stripPdfExtension(cv.displayName))
  }, [cv.displayName, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    setIframeLoaded(false)
    if (!previewUrl) return undefined

    const timeout = window.setTimeout(() => {
      setIframeLoaded(true)
    }, 8000)

    return () => window.clearTimeout(timeout)
  }, [previewUrl, cv.fullPath])

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))

  const startEdit = () => {
    setLocalError('')
    setConfirmDelete(false)
    setEditName(stripPdfExtension(cv.displayName))
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditName(stripPdfExtension(cv.displayName))
    setEditing(false)
    setLocalError('')
  }

  const saveEdit = async () => {
    const nextName = buildCvDisplayName(editName)
    if (!nextName) {
      setLocalError(t('myCv.errorEmptyName'))
      return
    }
    if (nextName === cv.displayName) {
      setEditing(false)
      return
    }

    setSaving(true)
    setLocalError('')
    try {
      await onRename(cv.id, nextName)
      setEditing(false)
    } catch (err) {
      if (err?.message === 'NAME_TOO_LONG') {
        setLocalError(t('myCv.errorNameTooLong'))
      } else if (err?.message === 'EMPTY_NAME') {
        setLocalError(t('myCv.errorEmptyName'))
      } else {
        setLocalError(t('myCv.renameError'))
      }
    } finally {
      setSaving(false)
    }
  }

  const onView = async () => {
    setViewing(true)
    setLocalError('')
    try {
      const url = (isActive && previewUrl) || await getCvDownloadUrl(cv.fullPath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setLocalError(t('myCv.viewError'))
    } finally {
      setViewing(false)
    }
  }

  const onDownload = () => {
    if (downloading) return

    setDownloading(true)
    setLocalError('')

    void downloadCvFile(cv.fullPath, cv.displayName)
      .catch((err) => {
        console.error('CV download failed:', err)
        setLocalError(t('myCv.downloadError'))
      })
      .finally(() => {
        setDownloading(false)
      })
  }

  const onConfirmDelete = async () => {
    setDeleting(true)
    setLocalError('')
    try {
      await onDelete(cv.id)
      setConfirmDelete(false)
    } catch {
      setLocalError(t('myCv.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  const onActivate = async () => {
    if (isActive || activating) return

    setActivating(true)
    setLocalError('')
    setConfirmDelete(false)
    try {
      await onSetActive(cv.id)
    } catch {
      setLocalError(t('myCv.activateError'))
    } finally {
      setActivating(false)
    }
  }

  const editUi = (
    <div className="cv-card-edit">
      <div className="cv-card-edit-field">
        <input
          ref={inputRef}
          className="cv-card-edit-input"
          value={editName}
          onChange={(e) => setEditName(e.target.value.replace(/\.pdf/gi, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          disabled={saving}
          maxLength={MAX_CV_BASE_NAME_LENGTH}
        />
        <span className="cv-card-edit-ext">{PDF_EXTENSION}</span>
      </div>
      <button
        type="button"
        className="cv-icon-btn cv-icon-btn--save"
        onClick={saveEdit}
        disabled={saving}
        aria-label={t('myCv.save')}
      >
        <IconCheck />
      </button>
      <button
        type="button"
        className="cv-icon-btn"
        onClick={cancelEdit}
        disabled={saving}
        aria-label={t('myCv.cancel')}
      >
        <IconClose />
      </button>
    </div>
  )

  const toolButtons = (
    <div className="cv-card-tools">
      <button
        type="button"
        className="cv-icon-btn cv-icon-btn--edit"
        onClick={startEdit}
        aria-label={t('myCv.edit')}
        title={t('myCv.edit')}
      >
        <IconEdit />
      </button>
      <button
        type="button"
        className="cv-icon-btn cv-icon-btn--view"
        onClick={onView}
        disabled={viewing}
        aria-label={t('myCv.view')}
        title={t('myCv.view')}
      >
        <IconView />
      </button>
      <button
        type="button"
        className="cv-icon-btn cv-icon-btn--download"
        onClick={onDownload}
        disabled={downloading}
        aria-label={t('myCv.download')}
        title={t('myCv.download')}
      >
        <IconDownload />
      </button>
      <button
        type="button"
        className="cv-icon-btn cv-icon-btn--danger"
        onClick={() => {
          setConfirmDelete(true)
          setEditing(false)
        }}
        disabled={deleting}
        aria-label={t('myCv.delete')}
        title={t('myCv.delete')}
      >
        <IconDelete />
      </button>
    </div>
  )

  return (
    <article className={`cv-card${isActive ? ' cv-card--active' : ''}`}>
      {editing ? (
        editUi
      ) : isActive ? (
        <>
          <div className="cv-card-row">
            <div className="cv-card-info">
              <h2 className="cv-card-name" title={cv.displayName}>{stripPdfExtension(cv.displayName)}</h2>
              <p className="cv-card-meta">
                {formatBytes(cv.size)} · {formatDate(cv.updated)}
              </p>
            </div>
            {toolButtons}
          </div>

          <div className="cv-card-preview">
            {(previewLoading || (previewUrl && !iframeLoaded)) && (
              <div className="cv-card-preview-status" aria-live="polite">
                <span className="cv-preview-spinner" aria-hidden="true" />
                <p className="cv-card-preview-loading">{t('myCv.previewLoading')}</p>
              </div>
            )}

            {previewUrl && (
              <iframe
                key={cv.fullPath}
                src={`${previewUrl}#toolbar=0&navpanes=0`}
                title={cv.displayName}
                className={`cv-card-preview-frame${iframeLoaded ? ' cv-card-preview-frame--ready' : ''}`}
                onLoad={() => setIframeLoaded(true)}
              />
            )}

            {!previewLoading && !previewUrl && (
              <div className="cv-card-preview-status">
                <p className="cv-card-preview-loading">{t('myCv.previewError')}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="cv-card-tile">
          <div className="cv-card-doc" aria-hidden="true">
            <IconDoc />
          </div>
          <h2 className="cv-card-tile-name" title={cv.displayName}>{stripPdfExtension(cv.displayName)}</h2>
          {toolButtons}
          <button
            type="button"
            className="cv-card-activate"
            onClick={onActivate}
            disabled={activating}
          >
            {activating ? t('myCv.activating') : t('myCv.setActive')}
          </button>
        </div>
      )}

      {localError && <p className="cv-card-error">{localError}</p>}

      {confirmDelete && (
        <div className="cv-delete-confirm">
          <div className="cv-delete-confirm-content">
            <div className="cv-delete-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6M6 6l.8 14.2A2 2 0 008.8 22h6.4a2 2 0 001.99-1.8L18 6M10 11v5M14 11v5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="cv-delete-copy">
              <p className="cv-delete-title">{t('myCv.deleteTitle')}</p>
              <p className="cv-delete-text">{t('myCv.deleteWarning')}</p>
            </div>
          </div>
          <div className="cv-delete-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              {t('myCv.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-destructive btn-sm"
              onClick={onConfirmDelete}
              disabled={deleting}
            >
              {deleting ? t('myCv.deleting') : t('myCv.delete')}
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
