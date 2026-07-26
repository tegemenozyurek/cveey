import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function PrivacyPolicy() {
  const { t, lang } = useLanguage()
  const updated = lang === 'tr' ? '27 Temmuz 2026' : 'July 27, 2026'

  return (
    <main className="main legal-page">
      <article className="legal-article">
        <p className="legal-back">
          <Link to="/">{t('legal.backHome')}</Link>
        </p>
        <h1 className="legal-title">{t('privacy.title')}</h1>
        <p className="legal-updated">
          {t('legal.updated')}: {updated}
        </p>

        <section className="legal-section">
          <h2>{t('privacy.s1.title')}</h2>
          <p>{t('privacy.s1.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s2.title')}</h2>
          <p>{t('privacy.s2.body')}</p>
          <ul>
            <li>{t('privacy.s2.item1')}</li>
            <li>{t('privacy.s2.item2')}</li>
            <li>{t('privacy.s2.item3')}</li>
            <li>{t('privacy.s2.item4')}</li>
            <li>{t('privacy.s2.item5')}</li>
            <li>{t('privacy.s2.item6')}</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s3.title')}</h2>
          <p>{t('privacy.s3.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s4.title')}</h2>
          <p>{t('privacy.s4.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s5.title')}</h2>
          <p>{t('privacy.s5.body')}</p>
          <ul>
            <li>{t('privacy.s5.item1')}</li>
            <li>{t('privacy.s5.item2')}</li>
            <li>{t('privacy.s5.item3')}</li>
            <li>{t('privacy.s5.item4')}</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s6.title')}</h2>
          <p>{t('privacy.s6.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s7.title')}</h2>
          <p>{t('privacy.s7.body')}</p>
          <p>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('privacy.s7.link')}
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s8.title')}</h2>
          <p>{t('privacy.s8.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s9.title')}</h2>
          <p>{t('privacy.s9.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s10.title')}</h2>
          <p>{t('privacy.s10.body')}</p>
        </section>

        <section className="legal-section">
          <h2>{t('privacy.s11.title')}</h2>
          <p>{t('privacy.s11.body')}</p>
        </section>
      </article>
    </main>
  )
}
