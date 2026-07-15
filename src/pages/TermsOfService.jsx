import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function TermsOfService() {
  const { t, lang } = useLanguage()
  const updated = lang === 'tr' ? '16 Temmuz 2026' : 'July 16, 2026'

  return (
    <main className="main legal-page">
      <article className="legal-article">
        <p className="legal-back">
          <Link to="/">{t('legal.backHome')}</Link>
        </p>
        <h1 className="legal-title">{t('terms.title')}</h1>
        <p className="legal-updated">
          {t('legal.updated')}: {updated}
        </p>

        <section className="legal-section">
          <h2>{t('terms.s1.title')}</h2>
          <p>{t('terms.s1.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('terms.s2.title')}</h2>
          <p>{t('terms.s2.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('terms.s3.title')}</h2>
          <p>{t('terms.s3.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('terms.s4.title')}</h2>
          <p>{t('terms.s4.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('terms.s5.title')}</h2>
          <p>{t('terms.s5.body')}</p>
        </section>
      </article>
    </main>
  )
}
