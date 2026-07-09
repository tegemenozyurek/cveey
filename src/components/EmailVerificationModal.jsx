import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { refreshAuthUser, sendVerificationEmail } from '../authEmailService'
import { useLanguage } from '../context/LanguageContext'
import { auth } from '../firebase'

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M22 8l-10 6L2 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function EmailVerificationModal({ user, onVerified }) {
  const { t } = useLanguage()
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isBusy = resending || checking

  const handleResend = async () => {
    setResending(true)
    setError('')
    setMessage('')
    try {
      await sendVerificationEmail(user)
      setMessage(t('verify.resent'))
    } catch (err) {
      if (err?.code === 'auth/too-many-requests') {
        setError(t('auth.error.tooManyRequests'))
      } else {
        setError(t('verify.resendError'))
      }
    } finally {
      setResending(false)
    }
  }

  const handleCheckVerified = async () => {
    setChecking(true)
    setError('')
    setMessage('')
    try {
      await refreshAuthUser(user)
      if (user.emailVerified) {
        onVerified()
        return
      }
      setError(t('verify.notYetVerified'))
    } catch {
      setError(t('verify.checkError'))
    } finally {
      setChecking(false)
    }
  }

  const handleSignOut = () => {
    signOut(auth)
  }

  return (
    <div className="modal-backdrop modal-backdrop--blocking">
      <div
        className="modal modal--auth modal--verify"
        role="dialog"
        aria-labelledby="verify-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-auth-header">
          <div className="verify-header">
            <div className="verify-icon">
              <MailIcon />
            </div>
            <h2 id="verify-title" className="modal-heading">{t('verify.title')}</h2>
          </div>
        </div>

        <div className="modal-auth-body">
          <p className="verify-text">{t('verify.subtitle', { email: user.email })}</p>
          <p className="modal-subtitle verify-hint">{t('verify.instructions')}</p>

          <div className="modal-auth-error">
            {message && <p className="verify-feedback verify-feedback--success">{message}</p>}
            {error && <p className="verify-feedback verify-feedback--error">{error}</p>}
          </div>

          <div className="verify-actions">
            <button
              type="button"
              className="btn-gradient-wrap btn-gradient-wrap--block verify-submit-btn"
              onClick={handleCheckVerified}
              disabled={isBusy}
            >
              <span className="btn-gradient-inner">
                {checking ? t('verify.checking') : t('verify.confirm')}
              </span>
            </button>

            <button
              type="button"
              className="oauth-btn verify-resend-btn"
              onClick={handleResend}
              disabled={isBusy}
            >
              {resending ? t('verify.resending') : t('verify.resend')}
            </button>
          </div>
        </div>

        <div className="modal-auth-footer">
          <button
            type="button"
            className="login-back-btn verify-signout-btn"
            onClick={handleSignOut}
            disabled={isBusy}
          >
            {t('verify.signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}
