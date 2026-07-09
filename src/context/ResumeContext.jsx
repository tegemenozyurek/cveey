import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  activateCv,
  deleteCv,
  getCvDownloadUrl,
  getUserCvs,
  invalidateCvCache,
  renameCv,
  uploadCv,
} from '../storageService'
import {
  clearPreviewCache,
  getCachedPreviewUrl,
  getOrCreatePreviewUrl,
} from '../cvPreviewCache'

const ResumeContext = createContext(null)

export function ResumeProvider({ children }) {
  const { user, authLoading } = useAuth()
  const [cvs, setCvs] = useState([])
  const [activeCv, setActiveCv] = useState(null)
  const [activeCvPath, setActiveCvPath] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePreviewUrl, setActivePreviewUrl] = useState('')
  const [activePreviewLoading, setActivePreviewLoading] = useState(false)
  const loadedUidRef = useRef(null)
  const previewPathRef = useRef(null)

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
      setActivePreviewUrl('')
      setActivePreviewLoading(false)
      setError('')
      setLoading(false)
      loadedUidRef.current = null
      previewPathRef.current = null
      clearPreviewCache()
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

  useEffect(() => {
    if (!activeCvPath || !activeCv) {
      setActivePreviewUrl('')
      setActivePreviewLoading(false)
      previewPathRef.current = null
      return
    }

    const currentPath = activeCvPath
    const currentUrl = activeCv.url ?? ''
    previewPathRef.current = currentPath

    const cached = getCachedPreviewUrl(currentPath)
    if (cached) {
      setActivePreviewUrl(cached)
      setActivePreviewLoading(false)
      return
    }

    let cancelled = false
    setActivePreviewLoading(true)

    const resolveDirectUrl = async () => {
      if (currentUrl) return currentUrl
      return getCvDownloadUrl(currentPath)
    }

    void resolveDirectUrl()
      .then((directUrl) => {
        if (!cancelled && previewPathRef.current === currentPath) {
          setActivePreviewUrl(directUrl)
          setActivePreviewLoading(false)
        }
      })
      .catch((err) => {
        console.error('CV preview URL resolve failed:', err)
        if (!cancelled && previewPathRef.current === currentPath) {
          setActivePreviewUrl('')
          setActivePreviewLoading(false)
        }
      })

    void getOrCreatePreviewUrl(currentPath)
      .then((blobUrl) => {
        if (!cancelled && previewPathRef.current === currentPath) {
          setActivePreviewUrl(blobUrl)
        }
      })
      .catch((err) => {
        console.error('CV preview cache warm failed:', err)
      })

    return () => { cancelled = true }
  }, [activeCvPath, activeCv?.fullPath, activeCv?.url])

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

  const removeCv = useCallback(async (fileId) => {
    if (!user) return null

    setError('')
    const data = await deleteCv(user.uid, fileId)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const renameUserCv = useCallback(async (fileId, newName) => {
    if (!user) {
      const err = new Error('NOT_AUTHENTICATED')
      err.code = 'auth/not-authenticated'
      throw err
    }

    setError('')
    const data = await renameCv(user.uid, fileId, newName)
    applyCvData(data)
    loadedUidRef.current = user.uid
    return data
  }, [user, applyCvData])

  const setActiveUserCv = useCallback(async (fileId) => {
    if (!user) return null

    setError('')
    const data = await activateCv(user.uid, fileId)
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
        activePreviewUrl,
        activePreviewLoading,
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
