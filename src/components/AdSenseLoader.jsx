import { useEffect } from 'react'
import { ADS_CONFIG, adsReady } from '../config/ads'
import { useConsent } from '../context/ConsentContext'

const SCRIPT_ID = 'adsense-loader'

function adsenseScriptPresent() {
  if (document.getElementById(SCRIPT_ID)) return true
  return Boolean(
    document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'),
  )
}

/**
 * Loads the official AdSense script once when ads are enabled and consent
 * allows it. Skips if the verification snippet is already in index.html.
 */
export default function AdSenseLoader() {
  const { adsAllowed } = useConsent()

  useEffect(() => {
    if (!adsReady()) return
    if (ADS_CONFIG.requireConsent && !adsAllowed) return
    if (adsenseScriptPresent()) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [adsAllowed])

  return null
}
