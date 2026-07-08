import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="option-switcher" role="group" aria-label="Language">
      <button
        type="button"
        className={`option-switcher-btn${lang === 'en' ? ' option-switcher-btn--active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <span className="option-switcher-divider" aria-hidden="true">|</span>
      <button
        type="button"
        className={`option-switcher-btn${lang === 'tr' ? ' option-switcher-btn--active' : ''}`}
        onClick={() => setLang('tr')}
        aria-pressed={lang === 'tr'}
      >
        TR
      </button>
    </div>
  )
}
