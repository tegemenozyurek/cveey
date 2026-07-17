import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
} from '../../createCv/constants'
import {
  exportCvPdfBlobFromDocument,
  exportCvPdfFromDocument,
} from '../../createCv/exportCvPdf'

const LIGHTBOX_PADDING_PX = 16
/** Initial mobile lightbox width as a share of the viewport. */
const LIGHTBOX_WIDTH_RATIO = 0.94
const LIGHTBOX_ZOOM_MIN = 1
const LIGHTBOX_ZOOM_MAX = 3.5
const MOBILE_PREVIEW_QUERY = '(max-width: 768px)'

/** Desktop hover strip height as a fraction of the visible A4 stage. */
const MAGNIFIER_HEIGHT_RATIO = 0.2
/** Extra zoom on top of the fit-to-panel scale. */
const MAGNIFIER_ZOOM = 1.9

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

function clampLightboxZoom(value) {
  return Math.min(LIGHTBOX_ZOOM_MAX, Math.max(LIGHTBOX_ZOOM_MIN, value))
}

function useMobilePreview() {
  const [isMobilePreview, setIsMobilePreview] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(MOBILE_PREVIEW_QUERY).matches
  ))

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_PREVIEW_QUERY)
    const onChange = (event) => setIsMobilePreview(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return isMobilePreview
}

