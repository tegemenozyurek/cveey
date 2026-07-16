import { useEffect } from 'react'
import { ADS_CONFIG, adsReady } from '../config/ads'
import { useConsent } from '../context/ConsentContext'

const SCRIPT_ID = 'adsense-loader'

/**
 * Loads the official AdSense script once — only when ads are enabled
 * and cookie consent has been granted (if requireConsent is on).
 */
export default function AdSenseLoader() {
  const { adsAllowed } = useConsent()

  useEffect(() => {
    if (!adsReady()) return
    if (ADS_CONFIG.requireConsent && !adsAllowed) return
    if (document.getElementById(SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [adsAllowed])

  return null
}
