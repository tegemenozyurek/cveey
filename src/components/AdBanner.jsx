import { useEffect, useRef } from 'react'
import { ADS_CONFIG, adsReady } from '../config/ads'
import { useConsent } from '../context/ConsentContext'
import { useLanguage } from '../context/LanguageContext'

const FORMAT = {
  vertical: {
    sizeLabel: '160 × 600',
    style: { display: 'block', width: '160px', minHeight: '600px' },
    adFormat: 'vertical',
    fullWidth: false,
  },
  horizontal: {
    sizeLabel: '320 × 50',
    style: { display: 'block', width: '100%', minHeight: '50px', maxHeight: '100px' },
    adFormat: 'horizontal',
    fullWidth: true,
  },
}

/**
 * Ad unit. Renders a labeled placeholder until AdSense is enabled
 * with a real client ID, slot, and (if required) consent.
 */
export default function AdBanner({ slot, position = 'left', format = 'vertical' }) {
  const { t } = useLanguage()
  const { adsAllowed } = useConsent()
  const pushed = useRef(false)
  const slotId = slot || ADS_CONFIG.slots[position] || ''
  const fmt = FORMAT[format] || FORMAT.vertical
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
        className={`ad-unit ad-unit--placeholder ad-unit--${position} ad-unit--${format}`}
        aria-label={t('ads.placeholderLabel')}
      >
        <span className="ad-unit-badge">{t('ads.label')}</span>
        <span className="ad-unit-size">{fmt.sizeLabel}</span>
        <span className="ad-unit-hint">{t('ads.placeholderHint')}</span>
      </div>
    )
  }

  return (
    <div className={`ad-unit ad-unit--live ad-unit--${position} ad-unit--${format}`}>
      <span className="ad-unit-badge">{t('ads.label')}</span>
      <ins
        className="adsbygoogle"
        style={fmt.style}
        data-ad-client={ADS_CONFIG.client}
        data-ad-slot={slotId}
        data-ad-format={fmt.adFormat}
        data-full-width-responsive={fmt.fullWidth ? 'true' : 'false'}
        {...(ADS_CONFIG.testMode ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  )
}
