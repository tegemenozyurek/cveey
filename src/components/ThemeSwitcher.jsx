import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="option-switcher" role="group" aria-label={t('prefs.theme')}>
      <button
        type="button"
        className={`option-switcher-btn${theme === 'dark' ? ' option-switcher-btn--active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        {t('prefs.dark')}
      </button>
      <button
        type="button"
        className={`option-switcher-btn${theme === 'light' ? ' option-switcher-btn--active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        {t('prefs.light')}
      </button>
    </div>
  )
}