const CvPreviewPanel = forwardRef(function CvPreviewPanel({
  document,
  template,
  visibleSectionIds,
  fieldVisibility,
  t,
  cornerActions,
}, ref) {
  const fitRef = useRef(null)
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const previewHostRef = useRef(null)
  const magnifierRef = useRef(null)
  const magnifierScalerRef = useRef(null)
  const lightboxHostRef = useRef(null)
  const lightboxScrollRef = useRef(null)
  const scaleRef = useRef(0.5)
  const rafMoveRef = useRef(0)
  const lightboxBaseScaleRef = useRef(1)
  const lightboxZoomRef = useRef(1)
  const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1 })
  const isMobilePreview = useMobilePreview()
  const [scale, setScale] = useState(0.5)
  const [lightboxBaseScale, setLightboxBaseScale] = useState(1)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [activePage, setActivePage] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMagnifying, setIsMagnifying] = useState(false)
  const Preview = template.Preview

  const handlePageCountChange = useCallback((count) => {
    const nextCount = Math.max(1, count)
    setPageCount(nextCount)
    setActivePage((prev) => Math.min(prev, nextCount - 1))
  }, [])

  useEffect(() => {
    setActivePage(0)
  }, [template.id])

  useEffect(() => {
    if (isMobilePreview) {
      setIsMagnifying(false)
    } else {
      setIsExpanded(false)
    }
  }, [isMobilePreview])

  useLayoutEffect(() => {
    const fitNode = fitRef.current
    const wrapNode = wrapRef.current
    if (!fitNode || !wrapNode || isExporting) return undefined

    const updateScale = () => {
      // Golden rule: on desktop the visible A4 stage and editor panel must end
      // on the exact same horizontal line. Read the panel itself instead of
      // inferring its height from the preview wrapper (which may have a footer).
      const workspaceNode = wrapNode.closest('.create-cv-workspace')
      const panelNode = workspaceNode?.querySelector('.create-cv-panel')
      const availableHeight = !isMobilePreview && panelNode?.clientHeight
        ? panelNode.clientHeight
        : (fitNode.clientHeight || wrapNode.clientHeight)
      if (!availableHeight) return

      let nextScale = availableHeight / A4_HEIGHT_PX

      // On stacked/mobile layouts the preview is full-width, so also fit width.
      if (isMobilePreview) {
        const availableWidth = wrapNode.clientWidth
        if (availableWidth) nextScale = Math.min(nextScale, availableWidth / A4_WIDTH_PX)
      }

      nextScale = Math.min(nextScale, 1)
      if (!Number.isFinite(nextScale) || nextScale <= 0) return

      scaleRef.current = nextScale
      setScale((prev) => (Math.abs(prev - nextScale) < 0.001 ? prev : nextScale))
    }

    updateScale()
    const raf = requestAnimationFrame(updateScale)

    const observer = new ResizeObserver(updateScale)
    observer.observe(wrapNode)
    observer.observe(fitNode)
    const workspaceNode = wrapNode.closest('.create-cv-workspace')
    const panelNode = workspaceNode?.querySelector('.create-cv-panel')
    if (workspaceNode) observer.observe(workspaceNode)
    if (panelNode) observer.observe(panelNode)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [isExporting, isMobilePreview])

  useLayoutEffect(() => {
    if (!isExpanded || !isMobilePreview) return undefined

    const updateLightboxBaseScale = () => {
      const availableWidth = Math.min(
        window.innerWidth * LIGHTBOX_WIDTH_RATIO,
        window.innerWidth - LIGHTBOX_PADDING_PX * 2,
      )
      if (!availableWidth) return

      const nextBaseScale = availableWidth / A4_WIDTH_PX
      lightboxBaseScaleRef.current = nextBaseScale
      setLightboxBaseScale(nextBaseScale)
    }

    updateLightboxBaseScale()
    window.addEventListener('resize', updateLightboxBaseScale)
    return () => window.removeEventListener('resize', updateLightboxBaseScale)
  }, [isExpanded, isMobilePreview])

  useLayoutEffect(() => {
    if (!isExpanded) return
    lightboxZoomRef.current = 1
    setLightboxZoom(1)
    pinchRef.current = { active: false, startDistance: 0, startZoom: 1 }

    const centerLightbox = () => {
      const scrollNode = lightboxScrollRef.current
      if (!scrollNode) return
      const maxScrollY = Math.max(0, scrollNode.scrollHeight - scrollNode.clientHeight)
      const maxScrollX = Math.max(0, scrollNode.scrollWidth - scrollNode.clientWidth)
      scrollNode.scrollTop = maxScrollY / 2
      scrollNode.scrollLeft = maxScrollX / 2
    }

    // Wait for scaled page layout, then center in the phone viewport.
    requestAnimationFrame(() => {
      requestAnimationFrame(centerLightbox)
    })
  }, [isExpanded, activePage, lightboxBaseScale])

  useEffect(() => {
    if (!isExpanded || !isMobilePreview) return undefined
    const scrollNode = lightboxScrollRef.current
    if (!scrollNode) return undefined

    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return
      pinchRef.current = {
        active: true,
        startDistance: getTouchDistance(event.touches),
        startZoom: lightboxZoomRef.current,
      }
    }

    const onTouchMove = (event) => {
      if (!pinchRef.current.active || event.touches.length !== 2) return
      event.preventDefault()
      const distance = getTouchDistance(event.touches)
      if (!pinchRef.current.startDistance) return
      const ratio = distance / pinchRef.current.startDistance
      const nextZoom = clampLightboxZoom(pinchRef.current.startZoom * ratio)
      lightboxZoomRef.current = nextZoom
      setLightboxZoom(nextZoom)
    }

    const onTouchEnd = (event) => {
      if (event.touches.length < 2) {
        pinchRef.current.active = false
      }
    }

    scrollNode.addEventListener('touchstart', onTouchStart, { passive: true })
    scrollNode.addEventListener('touchmove', onTouchMove, { passive: false })
    scrollNode.addEventListener('touchend', onTouchEnd)
    scrollNode.addEventListener('touchcancel', onTouchEnd)

    return () => {
      scrollNode.removeEventListener('touchstart', onTouchStart)
      scrollNode.removeEventListener('touchmove', onTouchMove)
      scrollNode.removeEventListener('touchend', onTouchEnd)
      scrollNode.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isExpanded, isMobilePreview])

  const syncMagnifierClone = useCallback(() => {
    const host = previewHostRef.current
    const target = magnifierScalerRef.current
    if (!host || !target) return

    const source = host.querySelector('.cv-preview-doc--page-active')
    if (!source) return

    const clone = source.cloneNode(true)
    clone.classList.remove('cv-preview-doc--page-hidden')
    clone.classList.add('cv-preview-doc--page-active')
    clone.setAttribute('aria-hidden', 'true')
    clone.removeAttribute('aria-label')
    target.replaceChildren(clone)
  }, [])

  const syncLightboxClone = useCallback(() => {
    const host = previewHostRef.current
    const target = lightboxHostRef.current
    if (!host || !target) return

    const source = host.querySelector('.cv-preview-doc--page-active')
    if (!source) return

    const clone = source.cloneNode(true)
    clone.classList.remove('cv-preview-doc--page-hidden')
    clone.classList.add('cv-preview-doc--page-active')
    clone.setAttribute('aria-hidden', 'true')
    clone.removeAttribute('aria-label')
    target.replaceChildren(clone)
  }, [])

  useLayoutEffect(() => {
    if (!isMagnifying || isExporting || isMobilePreview) return
    syncMagnifierClone()
  }, [
    isMagnifying,
    isExporting,
    isMobilePreview,
    syncMagnifierClone,
    document,
    template.id,
    pageCount,
    activePage,
    visibleSectionIds,
    fieldVisibility,
  ])

  useLayoutEffect(() => {
    if (!isExpanded || isExporting || !isMobilePreview) return
    syncLightboxClone()
  }, [
    isExpanded,
    isExporting,
    isMobilePreview,
    syncLightboxClone,
    document,
    template.id,
    pageCount,
    activePage,
    visibleSectionIds,
    fieldVisibility,
  ])

  useEffect(() => {
    if (!isExpanded || !isMobilePreview) return undefined

    const domDocument = window.document
    const previousOverflow = domDocument.body.style.overflow
    domDocument.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsExpanded(false)
      if (event.key === 'ArrowLeft') {
        setActivePage((prev) => Math.max(0, prev - 1))
      }
      if (event.key === 'ArrowRight') {
        setActivePage((prev) => Math.min(pageCount - 1, prev + 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      domDocument.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isExpanded, isMobilePreview, pageCount])

  useEffect(() => () => {
    if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current)
  }, [])

  useImperativeHandle(ref, () => ({
    async getPdfBlob(fileName) {
      setIsExporting(true)
      setIsExpanded(false)
      setIsMagnifying(false)
      try {
        const blob = await exportCvPdfBlobFromDocument({
          document,
          t,
          visibleSectionIds,
          fieldVisibility,
        })
        return { blob, fileName }
      } finally {
        setIsExporting(false)
      }
    },
    async downloadPdf(fileName) {
      setIsExporting(true)
      setIsExpanded(false)
      setIsMagnifying(false)
      try {
        await exportCvPdfFromDocument({
          document,
          t,
          visibleSectionIds,
          fieldVisibility,
        }, fileName)
      } finally {
        setIsExporting(false)
      }
    },
  }), [document, fieldVisibility, t, visibleSectionIds])

  const updateMagnifierPosition = useCallback((clientX, clientY) => {
    const stage = stageRef.current
    const lens = magnifierRef.current
    const scaler = magnifierScalerRef.current
    if (!stage || !lens || !scaler) return

    const rect = stage.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    const bandH = rect.height * MAGNIFIER_HEIGHT_RATIO
    const top = Math.max(0, Math.min(mouseY - bandH / 2, rect.height - bandH))
    const zoom = MAGNIFIER_ZOOM
    const previewScale = scaleRef.current
    const tx = mouseX * (1 - zoom)
    const ty = mouseY * (1 - zoom) - top

    lens.style.top = `${top}px`
    lens.style.height = `${bandH}px`
    scaler.style.transform = `translate(${tx}px, ${ty}px) scale(${previewScale * zoom})`
    lens.dataset.ready = 'true'
  }, [])

  const handleMagnifierEnter = (event) => {
    if (isExporting || isMobilePreview) return
    setIsMagnifying(true)
    const { clientX, clientY } = event
    requestAnimationFrame(() => {
      syncMagnifierClone()
      updateMagnifierPosition(clientX, clientY)
    })
  }

  const handleMagnifierMove = (event) => {
    if (isExporting || isMobilePreview) return
    const { clientX, clientY } = event
    if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current)
    rafMoveRef.current = requestAnimationFrame(() => {
      updateMagnifierPosition(clientX, clientY)
    })
  }

  const handleMagnifierLeave = () => {
    if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current)
    setIsMagnifying(false)
  }

  const previewScale = isExporting ? 1 : scale
  const scaledWidth = A4_WIDTH_PX * previewScale
  const scaledHeight = A4_HEIGHT_PX * previewScale
  const lightboxScale = lightboxBaseScale * lightboxZoom
  const lightboxWidth = A4_WIDTH_PX * lightboxScale
  const lightboxHeight = A4_HEIGHT_PX * lightboxScale

  const goPrevPage = () => setActivePage((prev) => Math.max(0, prev - 1))
  const goNextPage = () => setActivePage((prev) => Math.min(pageCount - 1, prev + 1))
  const safeActivePage = Math.min(activePage, pageCount - 1)

  const openExpanded = () => {
    if (isExporting || !isMobilePreview) return
    lightboxZoomRef.current = 1
    setLightboxZoom(1)
    setIsExpanded(true)
  }

  const closeExpanded = () => {
    lightboxZoomRef.current = 1
    setLightboxZoom(1)
    setIsExpanded(false)
  }

  const applyLightboxZoom = useCallback((nextZoom) => {
    const clamped = clampLightboxZoom(nextZoom)
    lightboxZoomRef.current = clamped
    setLightboxZoom(clamped)
  }, [])

  const handleLightboxDoubleClick = (event) => {
    event.stopPropagation()
    applyLightboxZoom(lightboxZoomRef.current > 1.05 ? 1 : 2)
  }

  const stageClassName = [
    'create-cv-preview-stage',
    isMobilePreview ? 'create-cv-preview-stage--expandable' : 'create-cv-preview-stage--magnifier',
    !isMobilePreview && isMagnifying ? 'create-cv-preview-stage--magnifying' : '',
  ].filter(Boolean).join(' ')

  const pageNav = pageCount > 1 && !isExporting && (
    <div className="create-cv-preview-page-nav">
      <button
        type="button"
        className="create-cv-preview-page-btn"
        onClick={goPrevPage}
        disabled={activePage <= 0}
        aria-label={t('createCv.preview.prevPage')}
      >
        ‹
      </button>
      <span className="create-cv-preview-page-indicator">
        {safeActivePage + 1} / {pageCount}
      </span>
      <button
        type="button"
        className="create-cv-preview-page-btn"
        onClick={goNextPage}
        disabled={activePage >= pageCount - 1}
        aria-label={t('createCv.preview.nextPage')}
      >
        ›
      </button>
    </div>
  )

  return (
    <aside
      ref={wrapRef}
      className={`create-cv-preview-wrap${isExporting ? ' create-cv-preview-wrap--exporting' : ''}`}
    >
      {pageNav}

      <div className="create-cv-preview-fit" ref={fitRef}>
        <div
          ref={stageRef}
          className={stageClassName}
          style={{
            width: isExporting ? A4_WIDTH_PX : scaledWidth,
            height: isExporting ? 'auto' : scaledHeight,
          }}
          onClick={isMobilePreview && !isExporting ? openExpanded : undefined}
          onKeyDown={isMobilePreview && !isExporting ? ((event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openExpanded()
            }
          }) : undefined}
          onPointerEnter={!isMobilePreview && !isExporting ? handleMagnifierEnter : undefined}
          onPointerMove={!isMobilePreview && !isExporting ? handleMagnifierMove : undefined}
          onPointerLeave={!isMobilePreview && !isExporting ? handleMagnifierLeave : undefined}
          role={isMobilePreview && !isExporting ? 'button' : undefined}
          tabIndex={isMobilePreview && !isExporting ? 0 : undefined}
          aria-label={isMobilePreview && !isExporting ? t('createCv.preview.expand') : undefined}
        >
          <div
            ref={previewHostRef}
            className="create-cv-preview-scaler"
            style={{
              width: A4_WIDTH_PX,
              height: isExporting ? 'auto' : A4_HEIGHT_PX,
              transform: isExporting
                ? 'none'
                : `translateX(-50%) scale(${previewScale})`,
            }}
          >
            <Preview
              document={document}
              t={t}
              className={`${template.previewClassName} cv-preview-doc--export`}
              onPageCountChange={handlePageCountChange}
              activePreviewPage={safeActivePage}
              exportMode={isExporting}
              visibleSectionIds={visibleSectionIds}
              fieldVisibility={fieldVisibility}
            />
          </div>

          {!isMobilePreview && isMagnifying && !isExporting && (
            <div
              ref={magnifierRef}
              className="create-cv-preview-magnifier"
              aria-hidden="true"
            >
              <div
                ref={magnifierScalerRef}
                className="create-cv-preview-magnifier-scaler"
                style={{
                  width: A4_WIDTH_PX,
                  height: A4_HEIGHT_PX,
                }}
              />
            </div>
          )}

          {!isExporting && cornerActions ? (
            <div
              className="create-cv-preview-corner-actions"
              onPointerEnter={() => setIsMagnifying(false)}
              onPointerMove={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {cornerActions}
            </div>
          ) : null}
        </div>
      </div>

      {isMobilePreview && isExpanded && !isExporting && createPortal(
        <div
          className="create-cv-preview-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t('createCv.preview.expand')}
        >
          <button
            type="button"
            className="create-cv-preview-lightbox-backdrop"
            aria-label={t('createCv.preview.collapse')}
            onClick={closeExpanded}
          />

          <div
            ref={lightboxScrollRef}
            className="create-cv-preview-lightbox-scroll"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeExpanded()
            }}
          >
            <div className="create-cv-preview-lightbox-center">
              <div
                className="create-cv-preview-lightbox-stage"
                style={{
                  width: lightboxWidth,
                  height: lightboxHeight,
                }}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={handleLightboxDoubleClick}
              >
                <div
                  ref={lightboxHostRef}
                  className="create-cv-preview-lightbox-scaler"
                  style={{
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    transform: `scale(${lightboxScale})`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="create-cv-preview-lightbox-chrome">
            {pageCount > 1 && (
              <div className="create-cv-preview-lightbox-nav">
                <button
                  type="button"
                  className="create-cv-preview-page-btn"
                  onClick={goPrevPage}
                  disabled={activePage <= 0}
                  aria-label={t('createCv.preview.prevPage')}
                >
                  ‹
                </button>
                <span className="create-cv-preview-page-indicator">
                  {safeActivePage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="create-cv-preview-page-btn"
                  onClick={goNextPage}
                  disabled={activePage >= pageCount - 1}
                  aria-label={t('createCv.preview.nextPage')}
                >
                  ›
                </button>
              </div>
            )}

            <button
              type="button"
              className="create-cv-preview-lightbox-close"
              onClick={(event) => {
                event.stopPropagation()
                closeExpanded()
              }}
              aria-label={t('createCv.preview.collapse')}
            >
              ×
            </button>
          </div>
        </div>,
        window.document.body,
      )}
    </aside>
  )
})

export default CvPreviewPanel
