import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import LoginModal from './LoginModal'
import { deleteUserAccount } from './userService'
import './App.css'

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const handleFiles = (incoming) => {
    const list = Array.from(incoming).filter((f) =>
      /\.(pdf|doc|docx)$/i.test(f.name),
    )
    if (list.length) setFiles((prev) => [...prev, ...list])
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

  const handleLogout = () => signOut(auth)

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmed = window.confirm(
      'Delete your account permanently? This removes your profile and cannot be undone.',
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteUserAccount(user)
    } catch (err) {
      const message =
        err.code === 'auth/requires-recent-login'
          ? 'For security, sign out, sign in again, then delete your account.'
          : 'Could not delete account. Please try again.'
      window.alert(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <span className="logo">SAP</span>
        <div className="header-actions">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button type="button" className="login-btn" onClick={handleLogout} disabled={deleting}>
                Logout
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </>
          ) : (
            <button type="button" className="login-btn" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onBrowse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBrowse()}
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v10M12 3l-4 4M12 3l4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button type="button" className="browse-btn" onClick={onBrowse}>
          Browse
        </button>

        <p className="hint">drag your resumes here</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          hidden
          onChange={onFileChange}
        />

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`}>{f.name}</li>
            ))}
          </ul>
        )}
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default App
