import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export { CONNECTION_REQUEST_NOTIFICATIONS, createConnectionRequestNotification } from '../notificationModel'

export default function NotificationsDropdown({
  open,
  onClose,
  menuRef,
  placement = 'bottom',
  requests,
  onAccept,
  onReject,
}) {
  const { t } = useLanguage()
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (menuRef?.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, menuRef])

  if (!open) return null

  const runAction = async (request, type) => {
    if (pendingAction) return
    setPendingAction({ id: request.id, type })

    await new Promise((resolve) => {
      window.setTimeout(resolve, 420)
    })

    try {
      if (type === 'accept') {
        await onAccept?.(request)
      } else {
        await onReject?.(request)
      }
    } catch (err) {
      console.error(`Notification ${type} failed:`, err)
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div
      className={`notifications-dropdown notifications-dropdown--${placement}`}
      role="dialog"
      aria-label={t('nav.notifications')}
    >
      <div className="notifications-dropdown-header">
        <span className="notifications-dropdown-title">{t('nav.notifications')}</span>
      </div>

      <div className="notifications-dropdown-body">
        {requests.length === 0 ? (
          <p className="notifications-dropdown-empty">{t('notifications.empty')}</p>
        ) : (
          requests.map((request) => {
            const actionType = pendingAction?.id === request.id ? pendingAction.type : null
            const isBusy = Boolean(actionType)
            const showPhoto = Boolean(request.photoURL) && !actionType
            return (
              <article
                key={request.id}
                className={[
                  'notification-request-card',
                  actionType === 'accept' ? 'notification-request-card--accepted' : '',
                  actionType === 'reject' ? 'notification-request-card--rejected' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="notification-request-avatar" aria-hidden="true">
                  {actionType === 'accept' ? (
                    '✓'
                  ) : actionType === 'reject' ? (
                    '✕'
                  ) : showPhoto ? (
                    <img
                      src={request.photoURL}
                      alt=""
                      className="notification-request-avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    request.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="notification-request-content">
                  <p className="notification-request-text">
                    <strong className="notification-request-name">{request.name}</strong>
                    {' '}
                    <span className="notification-request-message">
                      {actionType === 'accept'
                        ? t('notifications.accepted')
                        : actionType === 'reject'
                          ? t('notifications.rejected')
                          : t('notifications.wantToConnectSuffix')}
                    </span>
                  </p>
                  {!isBusy && (
                    <div className="notification-request-actions">
                      <button
                        type="button"
                        className="notification-request-btn notification-request-btn--accept"
                        onClick={() => runAction(request, 'accept')}
                      >
                        {t('notifications.accept')}
                      </button>
                      <button
                        type="button"
                        className="notification-request-btn notification-request-btn--reject"
                        onClick={() => runAction(request, 'reject')}
                      >
                        {t('notifications.reject')}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
