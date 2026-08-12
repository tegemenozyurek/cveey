import { Link } from 'react-router-dom'
import { CONTACT_EMAILS } from '../config/site'
import { useAdsContentReady } from '../context/AdsPlacementContext'
import { useLanguage } from '../context/LanguageContext'

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function About() {
  const { t } = useLanguage()
  useAdsContentReady(true)

  return (
    <main className="main about-page">
      <article className="about-article">
        <p className="legal-back">
          <Link to="/">{t('legal.backHome')}</Link>
        </p>

        <header className="about-hero">
          <p className="about-kicker">cveey</p>
          <h1 className="about-title">{t('home.about.title')}</h1>
          <p className="about-lead">{t('home.copyLead')}</p>
        </header>

        <div className="about-prose">
          <p>{t('home.about.p1')}</p>
          <p>{t('home.about.p2')}</p>
        </div>

        <section className="about-section" aria-labelledby="about-how">
          <h2 id="about-how" className="about-section-title">{t('home.how.title')}</h2>
          <ol className="about-steps">
            {['1', '2', '3'].map((n) => (
              <li key={n} className="about-step">
                <span className="about-step-num" aria-hidden="true">{n}</span>
                <div className="about-step-copy">
                  <h3 className="about-step-title">{t(`home.how.step${n}.title`)}</h3>
                  <p>{t(`home.how.step${n}.text`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section" aria-labelledby="about-control">
          <h2 id="about-control" className="about-section-title">{t('home.visibility.title')}</h2>
          <p className="about-prose-text">{t('home.visibility.p1')}</p>
        </section>

        <section className="about-contact" aria-labelledby="about-contact">
          <h2 id="about-contact" className="about-section-title">{t('home.contact.title')}</h2>
          <p className="about-prose-text">{t('home.contact.lead')}</p>
          <ul className="about-contact-list">
            {CONTACT_EMAILS.map((email) => (
              <li key={email}>
                <a className="about-contact-row" href={`mailto:${email}`}>
                  <span className="about-contact-icon">
                    <MailIcon />
                  </span>
                  <span className="about-contact-address">{email}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
}
