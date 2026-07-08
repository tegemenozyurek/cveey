import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from './firebase'
import { syncUserToFirestore } from './userService'
import { useLanguage } from './context/LanguageContext'

const AUTH_ERROR_KEYS = {
  'auth/email-already-in-use': 'auth.error.emailInUse',
  'auth/invalid-email': 'auth.error.invalidEmail',
  'auth/invalid-credential': 'auth.error.invalidCredential',
  'auth/weak-password': 'auth.error.weakPassword',
  'auth/user-not-found': 'auth.error.invalidCredential',
  'auth/wrong-password': 'auth.error.invalidCredential',
  'auth/too-many-requests': 'auth.error.tooManyRequests',
}

export default function LoginModal({ onClose }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getAuthErrorMessage = (code) => {
    const key = AUTH_ERROR_KEYS[code]
    return key ? t(key) : t('auth.error.generic')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await syncUserToFirestore(user, { isNewUser: true })
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        await syncUserToFirestore(user)
      }
      onClose()
    } catch (err) {
      setError(getAuthErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp((v) => !v)
    setError('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('login.close')}>
          ×
        </button>

        <p className="modal-logo">cve<span>ey</span></p>

        <h2 id="login-title" className="modal-title">
          {isSignUp ? t('login.createAccount') : t('login.welcome')}
        </h2>
        <p className="modal-subtitle">
          {isSignUp ? t('login.subtitleSignUp') : t('login.subtitleSignIn')}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder={isSignUp ? t('login.passwordPlaceholder') : '••••••••'}
            />
          </div>

          {error && (
            <p className="form-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t('login.wait') : isSignUp ? t('login.submitSignUp') : t('login.submitSignIn')}
          </button>
        </form>

        <hr className="modal-divider" />

        <p className="modal-switch">
          {isSignUp ? t('login.hasAccount') : t('login.noAccount')}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isSignUp ? t('login.switchSignIn') : t('login.switchSignUp')}
          </button>
        </p>
      </div>
    </div>
  )
}
