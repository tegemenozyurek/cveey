import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { resolveAuthMethod } from '../authUtils'
import {
  canChangePasswordInApp,
  changeEmailPassword,
  getPasswordProviderUrl,
} from '../authAccountService'

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function mapChangePasswordError(err, t) {
  const code = err?.code
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'PASSWORD_REQUIRED') {
    return t('changePassword.wrongPassword')
  }
  if (code === 'auth/weak-password' || code === 'WEAK_PASSWORD') {
    return t('changePassword.weakPassword')
  }
  if (code === 'auth/too-many-requests') {
    return t('changePassword.tooManyRequests')
  }
  if (code === 'auth/requires-recent-login') {
    return t('changePassword.requiresRecentLogin')
  }
  return t('changePassword.failed')
}

export default function ChangePasswordModal({ user, onClose }) {
  const { t } = useLanguage()
  const method = resolveAuthMethod(user)
  const inApp = canChangePasswordInApp(method)
  const providerUrl = getPasswordProviderUrl(method)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.trim().length < 6) {
      setError(t('changePassword.weakPassword'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('changePassword.mismatch'))
      return
    }

    setBusy(true)
    try {
      await changeEmailPassword(user, { currentPassword, newPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(mapChangePasswordError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div
        className="modal confirm-modal change-password-modal"
        role="dialog"
        aria-labelledby="change-password-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon confirm-icon--password">
          <LockIcon />
        </div>
        <h2 id="change-password-title" className="confirm-title">
          {t('changePassword.title')}
        </h2>

        {inApp ? (
          success ? (
            <>
              <p className="confirm-text">{t('changePassword.success')}</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-primary-solid" onClick={onClose}>
                  {t('changePassword.done')}
                </button>
              </div>
            </>
          ) : (
            <form className="change-password-form" onSubmit={handleSubmit}>
              <p className="confirm-text">{t('changePassword.emailLead')}</p>
              <label className="confirm-password-field">
                <span className="confirm-password-label">{t('changePassword.current')}</span>
                <input
                  type="password"
                  className="confirm-password-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={busy}
                  required
                />
              </label>
              <label className="confirm-password-field">
                <span className="confirm-password-label">{t('changePassword.new')}</span>
                <input
                  type="password"
                  className="confirm-password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                  required
                  minLength={6}
                />
              </label>
              <label className="confirm-password-field">
                <span className="confirm-password-label">{t('changePassword.confirm')}</span>
                <input
                  type="password"
                  className="confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                  required
                  minLength={6}
                />
              </label>
              {error ? <p className="confirm-error">{error}</p> : null}
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
                  {t('changePassword.cancel')}
                </button>
                <button type="submit" className="btn btn-primary-solid" disabled={busy}>
                  {busy ? t('changePassword.saving') : t('changePassword.save')}
                </button>
              </div>
            </form>
          )
        ) : (
          <>
            <p className="confirm-text">
              {method === 'github'
                ? t('changePassword.githubLead')
                : t('changePassword.googleLead')}
            </p>
            <div className="confirm-actions confirm-actions--stack">
              {providerUrl ? (
                <a
                  className="btn btn-primary-solid"
                  href={providerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {method === 'github'
                    ? t('changePassword.openGithub')
                    : t('changePassword.openGoogle')}
                </a>
              ) : null}
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t('changePassword.cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
