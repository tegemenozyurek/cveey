import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listUserResumes } from '../storageService'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function displayName(storageName) {
  const parts = storageName.split('_')
  if (parts.length > 1) return parts.slice(1).join('_')
  return storageName
}

export default function MyCV() {
  const { user, openLogin, authLoading } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false
    setLoading(true)
    setError('')

    listUserResumes(user.uid)
      .then((items) => {
        if (!cancelled) setResumes(items)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your resumes.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user])

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">My <span>CV</span></h1>
          <p className="page-subtitle">View and manage your uploaded resumes.</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 15v2M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="empty-state-title">Sign in required</h2>
          <p className="empty-state-text">
            Sign in to see your uploaded resumes.
          </p>
          <button type="button" className="btn btn-primary" onClick={openLogin}>
            Sign in
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">My <span>CV</span></h1>
        <p className="page-subtitle">View and manage your uploaded resumes.</p>
      </div>

      {loading && <p className="page-loading">Loading your resumes…</p>}

      {error && (
        <div className="file-errors">
          <p className="file-error-item">{error}</p>
        </div>
      )}

      {!loading && !error && resumes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="empty-state-title">No resumes yet</h2>
          <p className="empty-state-text">
            Upload your first PDF on the Home page.
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="file-section">
          <p className="file-section-title">
            {resumes.length} resume{resumes.length > 1 ? 's' : ''}
          </p>
          {resumes.map((item) => (
            <div className="file-item" key={item.fullPath}>
              <div className="file-type-badge">PDF</div>
              <div className="file-info">
                <p className="file-name">{displayName(item.name)}</p>
                <p className="file-size">{formatBytes(item.size)}</p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
