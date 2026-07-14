import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { refreshAuthUser, sendVerificationEmail } from '../authEmailService'
import { useLanguage } from '../context/LanguageContext'
import { auth } from '../firebase'

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
            <h2 id="verify-title" className="modal-heading">{t('verify.title')}</h2>
            <p className="verify-lead">{t('verify.leadLine')}</p>
            <span className="verify-email-chip" title={user.email}>{user.email}</span>
          </div>
        </div>

        <div className="modal-auth-body">
          <p className="modal-subtitle verify-hint">{t('verify.instructions')}</p>

          <p className="verify-spam-note">
            <span className="verify-spam-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1.25" fill="currentColor" />
              </svg>
            </span>
            <span>
              {t('verify.spamNote')
                .split('{spam}')
                .flatMap((part, i) =>
                  i === 0
                    ? [part]
                    : [
                        <mark key="spam" className="verify-spam-word">
                          {t('verify.spamWord')}
                        </mark>,
                        part,
                      ],
                )}
            </span>
          </p>

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
