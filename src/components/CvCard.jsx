import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { downloadCvFile, getCvDownloadUrl } from '../storageService'

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconView() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v10m0 0l-4-4m4 4l4-4M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconDelete() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2m-1 0v14H9V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function CvCard({
  cv,
  isActive,
  onRename,
  onDelete,
}) {
  const { lang, t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(cv.displayName)
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) setEditName(cv.displayName)
  }, [cv.displayName, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

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
    setEditName(cv.displayName)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditName(cv.displayName)
    setEditing(false)
    setLocalError('')
  }

  const saveEdit = async () => {
    const trimmed = editName.trim()
    if (!trimmed) {
      setLocalError(t('myCv.errorEmptyName'))
      return
    }
    if (trimmed === cv.displayName) {
      setEditing(false)
      return
    }

    setSaving(true)
    setLocalError('')
    try {
      await onRename(cv.fullPath, trimmed)
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
      const url = await getCvDownloadUrl(cv.fullPath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setLocalError(t('myCv.viewError'))
    } finally {
      setViewing(false)
    }
  }

  const onDownload = async () => {
    setDownloading(true)
    setLocalError('')
    try {
      await downloadCvFile(cv.fullPath, cv.displayName)
    } catch {
      setLocalError(t('myCv.downloadError'))
    } finally {
      setDownloading(false)
    }
  }

  const onConfirmDelete = async () => {
    setDeleting(true)
    setLocalError('')
    try {
      await onDelete(cv.fullPath)
      setConfirmDelete(false)
    } catch {
      setLocalError(t('myCv.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className={`cv-card${isActive ? ' cv-card--active' : ''}`}>
      <div className="cv-card-row">
        <div className="cv-card-info">
          {editing ? (
            <div className="cv-card-edit">
              <input
                ref={inputRef}
                className="cv-card-edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') cancelEdit()
                }}
                disabled={saving}
                maxLength={120}
              />
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
          ) : (
            <div className="cv-card-title-row">
              <h2 className="cv-card-name">{cv.displayName}</h2>
              {isActive && <span className="cv-active-badge">{t('myCv.active')}</span>}
            </div>
          )}
          <p className="cv-card-meta">
            {formatBytes(cv.size)} · {formatDate(cv.updated)}
          </p>
        </div>

        <div className="cv-card-tools">
          {!editing && (
            <button
              type="button"
              className="cv-icon-btn"
              onClick={startEdit}
              aria-label={t('myCv.edit')}
              title={t('myCv.edit')}
            >
              <IconEdit />
            </button>
          )}
          <button
            type="button"
            className="cv-icon-btn"
            onClick={onView}
            disabled={viewing || editing}
            aria-label={t('myCv.view')}
            title={t('myCv.view')}
          >
            <IconView />
          </button>
          <button
            type="button"
            className="cv-icon-btn"
            onClick={onDownload}
            disabled={downloading || editing}
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
            disabled={deleting || editing}
            aria-label={t('myCv.delete')}
            title={t('myCv.delete')}
          >
            <IconDelete />
          </button>
        </div>
      </div>

      {localError && <p className="cv-card-error">{localError}</p>}

      {confirmDelete && (
        <div className="cv-delete-confirm">
          <p className="cv-delete-text">{t('myCv.deleteConfirm')}</p>
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
