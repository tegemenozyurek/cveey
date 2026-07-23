import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { EyeOff } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const DEFAULT_CV_VISIBILITY = {
  hideFromNonConnections: true,
  hideFromConnections: false,
  hideFromCompanies: false,
}

const OPTIONS = [
  {
    key: 'hideFromNonConnections',
    titleKey: 'profile.cvVis.hideNonConnections',
    hintKey: 'profile.cvVis.hideNonConnectionsHint',
  },
  {
    key: 'hideFromConnections',
    titleKey: 'profile.cvVis.hideConnections',
    hintKey: 'profile.cvVis.hideConnectionsHint',
  },
  {
    key: 'hideFromCompanies',
    titleKey: 'profile.cvVis.hideCompanies',
    hintKey: 'profile.cvVis.hideCompaniesHint',
    warn: true,
  },
]

export default function CvVisibilityModal({
  open,
  initialValue = DEFAULT_CV_VISIBILITY,
  onClose,
  onSave,
}) {
  const { t } = useLanguage()
  const [values, setValues] = useState({ ...DEFAULT_CV_VISIBILITY, ...initialValue })
  const [step, setStep] = useState('options')

  useEffect(() => {
    if (!open) return
    setValues({ ...DEFAULT_CV_VISIBILITY, ...initialValue })
    setStep('options')
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (step === 'confirm') setStep('options')
        else onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, step])

  if (!open) return null

  const toggle = (key) => {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    if (values.hideFromCompanies) {
      setStep('confirm')
      return
    }
    onSave?.(values)
  }

  return createPortal(
    <div className="modal-backdrop cv-vis-backdrop" onClick={onClose}>
      <div
        className={`cv-vis-modal${step === 'confirm' ? ' cv-vis-modal--confirm' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-vis-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cv-vis-handle" aria-hidden="true" />

        {step === 'options' ? (
          <>
            <header className="cv-vis-header">
              <h2 id="cv-vis-title" className="cv-vis-title">{t('profile.cvVis.title')}</h2>
              <p className="cv-vis-subtitle">{t('profile.cvVis.subtitle')}</p>
            </header>

            <div className="cv-vis-list" role="group" aria-labelledby="cv-vis-title">
              {OPTIONS.map((opt, index) => {
                const active = Boolean(values[opt.key])
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="switch"
                    aria-checked={active}
                    className={`cv-vis-row${active ? ' cv-vis-row--active' : ''}${opt.warn ? ' cv-vis-row--warn' : ''}${index === OPTIONS.length - 1 ? ' cv-vis-row--last' : ''}`}
                    onClick={() => toggle(opt.key)}
                  >
                    <span className="cv-vis-row-copy">
                      <span className="cv-vis-row-title-wrap">
                        <span className="cv-vis-row-title">{t(opt.titleKey)}</span>
                        {opt.warn ? (
                          <span className="cv-vis-row-badge">{t('profile.cvVis.notRecommended')}</span>
                        ) : null}
                      </span>
                      <span className="cv-vis-row-hint">{t(opt.hintKey)}</span>
                    </span>
                    <span className={`cv-vis-toggle${active ? ' cv-vis-toggle--on' : ''}`} aria-hidden="true">
                      <span className="cv-vis-toggle-knob" />
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="cv-vis-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t('profile.cvVis.cancel')}
              </button>
              <button type="button" className="btn-gradient-wrap cv-vis-save" onClick={handleSave}>
                <span className="btn-gradient-inner">{t('profile.cvVis.save')}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="cv-vis-confirm">
            <div className="cv-vis-confirm-icon" aria-hidden="true">
              <EyeOff size={22} strokeWidth={2} />
            </div>
            <h2 id="cv-vis-title" className="cv-vis-title">{t('profile.cvVis.confirmTitle')}</h2>
            <p className="cv-vis-confirm-lead">{t('profile.cvVis.confirmText')}</p>
            <p className="cv-vis-confirm-body">{t('profile.cvVis.confirmWarning')}</p>

            <div className="cv-vis-actions cv-vis-actions--confirm">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('options')}>
                {t('profile.cvVis.confirmBack')}
              </button>
              <button type="button" className="btn-gradient-wrap cv-vis-save" onClick={() => onSave?.(values)}>
                <span className="btn-gradient-inner">{t('profile.cvVis.confirmSave')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
