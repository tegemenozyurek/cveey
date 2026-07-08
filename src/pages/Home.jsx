import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadResume } from '../storageService'

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExtension(name) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE'
}

export default function Home() {
  const { user, openLogin } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState([])
  const [fileErrors, setFileErrors] = useState([])
  const fileInputRef = useRef(null)
  const pendingFilesRef = useRef([])

  const updateUpload = (id, patch) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const startUpload = async (uid, file) => {
    const id = `${file.name}-${Date.now()}-${Math.random()}`
    setUploads((prev) => [
      ...prev,
      { id, file, status: 'uploading', progress: 0, storagePath: null, error: null },
    ])

    try {
      const { path } = await uploadResume(uid, file, (progress) => {
        updateUpload(id, { progress })
      })
      updateUpload(id, { status: 'done', progress: 100, storagePath: path })
    } catch {
      updateUpload(id, {
        status: 'error',
        error: 'Upload failed. Please try again.',
      })
    }
  }

  const uploadFiles = async (uid, files) => {
    await Promise.all(files.map((file) => startUpload(uid, file)))
  }

  useEffect(() => {
    if (!user || pendingFilesRef.current.length === 0) return
    const files = pendingFilesRef.current
    pendingFilesRef.current = []
    uploadFiles(user.uid, files)
  }, [user])

  const handleFiles = (incoming) => {
    const errors = []
    const valid = []

    for (const f of Array.from(incoming)) {
      if (!/\.pdf$/i.test(f.name)) {
        errors.push(`"${f.name}" is not a PDF file.`)
        continue
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${f.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`)
        continue
      }
      valid.push(f)
    }

    setFileErrors(errors)
    if (!valid.length) return

    if (!user) {
      pendingFilesRef.current = valid
      openLogin()
      return
    }

    uploadFiles(user.uid, valid)
  }

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)
  const onBrowse = () => fileInputRef.current?.click()

  const onFileChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <main className="main">
      <div className="hero">
        <h1 className="hero-title">
          Upload your <span>resume</span>
        </h1>
        <p className="hero-sub">
          Drop your CV and let us do the rest. Fast, secure, and effortless.
        </p>
      </div>

      <div
        className={`upload-card${isDragging ? ' dragging' : ''}${!user ? ' upload-card-locked' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={user ? onBrowse : openLogin}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && (user ? onBrowse() : openLogin())}
      >
        <div className="upload-icon-wrap">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="upload-title">
          {isDragging ? 'Release to upload' : 'Drag & drop your resume'}
        </p>
        <p className="upload-hint">
          {user ? (
            <>or <strong>click to browse</strong> files</>
          ) : (
            <><strong>Sign in</strong> to upload your resume</>
          )}
        </p>
        <p className="upload-formats">PDF only · Max {MAX_FILE_SIZE_MB} MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        hidden
        onChange={onFileChange}
      />

      {fileErrors.length > 0 && (
        <div className="file-errors">
          {fileErrors.map((err, i) => (
            <p key={i} className="file-error-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {err}
            </p>
          ))}
        </div>
      )}

      {uploads.length > 0 && (
        <div className="file-section">
          <p className="file-section-title">
            {uploads.length} upload{uploads.length > 1 ? 's' : ''}
          </p>
          {uploads.map((item) => (
            <div className={`file-item file-item--${item.status}`} key={item.id}>
              <div className="file-type-badge">{getExtension(item.file.name)}</div>
              <div className="file-info">
                <p className="file-name">{item.file.name}</p>
                <p className="file-size">
                  {item.status === 'uploading' && `Uploading… ${Math.round(item.progress)}%`}
                  {item.status === 'done' && (
                    <>Uploaded · {formatBytes(item.file.size)}</>
                  )}
                  {item.status === 'error' && (item.error ?? 'Upload failed')}
                </p>
                {item.status === 'uploading' && (
                  <div className="upload-progress">
                    <div
                      className="upload-progress-bar"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {item.status !== 'uploading' && (
                <button
                  type="button"
                  className="file-remove"
                  onClick={(e) => { e.stopPropagation(); removeUpload(item.id) }}
                  aria-label="Remove from list"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              {item.status === 'done' && (
                <span className="upload-done-icon" aria-label="Uploaded">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
