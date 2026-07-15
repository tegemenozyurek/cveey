import { Link } from 'react-router-dom'
import { useConsent } from '../context/ConsentContext'
import { useLanguage } from '../context/LanguageContext'

export default function CookieConsent() {
  const { t } = useLanguage()
  const { decided, accept, reject } = useConsent()

  if (decided) return null

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p id="cookie-consent-title" className="cookie-consent-title">
            {t('cookie.title')}
          </p>
          <p className="cookie-consent-text">
            {t('cookie.text')}{' '}
            <Link to="/privacy" className="cookie-consent-link">
              {t('legal.privacy')}
            </Link>
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button type="button" className="cookie-consent-btn cookie-consent-btn--secondary" onClick={reject}>
            {t('cookie.reject')}
          </button>
          <button type="button" className="cookie-consent-btn cookie-consent-btn--primary" onClick={accept}>
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
