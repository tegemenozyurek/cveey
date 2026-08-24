import { Link, useParams } from 'react-router-dom'
import { getGuideBySlug, relatedGuides } from '../content/guides'
import { useLanguage } from '../context/LanguageContext'

function formatDate(iso, lang) {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function GuideArticle() {
  const { slug } = useParams()
  const { t, lang } = useLanguage()
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return (
      <main className="main about-page">
        <article className="about-article">
          <p className="legal-back">
            <Link to="/guides">{t('guides.backToList')}</Link>
          </p>
          <h1 className="about-title">{t('guides.notFoundTitle')}</h1>
          <p className="about-prose-text">{t('guides.notFoundText')}</p>
        </article>
      </main>
    )
  }

  const copy = guide[lang] || guide.en
  const related = relatedGuides(guide.slug)

  return (
    <main className="main about-page">
      <article className="about-article guide-article">
        <p className="legal-back">
          <Link to="/guides">{t('guides.backToList')}</Link>
        </p>
        <header className="about-hero">
          <p className="about-kicker">{t('guides.kicker')}</p>
          <h1 className="about-title">{copy.title}</h1>
          <p className="guide-meta">
            {t('guides.updated')}: {formatDate(guide.updated, lang)}
          </p>
          <p className="about-lead">{copy.description}</p>
        </header>

        {copy.sections.map((section) => (
          <section key={section.heading} className="about-section">
            <h2 className="about-section-title">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="about-prose-text">{paragraph}</p>
            ))}
            {section.list?.length ? (
              <ul className="guide-list">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {related.length ? (
          <section className="about-section" aria-labelledby="guide-related">
            <h2 id="guide-related" className="about-section-title">{t('guides.related')}</h2>
            <ul className="guide-related">
              {related.map((item) => {
                const itemCopy = item[lang] || item.en
                return (
                  <li key={item.slug}>
                    <Link to={`/guides/${item.slug}`}>{itemCopy.title}</Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  )
}
