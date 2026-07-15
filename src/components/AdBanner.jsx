import { useEffect, useRef } from 'react'
import { ADS_CONFIG, adsReady } from '../config/ads'
import { useConsent } from '../context/ConsentContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * Side vertical ad unit. Renders a clearly labeled placeholder until
 * AdSense is enabled with a real client ID and (if required) consent.
 */
export default function AdBanner({ slot, position = 'left' }) {
  const { t } = useLanguage()
  const { adsAllowed } = useConsent()
  const pushed = useRef(false)
  const slotId = slot || ADS_CONFIG.slots[position] || ''
  const canLoadLive =
    adsReady() &&
    Boolean(slotId) &&
    (!ADS_CONFIG.requireConsent || adsAllowed)

  useEffect(() => {
    if (!canLoadLive || pushed.current) return
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
      pushed.current = true
    } catch {
      // Ad blockers / missing script — keep layout stable
    }
  }, [canLoadLive])

  if (!canLoadLive) {
    return (
      <div
        className={`ad-unit ad-unit--placeholder ad-unit--${position}`}
        aria-label={t('ads.placeholderLabel')}
      >
        <span className="ad-unit-badge">{t('ads.label')}</span>
        <span className="ad-unit-size">160 × 600</span>
        <span className="ad-unit-hint">{t('ads.placeholderHint')}</span>
      </div>
    )
  }

  return (
    <div className={`ad-unit ad-unit--live ad-unit--${position}`}>
      <span className="ad-unit-badge">{t('ads.label')}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '160px', minHeight: '600px' }}
        data-ad-client={ADS_CONFIG.client}
        data-ad-slot={slotId}
        data-ad-format="vertical"
        data-full-width-responsive="false"
        {...(ADS_CONFIG.testMode ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  )
}
