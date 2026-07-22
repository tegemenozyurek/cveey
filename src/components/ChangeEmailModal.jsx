import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../context/LanguageContext'
import { canChangeEmailInApp, changeUserEmail } from '../authAccountService'
import { resolveAuthMethod } from '../authUtils'

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 7l9 7 9-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function mapChangeEmailError(err, t) {
  const code = err?.code
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'PASSWORD_REQUIRED') {
    return t('changeEmail.wrongPassword')
  }
  if (code === 'auth/invalid-email' || code === 'INVALID_EMAIL') {
    return t('changeEmail.invalidEmail')
  }
  if (code === 'auth/email-already-in-use' || code === 'EMAIL_IN_USE') {
    return t('changeEmail.emailInUse')
  }
  if (code === 'EMAIL_IN_USE_OAUTH') {
    return t('changeEmail.emailInUseOAuth')
  }
  if (code === 'SAME_EMAIL') {
    return t('changeEmail.sameEmail')
  }
  if (code === 'auth/too-many-requests') {
    return t('changeEmail.tooManyRequests')
  }
  if (code === 'auth/requires-recent-login') {
    return t('changeEmail.requiresRecentLogin')
  }
  if (code === 'auth/operation-not-allowed') {
    return t('changeEmail.operationNotAllowed')
  }
  return t('changeEmail.failed')
}

export default function ChangeEmailModal({ user, onClose }) {
  const { t } = useLanguage()
  const method = resolveAuthMethod(user)
  const allowed = canChangeEmailInApp(method)

  const [password, setPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPaddingRight = body.style.paddingRight
    const scrollbarGap = window.innerWidth - html.clientWidth

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`
    }

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.paddingRight = prevBodyPaddingRight
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await changeUserEmail(user, { currentPassword: password, newEmail })
      setSuccess(true)
      setPassword('')
      setNewEmail('')
    } catch (err) {
      setError(mapChangeEmailError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="modal-backdrop modal-backdrop--viewport"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="modal confirm-modal change-email-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-email-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon confirm-icon--password">
          <EmailIcon />
        </div>
        <h2 id="change-email-title" className="confirm-title">
          {t('changeEmail.title')}
        </h2>

        {!allowed ? (
          <>
            <p className="confirm-text">{t('changeEmail.oauthOnly')}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t('changeEmail.cancel')}
              </button>
            </div>
          </>
        ) : success ? (
          <>
            <p className="confirm-text">{t('changeEmail.success')}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-primary-solid" onClick={onClose}>
                {t('changeEmail.done')}
              </button>
            </div>
          </>
        ) : (
          <form className="change-password-form" onSubmit={handleSubmit}>
            <p className="confirm-text">{t('changeEmail.lead')}</p>
            <p className="confirm-reauth-hint">
              {t('changeEmail.currentLabel')}: <strong>{user.email || '—'}</strong>
            </p>
            <label className="confirm-password-field">
              <span className="confirm-password-label">{t('changeEmail.new')}</span>
              <input
                type="email"
                className="confirm-password-input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
                disabled={busy}
                required
              />
            </label>
            <label className="confirm-password-field">
              <span className="confirm-password-label">{t('changeEmail.password')}</span>
              <input
                type="password"
                className="confirm-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={busy}
                required
              />
            </label>
            {error ? <p className="confirm-error">{error}</p> : null}
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
                {t('changeEmail.cancel')}
              </button>
              <button type="submit" className="btn btn-primary-solid" disabled={busy}>
                {busy ? t('changeEmail.saving') : t('changeEmail.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
