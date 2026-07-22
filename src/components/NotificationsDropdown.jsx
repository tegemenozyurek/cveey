import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const PLACEHOLDER_REQUESTS = [
  { id: '1', name: 'Alex Chen' },
  { id: '2', name: 'Jordan Lee' },
  { id: '3', name: 'Sam Rivera' },
  { id: '4', name: 'Taylor Kim' },
]

export default function NotificationsDropdown({ open, onClose, menuRef, placement = 'bottom' }) {
  const { t } = useLanguage()
  const [requests, setRequests] = useState(PLACEHOLDER_REQUESTS)
  const [acceptingId, setAcceptingId] = useState(null)

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

  const acceptRequest = (id) => {
    if (acceptingId) return
    setAcceptingId(id)
    window.setTimeout(() => {
      setRequests((prev) => prev.filter((item) => item.id !== id))
      setAcceptingId(null)
    }, 420)
  }

  const removeRequest = (id) => {
    if (acceptingId) return
    setRequests((prev) => prev.filter((item) => item.id !== id))
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
            const isAccepting = acceptingId === request.id
            return (
              <article
                key={request.id}
                className={`notification-request-card${isAccepting ? ' notification-request-card--accepted' : ''}`}
              >
                <div className="notification-request-avatar" aria-hidden="true">
                  {isAccepting ? '✓' : request.name.charAt(0)}
                </div>
                <div className="notification-request-content">
                  <p className="notification-request-text">
                    <strong className="notification-request-name">{request.name}</strong>
                    {' '}
                    <span className="notification-request-message">
                      {isAccepting
                        ? t('notifications.accepted')
                        : t('notifications.wantToConnectSuffix')}
                    </span>
                  </p>
                  {!isAccepting && (
                    <div className="notification-request-actions">
                      <button
                        type="button"
                        className="notification-request-btn notification-request-btn--accept"
                        onClick={() => acceptRequest(request.id)}
                      >
                        {t('notifications.accept')}
                      </button>
                      <button
                        type="button"
                        className="notification-request-btn notification-request-btn--reject"
                        onClick={() => removeRequest(request.id)}
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
