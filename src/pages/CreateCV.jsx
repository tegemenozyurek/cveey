import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CreateCV() {
  const { user, openLogin } = useAuth()

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">Create <span>CV</span></h1>
        <p className="page-subtitle">
          Build a professional resume from scratch with our guided builder.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="feature-card-title">CV Builder</h2>
        <p className="feature-card-text">
          Create a polished PDF resume step by step. Add your experience, education, and skills — we handle the formatting.
        </p>
        {user ? (
          <button type="button" className="btn btn-primary btn-lg" disabled>
            Coming soon
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={openLogin}>
            Sign in to get started
          </button>
        )}
        <p className="feature-card-hint">
          Already have a PDF? <Link to="/">Upload it on Home</Link>
        </p>
      </div>
    </main>
  )
}
