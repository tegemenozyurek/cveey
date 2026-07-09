import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  activateCv,
  deleteCv,
  getUserCvs,
  invalidateCvCache,
  renameCv,
  uploadCv,
} from '../storageService'

const ResumeContext = createContext(null)

export function ResumeProvider({ children }) {
  const { user, authLoading } = useAuth()
  const [cvs, setCvs] = useState([])
  const [activeCv, setActiveCv] = useState(null)
  const [activeCvPath, setActiveCvPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loadedUidRef = useRef(null)

  const applyCvData = useCallback((data) => {
    setCvs(data.cvs)
    setActiveCv(data.activeCv)
    setActiveCvPath(data.activeCvPath)
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setCvs([])
      setActiveCv(null)
      setActiveCvPath(null)
      setError('')
      setLoading(false)
      loadedUidRef.current = null
      return
    }

    if (loadedUidRef.current === user.uid) return

    let cancelled = false
    setLoading(true)
    setError('')

    getUserCvs(user.uid)
      .then((data) => {
        if (!cancelled) {
          applyCvData(data)
          loadedUidRef.current = user.uid
        }
      })
      .catch(() => {
        if (!cancelled) setError('load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user, authLoading, applyCvData])

  const refreshCvs = useCallback(async () => {
    if (!user) return null

    setLoading(true)
    setError('')

    try {
      const data = await getUserCvs(user.uid, { force: true })
      applyCvData(data)
      loadedUidRef.current = user.uid
      return data
    } catch {
      setError('load')
      return null
    } finally {
      setLoading(false)
    }
  }, [user, applyCvData])

  const uploadUserCv = useCallback(async (file, onProgress) => {
    if (!user) return null

    setError('')
    const data = await uploadCv(user.uid, file, onProgress)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const removeCv = useCallback(async (fullPath) => {
    if (!user) return null

    setError('')
    const data = await deleteCv(user.uid, fullPath)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const renameUserCv = useCallback(async (fullPath, newName) => {
    if (!user) return null

    setError('')
    const data = await renameCv(user.uid, fullPath, newName)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const setActiveUserCv = useCallback(async (fullPath) => {
    if (!user) return null

    setError('')
    const data = await activateCv(user.uid, fullPath)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const clearCvCache = useCallback(() => {
    if (user) invalidateCvCache(user.uid)
    loadedUidRef.current = null
  }, [user])

  return (
    <ResumeContext.Provider
      value={{
        cvs,
        activeCv,
        activeCvPath,
        loading,
        error,
        refreshCvs,
        uploadUserCv,
        removeCv,
        renameUserCv,
        setActiveUserCv,
        clearCvCache,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}
