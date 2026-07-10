import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  A4_HEIGHT_MM,
  A4_HEIGHT_PX,
  A4_WIDTH_MM,
  A4_WIDTH_PX,
} from '../../createCv/constants'
import { exportCvPdfFromRoot } from '../../createCv/exportCvPdf'

const CvPreviewPanel = forwardRef(function CvPreviewPanel({
  document,
  template,
  visibleSectionIds,
  fieldVisibility,
  t,
}, ref) {
  const fitRef = useRef(null)
  const previewHostRef = useRef(null)
  const [scale, setScale] = useState(0.5)
  const [pageCount, setPageCount] = useState(1)
  const [activePage, setActivePage] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const Preview = template.Preview

  const handlePageCountChange = useCallback((count) => {
    const nextCount = Math.max(1, count)
    setPageCount(nextCount)
    setActivePage((prev) => Math.min(prev, nextCount - 1))
  }, [])

  useEffect(() => {
    setActivePage(0)
  }, [template.id])

  useLayoutEffect(() => {
    const fitNode = fitRef.current
    if (!fitNode || isExporting) return undefined

    const updateScale = () => {
      const availableWidth = fitNode.clientWidth
      const availableHeight = fitNode.clientHeight
      if (!availableWidth || !availableHeight) return

      const scaleByWidth = availableWidth / A4_WIDTH_PX
      const scaleByHeight = availableHeight / A4_HEIGHT_PX

      setScale(Math.min(scaleByWidth, scaleByHeight, 1))
    }

    updateScale()
    const raf = requestAnimationFrame(updateScale)

    const observer = new ResizeObserver(updateScale)
    observer.observe(fitNode)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [isExporting])

  useImperativeHandle(ref, () => ({
    async downloadPdf(fileName) {
      setIsExporting(true)
      try {
        await new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        })
        const exportRoot = previewHostRef.current?.querySelector('[data-cv-export-root]')
        await exportCvPdfFromRoot(exportRoot, fileName)
      } finally {
        setIsExporting(false)
      }
    },
  }), [])

  const previewScale = isExporting ? 1 : scale
  const scaledWidth = A4_WIDTH_PX * previewScale
  const scaledHeight = A4_HEIGHT_PX * previewScale

  const goPrevPage = () => setActivePage((prev) => Math.max(0, prev - 1))
  const goNextPage = () => setActivePage((prev) => Math.min(pageCount - 1, prev + 1))
  const safeActivePage = Math.min(activePage, pageCount - 1)

  return (
    <aside className={`create-cv-preview-wrap${isExporting ? ' create-cv-preview-wrap--exporting' : ''}`}>
      <div className="create-cv-preview-toolbar">
        <div>
          <h2 className="create-cv-preview-label">{t('createCv.preview.title')}</h2>
          <p className="create-cv-preview-template-name">
            {t(template.nameKey)}
            <span className="create-cv-preview-size">
              {' · '}{A4_WIDTH_MM}×{A4_HEIGHT_MM} mm
            </span>
            {pageCount > 1 && (
              <span className="create-cv-preview-page-count">
                {' · '}{pageCount} {t('createCv.preview.pages')}
              </span>
            )}
          </p>
        </div>
        <span className="create-cv-preview-live">{t('createCv.preview.live')}</span>
      </div>

      {pageCount > 1 && !isExporting && (
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
      )}

      <div className="create-cv-preview-fit" ref={fitRef}>
        <div
          className="create-cv-preview-stage"
          style={{
            width: isExporting ? A4_WIDTH_PX : scaledWidth,
            height: isExporting ? 'auto' : scaledHeight,
          }}
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
        </div>
      </div>
    </aside>
  )
})

export default CvPreviewPanel
