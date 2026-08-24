import { Link } from 'react-router-dom'
import { listGuides } from '../content/guides'
import { useLanguage } from '../context/LanguageContext'

function formatDate(iso, lang) {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Guides() {
  const { t, lang } = useLanguage()
  const guides = listGuides()

  return (
    <main className="main guides-page">
      <article className="guides-index">
        <p className="legal-back">
          <Link to="/">{t('legal.backHome')}</Link>
        </p>
        <header className="about-hero">
          <p className="about-kicker">cveey</p>
          <h1 className="about-title">{t('guides.title')}</h1>
          <p className="about-lead">{t('guides.lead')}</p>
        </header>

        <ul className="guides-list">
          {guides.map((guide) => {
            const copy = guide[lang] || guide.en
            return (
              <li key={guide.slug}>
                <Link to={`/guides/${guide.slug}`} className="guides-card">
                  <h2 className="guides-card-title">{copy.title}</h2>
                  <p className="guides-card-desc">{copy.description}</p>
                  <p className="guides-card-meta">
                    {t('guides.updated')}: {formatDate(guide.updated, lang)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </article>
    </main>
  )
}
