import { useCallback, useEffect, useRef, useState } from 'react'
import { getSelectableTemplates } from '../../createCv/templates/registry'

const CLOSE_MS = 420

export default function TemplateSelectOverlay({ initialTemplateId, onConfirm, onCancel, t }) {
  const templates = getSelectableTemplates()
  const initialIndex = Math.max(0, templates.findIndex((item) => item.id === initialTemplateId))

  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [phase, setPhase] = useState('enter')
  const modalRef = useRef(null)
  const confirmRef = useRef(null)

  const activeTemplate = templates[activeIndex] || templates[0]

  const goTo = useCallback((nextIndex) => {
    const total = templates.length
    setActiveIndex((nextIndex + total) % total)
  }, [templates.length])

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1)
  }, [activeIndex, goTo])

  const goNext = useCallback(() => {
    goTo(activeIndex + 1)
  }, [activeIndex, goTo])

  const handleConfirm = useCallback(() => {
    if (phase !== 'enter') return
    setPhase('exit')
    window.setTimeout(() => onConfirm(activeTemplate.id), CLOSE_MS)
  }, [activeTemplate.id, onConfirm, phase])

  const handleCancel = useCallback(() => {
    if (phase !== 'enter') return
    if (onCancel) {
      setPhase('exit')
      window.setTimeout(onCancel, CLOSE_MS)
      return
    }
    handleConfirm()
  }, [handleConfirm, onCancel, phase])

  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (phase !== 'enter') return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        handleConfirm()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        handleCancel()
      } else if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll('button:not(:disabled), [href], input, select, textarea'),
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, handleCancel, handleConfirm, phase])

  return (
    <div
      className={`template-select-overlay template-select-overlay--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-select-title"
      aria-describedby="template-select-description template-select-hint"
    >
      <div className="template-select-backdrop" aria-hidden="true" />

      <div className="template-select-modal" ref={modalRef}>
        <div className="template-select-intro">
          <span className="template-select-kicker">{t('createCv.template.atsOnly')}</span>
          <h2 id="template-select-title" className="template-select-title">
            {t('createCv.template.title')}
          </h2>
          <p id="template-select-description" className="template-select-desc">{t('createCv.template.description')}</p>
        </div>

        <div className="template-select-carousel">
          <div className="template-select-preview-row">
            <button
              type="button"
              className="template-select-arrow template-select-arrow--prev"
              onClick={goPrev}
              aria-label={t('createCv.template.prev')}
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className="template-select-viewport">
              <div
                className="template-select-track"
                style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
              >
                {templates.map((template) => (
                  <div key={template.id} className="template-select-slide">
                    <div className="template-select-preview-frame">
                      <span
                        className={`template-select-thumb template-select-thumb--${template.thumbClass}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="template-select-arrow template-select-arrow--next"
              onClick={goNext}
              aria-label={t('createCv.template.next')}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="template-select-meta" aria-live="polite">
            <div className="template-select-meta-top">
              <h3 className="template-select-name">{t(activeTemplate.nameKey)}</h3>
              {activeTemplate.badgeKey && (
                <span className="template-select-badge">{t(activeTemplate.badgeKey)}</span>
              )}
            </div>
            <p className="template-select-text">{t(activeTemplate.descriptionKey)}</p>
          </div>
        </div>

        <div className="template-select-dots" role="group" aria-label={t('createCv.template.aria')}>
          {templates.map((template, index) => (
            <button
              key={template.id}
              type="button"
              aria-pressed={index === activeIndex}
              aria-label={t(template.nameKey)}
              className={`template-select-dot${index === activeIndex ? ' template-select-dot--active' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>

        <p id="template-select-hint" className="template-select-hint">{t('createCv.template.keyboardHint')}</p>

        <button
          type="button"
          className="btn-gradient-wrap template-select-confirm"
          onClick={handleConfirm}
          ref={confirmRef}
        >
          <span className="btn-gradient-inner">{t('createCv.template.confirm')}</span>
        </button>
      </div>
    </div>
  )
}
