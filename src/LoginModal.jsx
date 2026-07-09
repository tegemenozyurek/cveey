import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from './firebase'
import { useLanguage } from './context/LanguageContext'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

const githubProvider = new GithubAuthProvider()
githubProvider.addScope('user:email')

const AUTH_ERROR_KEYS = {
  'auth/email-already-in-use': 'auth.error.emailInUse',
  'auth/invalid-email': 'auth.error.invalidEmail',
  'auth/invalid-credential': 'auth.error.invalidCredential',
  'auth/weak-password': 'auth.error.weakPassword',
  'auth/user-not-found': 'auth.error.invalidCredential',
  'auth/wrong-password': 'auth.error.invalidCredential',
  'auth/too-many-requests': 'auth.error.tooManyRequests',
  'auth/popup-closed-by-user': 'auth.error.popupClosed',
  'auth/cancelled-popup-request': 'auth.error.popupClosed',
  'auth/popup-blocked': 'auth.error.popupBlocked',
  'auth/operation-not-allowed': 'auth.error.operationNotAllowed',
  'auth/account-exists-with-different-credential': 'auth.error.accountExists',
  'auth/unauthorized-domain': 'auth.error.unauthorizedDomain',
  USER_EMAIL_MISSING: 'auth.error.emailMissing',
  PASSWORD_MISMATCH: 'login.passwordMismatch',
  'permission-denied': 'auth.error.syncFailed',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.74 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0112 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.48A10.02 10.02 0 0022 12.26C22 6.58 17.52 2 12 2z"/>
    </svg>
  )
}

function AuthError({ message }) {
  return (
    <p className="form-error login-form-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {message}
    </p>
  )
}

function OAuthButtons({ isBusy, googleLoading, githubLoading, onGoogle, onGitHub, t }) {
  return (
    <div className="oauth-buttons">
      <button type="button" className="oauth-btn" onClick={onGoogle} disabled={isBusy}>
        <GoogleIcon />
        <span>{googleLoading ? t('login.wait') : t('login.google')}</span>
      </button>
      <button type="button" className="oauth-btn oauth-btn--github" onClick={onGitHub} disabled={isBusy}>
        <GitHubIcon />
        <span>{githubLoading ? t('login.wait') : t('login.github')}</span>
      </button>
    </div>
  )
}

export default function LoginModal({ onClose }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const isBusy = loading || googleLoading || githubLoading

  const getAuthErrorMessage = (err) => {
    const code = typeof err === 'string' ? err : err?.code || err?.message
    const key = AUTH_ERROR_KEYS[code]
    if (key) return t(key)
    console.error('Auth error:', err)
    return t('auth.error.generic')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignUp && password !== confirmPassword) {
      setError(t('login.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      onClose()
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setError('')
    setGithubLoading(true)
    try {
      await signInWithPopup(auth, githubProvider)
      onClose()
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setGithubLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp((v) => !v)
    setError('')
    setConfirmPassword('')
  }

  const oauthProps = {
    isBusy,
    googleLoading,
    githubLoading,
    onGoogle: handleGoogleSignIn,
    onGitHub: handleGitHubSignIn,
    t,
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal${isSignUp ? ' modal--signup' : ' modal--signin'}`}
        role="dialog"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('login.close')}>
          ×
        </button>

        {isSignUp ? (
          <h2 id="login-title" className="modal-heading">{t('login.createAccountTitle')}</h2>
        ) : (
          <p id="login-title" className="modal-logo modal-logo--lg">cve<span>ey</span></p>
        )}

        {isSignUp ? (
          <>
            <form className="login-form signup-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label" htmlFor="signup-email">{t('login.email')}</label>
                <input
                  id="signup-email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isBusy}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="signup-password">{t('login.password')}</label>
                <input
                  id="signup-password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder={t('login.passwordPlaceholder')}
                  disabled={isBusy}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirm-password">{t('login.confirmPassword')}</label>
                <input
                  id="confirm-password"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder={t('login.confirmPasswordPlaceholder')}
                  disabled={isBusy}
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-wrap btn-gradient-wrap--block login-submit-btn"
                disabled={isBusy}
              >
                <span className="btn-gradient-inner">
                  {loading ? t('login.wait') : t('login.submitSignUp')}
                </span>
              </button>
            </form>

            {error && <AuthError message={error} />}

            <div className="modal-or">
              <span>{t('login.or')}</span>
            </div>

            <OAuthButtons {...oauthProps} />

            <button
              type="button"
              className="login-back-btn"
              onClick={switchMode}
              disabled={isBusy}
            >
              {t('login.backToSignIn')}
            </button>
          </>
        ) : (
          <>
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
                  disabled={isBusy}
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isBusy}
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-wrap btn-gradient-wrap--block login-submit-btn"
                disabled={isBusy}
              >
                <span className="btn-gradient-inner">
                  {loading ? t('login.wait') : t('login.submitSignIn')}
                </span>
              </button>
            </form>

            {error && <AuthError message={error} />}

            <div className="modal-or">
              <span>{t('login.or')}</span>
            </div>

            <OAuthButtons {...oauthProps} />

            <div className="login-create-section">
              <button
                type="button"
                className="login-create-btn"
                onClick={switchMode}
                disabled={isBusy}
              >
                {t('login.createAccountLink')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
