import { useEffect } from 'react'
import { ADS_CONFIG, adsReady } from '../config/ads'
import { useAdsPlacement } from '../context/AdsPlacementContext'
import { useConsent } from '../context/ConsentContext'

const SCRIPT_ID = 'adsense-loader'

function adsenseScriptPresent() {
  if (document.getElementById(SCRIPT_ID)) return true
  return Boolean(
    document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'),
  )
}

function setAdRequestsPaused(paused) {
  try {
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.pauseAdRequests = paused ? 1 : 0
  } catch {
    // Ad blockers / missing script
  }
}

function disableAutoAds() {
  try {
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({
      google_ad_client: ADS_CONFIG.client,
      enable_page_level_ads: false,
      overlays: { bottom: false, top: false, right: false },
    })
  } catch {
    // Ad blockers / missing script
  }
}

function setBodyAdsClass(enabled) {
  document.body.classList.toggle('ads-enabled', enabled)
  document.body.classList.toggle('ads-disabled', !enabled)
}

/**
 * Loads AdSense only on publisher-content screens.
 * Pauses requests and hides leftover Auto ads everywhere else.
 */
export default function AdSenseLoader() {
  const { adsAllowed } = useConsent()
  const { adsEligible } = useAdsPlacement()
  const canLoad =
    adsEligible &&
    adsReady() &&
    (!ADS_CONFIG.requireConsent || adsAllowed)

  useEffect(() => {
    setBodyAdsClass(canLoad)
    setAdRequestsPaused(!canLoad)

    if (!canLoad) return undefined
    if (adsenseScriptPresent()) return undefined

    disableAutoAds()

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    return undefined
  }, [canLoad])

  useEffect(() => () => {
    setAdRequestsPaused(true)
    setBodyAdsClass(false)
  }, [])

  return null
}
