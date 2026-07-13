import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export default function CvSectionStepper({
  sections,
  currentSectionId,
  currentSectionIndex = 0,
  onSelect,
  t,
  prevLabel,
  nextLabel,
}) {
  const trackRef = useRef(null)
  const itemRefs = useRef(new Map())
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const setItemRef = useCallback((id, node) => {
    if (node) itemRefs.current.set(id, node)
    else itemRefs.current.delete(id)
  }, [])

  const updateScrollState = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScrollPrev(track.scrollLeft > 4)
    setCanScrollNext(track.scrollLeft < maxScroll - 4)
  }, [])

  const scrollByAmount = (direction) => {
    const track = trackRef.current
    if (!track) return
    const amount = Math.max(160, track.clientWidth * 0.55)
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  const centerActiveStep = useCallback((behavior = 'smooth') => {
    const track = trackRef.current
    const activeNode = itemRefs.current.get(currentSectionId)
    if (!track || !activeNode) return

    const trackRect = track.getBoundingClientRect()
    const itemRect = activeNode.getBoundingClientRect()
    const offset =
      itemRect.left - trackRect.left - (trackRect.width / 2) + (itemRect.width / 2)

    track.scrollBy({ left: offset, behavior })
  }, [currentSectionId])

  useLayoutEffect(() => {
    centerActiveStep(currentSectionId ? 'smooth' : 'auto')
    updateScrollState()
  }, [centerActiveStep, currentSectionId, sections, updateScrollState])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (track.scrollWidth <= track.clientWidth) return
      event.preventDefault()
      track.scrollLeft += event.deltaY
      updateScrollState()
    }

    const onScroll = () => updateScrollState()
    const onResize = () => {
      updateScrollState()
      centerActiveStep('auto')
    }

    track.addEventListener('wheel', onWheel, { passive: false })
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    updateScrollState()

    return () => {
      track.removeEventListener('wheel', onWheel)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [centerActiveStep, updateScrollState])

  return (
    <nav className="create-cv-nav" aria-label={t('createCv.sectionsAria')}>
      <div className="create-cv-stepper">
        <button
          type="button"
          className="create-cv-stepper-arrow"
          onClick={() => scrollByAmount(-1)}
          disabled={!canScrollPrev}
          aria-label={prevLabel}
        >
          ◀
        </button>

        <div className="create-cv-stepper-viewport">
          <div ref={trackRef} className="create-cv-stepper-track">
            {sections.map((section, index) => {
              const isActive = section.id === currentSectionId
              const isPast = index < currentSectionIndex

              return (
                <div key={section.id} className="create-cv-stepper-slot">
                  {index > 0 && (
                    <span className="create-cv-stepper-divider" aria-hidden="true">|</span>
                  )}
                  <button
                    type="button"
                    ref={(node) => setItemRef(section.id, node)}
                    className={[
                      'create-cv-stepper-item',
                      isActive ? 'create-cv-stepper-item--active' : '',
                      isPast ? 'create-cv-stepper-item--past' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => onSelect(section.id)}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="create-cv-stepper-num">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="create-cv-stepper-label">{t(section.navKey)}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className="create-cv-stepper-arrow"
          onClick={() => scrollByAmount(1)}
          disabled={!canScrollNext}
          aria-label={nextLabel}
        >
          ▶
        </button>
      </div>
    </nav>
  )
}
