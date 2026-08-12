import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const AdsPlacementContext = createContext(null)

/**
 * Pages must opt in with useAdsContentReady(true) when they have real
 * publisher content. Default is off so login walls, loaders, and empty
 * screens never show AdSense units or Auto ads.
 */
export function AdsPlacementProvider({ children }) {
  const { authLoading, authInterstitial } = useAuth()
  const [pageAllowsAds, setPageAllowsAds] = useState(false)

  const setContentReady = useCallback((ready) => {
    setPageAllowsAds(Boolean(ready))
  }, [])

  const adsEligible = pageAllowsAds && !authLoading && !authInterstitial

  const value = useMemo(
    () => ({ adsEligible, setContentReady }),
    [adsEligible, setContentReady],
  )

  return (
    <AdsPlacementContext.Provider value={value}>
      {children}
    </AdsPlacementContext.Provider>
  )
}

export function useAdsPlacement() {
  const ctx = useContext(AdsPlacementContext)
  if (!ctx) {
    throw new Error('useAdsPlacement must be used within AdsPlacementProvider')
  }
  return ctx
}

/** Call from a page: true only when that screen has real content. */
export function useAdsContentReady(ready) {
  const { setContentReady } = useAdsPlacement()

  useEffect(() => {
    setContentReady(ready)
    return () => setContentReady(false)
  }, [ready, setContentReady])
}
