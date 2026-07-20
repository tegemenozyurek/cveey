import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { resolveAuthMethod, AUTH_METHOD_EMAIL_PASSWORD, AUTH_METHOD_GITHUB } from '../authUtils'
import { reauthenticateForSensitiveAction } from '../authAccountService'

function WarningIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ConfirmDeleteModal({ user, onConfirm, onCancel, loading }) {
  const { t } = useLanguage()
  const method = resolveAuthMethod(user)
  const needsPassword = method === AUTH_METHOD_EMAIL_PASSWORD
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    setLocalError('')
    setBusy(true)
    try {
      await reauthenticateForSensitiveAction(user, {
        currentPassword: needsPassword ? password : undefined,
      })
      try {
        await onConfirm()
      } catch {
        setLocalError(t('deleteAccount.failed'))
      }
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setLocalError(t('deleteAccount.reauthCancelled'))
      } else if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'PASSWORD_REQUIRED'
      ) {
        setLocalError(t('deleteAccount.wrongPassword'))
      } else if (err?.code === 'auth/too-many-requests') {
        setLocalError(t('deleteAccount.tooManyRequests'))
      } else {
        setLocalError(t('deleteAccount.reauthFailed'))
      }
    } finally {
      setBusy(false)
    }
  }

  const disabled = loading || busy

  return (
    <div className="modal-backdrop" onClick={disabled ? undefined : onCancel}>
      <div
        className="modal confirm-modal confirm-modal--warn"
        role="dialog"
        aria-labelledby="confirm-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon confirm-icon--warn">
          <WarningIcon />
        </div>
        <h2 id="confirm-delete-title" className="confirm-title">
          {t('deleteAccount.title')}
        </h2>
        <p className="confirm-text">{t('deleteAccount.lead')}</p>
        <ul className="confirm-warn-list">
          <li>{t('deleteAccount.warn1')}</li>
          <li>{t('deleteAccount.warn2')}</li>
        </ul>

        {needsPassword ? (
          <label className="confirm-password-field">
            <span className="confirm-password-label">{t('deleteAccount.passwordLabel')}</span>
            <input
              type="password"
              className="confirm-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={disabled}
              placeholder={t('deleteAccount.passwordPlaceholder')}
            />
          </label>
        ) : (
          <p className="confirm-reauth-hint">
            {method === AUTH_METHOD_GITHUB
              ? t('deleteAccount.reauthGithub')
              : t('deleteAccount.reauthGoogle')}
          </p>
        )}

        {localError ? <p className="confirm-error">{localError}</p> : null}

        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={disabled}>
            {t('deleteAccount.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-warn-destructive"
            onClick={handleConfirm}
            disabled={disabled || (needsPassword && !password.trim())}
          >
            {disabled ? t('deleteAccount.deleting') : t('deleteAccount.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
