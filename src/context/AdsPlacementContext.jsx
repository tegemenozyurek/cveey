import { createContext, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { isPublisherContentPath } from '../config/ads'
import { useAuth } from './AuthContext'

const AdsPlacementContext = createContext(null)

/**
 * Google ads only on publisher-content URLs. Login, verification, location
 * setup, and every app screen (CV editor, dashboard, network) stay ad-free.
 */
export function AdsPlacementProvider({ children }) {
  const { pathname } = useLocation()
  const { authInterstitial } = useAuth()
  const adsEligible = isPublisherContentPath(pathname) && !authInterstitial

  const value = useMemo(
    () => ({ adsEligible }),
    [adsEligible],
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
