import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'

export default function Preferences() {
  const { t } = useLanguage()

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">{t('prefs.title')}</h1>
        <p className="page-subtitle">{t('prefs.subtitle')}</p>
      </div>

      <div className="prefs-card">
        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('prefs.language')}</p>
            <p className="prefs-row-hint">{t('prefs.languageHint')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="prefs-divider" />

        <div className="prefs-row">
          <div className="prefs-row-info">
            <p className="prefs-row-label">{t('prefs.theme')}</p>
            <p className="prefs-row-hint">{t('prefs.themeHint')}</p>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  )
}
