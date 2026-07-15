import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'cveey_ad_consent_v1'

const ConsentContext = createContext(null)

function readStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'accepted' || raw === 'rejected') return raw
  } catch {
    // ignore
  }
  return null
}

export function ConsentProvider({ children }) {
  const [status, setStatus] = useState(() => readStoredConsent())

  const value = useMemo(() => {
    const accept = () => {
      try {
        localStorage.setItem(STORAGE_KEY, 'accepted')
      } catch {
        // ignore
      }
      setStatus('accepted')
    }

    const reject = () => {
      try {
        localStorage.setItem(STORAGE_KEY, 'rejected')
      } catch {
        // ignore
      }
      setStatus('rejected')
    }

    return {
      status,
      decided: status !== null,
      adsAllowed: status === 'accepted',
      accept,
      reject,
    }
  }, [status])

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return ctx
}
