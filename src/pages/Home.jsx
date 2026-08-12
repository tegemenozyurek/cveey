import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CONTACT_EMAIL } from '../config/site'
import { useAdsContentReady } from '../context/AdsPlacementContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { hasPendingCvFile, setPendingCvFile } from '../pendingCvUpload'

const MAX_SIZE = 5 * 1024 * 1024

const BODY_KEYS = ['home.copyBody1', 'home.copyBody2', 'home.copyBody3']

export default function Home() {
  const { user, openLogin, authLoading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  useAdsContentReady(!authLoading)
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (user && hasPendingCvFile()) {
      navigate('/my-cv', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSlideIndex((i) => (i + 1) % BODY_KEYS.length)
    }, 5500)
    return () => window.clearTimeout(id)
  }, [slideIndex])

  useEffect(() => {
    if (authLoading || location.hash !== '#about') return undefined
    const id = window.requestAnimationFrame(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [authLoading, location.hash])

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('myCv.loading')}</p>
      </main>
    )
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!dragging) setDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer?.files?.[0])
  }

  const handleFile = (file) => {
    if (!file) return
    setFileError('')
    if (file.type !== 'application/pdf') {
      setFileError(t('myCv.errorPdfOnly'))
      return
    }
    if (file.size > MAX_SIZE) {
      setFileError(t('myCv.errorTooLarge'))
      return
    }
    setPendingCvFile(file)
    if (user) {
      navigate('/my-cv')
      return
    }
    openLogin()
  }

  return (
    <main className="main home-main">
      <div className="home-split">
        <section className="home-split-panel home-split-copy">
          <h1 className="home-copy-title">{t('home.copyHeadline')}</h1>
          <p className="home-copy-lead">{t('home.copyLead')}</p>

          <div className="home-copy-slider" aria-live="polite">
            <div className="home-copy-slides">
              {BODY_KEYS.map((key, index) => (
                <p
                  key={key}
                  className={`home-copy-slide${index === slideIndex ? ' home-copy-slide--active' : ''}`}
                  aria-hidden={index !== slideIndex}
                >
                  {t(key)}
                </p>
              ))}
            </div>
            <div className="home-copy-dots" role="tablist" aria-label={t('home.copyHeadline')}>
              {BODY_KEYS.map((key, index) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  className={`home-copy-dot${index === slideIndex ? ' home-copy-dot--active' : ''}`}
                  aria-selected={index === slideIndex}
                  aria-label={`${index + 1} / ${BODY_KEYS.length}`}
                  onClick={() => setSlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="home-split-panel home-split-action">
          <div className="home-action-stack">
            <button
              type="button"
              className={`cv-empty-card cv-empty-card--upload${dragging ? ' cv-empty-card--dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <span className="cv-empty-card-icon cv-empty-card-icon--upload" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h2 className="cv-empty-card-title">{t('myCv.emptyUploadTitle')}</h2>
              <p className="cv-empty-card-text">{t('myCv.uploadHint')}</p>
              <span className="cv-dropzone-formats">{t('myCv.emptyUploadText')}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />

            {fileError ? <p className="home-upload-error">{fileError}</p> : null}

            <div className="cv-empty-or">
              <span>{t('myCv.emptyOr')}</span>
            </div>

            <Link to="/create-cv" className="btn-gradient-wrap cv-empty-create-link">
              <span className="btn-gradient-inner cv-empty-cta-inner">
                {t('myCv.guideAtsCreate')}
              </span>
            </Link>
          </div>
        </section>
      </div>

      <article className="home-info" id="about">
        <section className="home-info-block">
          <h2 className="home-info-title">{t('home.about.title')}</h2>
          <p className="home-info-text">{t('home.about.p1')}</p>
          <p className="home-info-text">{t('home.about.p2')}</p>
        </section>

        <section className="home-info-block">
          <h2 className="home-info-title">{t('home.how.title')}</h2>
          <ol className="home-info-steps">
            {['1', '2', '3'].map((n) => (
              <li key={n} className="home-info-step">
                <h3 className="home-info-step-title">{t(`home.how.step${n}.title`)}</h3>
                <p className="home-info-text">{t(`home.how.step${n}.text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-info-block">
          <h2 className="home-info-title">{t('home.visibility.title')}</h2>
          <p className="home-info-text">{t('home.visibility.p1')}</p>
        </section>

        <section className="home-info-block">
          <h2 className="home-info-title">{t('home.contact.title')}</h2>
          <p className="home-info-text">
            {t('home.contact.lead')}{' '}
            <a className="home-info-mail" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  )
}
