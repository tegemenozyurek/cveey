/**
 * AdSense configuration.
 *
 * 1. Set VITE_ADSENSE_CLIENT in .env (e.g. ca-pub-xxxxxxxxxxxxxxxx)
 * 2. Create Vertical / Skyscraper units in AdSense → paste slot IDs below
 * 3. Set VITE_ADS_ENABLED=true when you are ready for live ads
 * 4. Keep VITE_ADS_TEST=true until Google approval; then set false
 *
 * Never commit real publisher secrets beyond the public ca-pub / slot IDs
 * (those are meant to be public in page source).
 */

const truthy = (value) => {
  if (value == null || value === '') return false
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

export const ADS_CONFIG = {
  /** Google AdSense publisher ID (ca-pub-…) — public in page source */
  client:
    import.meta.env.VITE_ADSENSE_CLIENT?.trim() || 'ca-pub-3733845304652661',

  /**
   * Slot IDs from AdSense → Ads → By ad unit.
   * left/right: vertical (160x600). bottom: mobile horizontal (320x50).
   */
  slots: {
    left: import.meta.env.VITE_ADSENSE_SLOT_LEFT?.trim() || '',
    right: import.meta.env.VITE_ADSENSE_SLOT_RIGHT?.trim() || '',
    bottom: import.meta.env.VITE_ADSENSE_SLOT_BOTTOM?.trim() || '',
  },

  /** Master switch — false shows labeled placeholders only */
  enabled: truthy(import.meta.env.VITE_ADS_ENABLED),

  /** Adds data-adtest="on" so Google serves test creatives */
  testMode: truthy(import.meta.env.VITE_ADS_TEST) || !truthy(import.meta.env.VITE_ADS_ENABLED),

  /**
   * AdSense script is only loaded after cookie consent is accepted
   * and a page opts in with real publisher content (see AdsPlacementContext).
   */
  requireConsent: true,
}

export function adsReady() {
  return Boolean(
    ADS_CONFIG.enabled &&
      ADS_CONFIG.client &&
      ADS_CONFIG.client.startsWith('ca-pub-'),
  )
}
