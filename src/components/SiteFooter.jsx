import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

export default function SiteFooter() {
  const { t } = useLanguage()
  const { user, authLoading } = useAuth()
  const year = new Date().getFullYear()
  const showTheme = !authLoading && !user

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-start">
          <div className="site-footer-controls">
            <LanguageSwitcher />
            {showTheme ? <ThemeSwitcher /> : null}
          </div>
        </div>
        <p className="site-footer-copy">© {year} cveey</p>
        <nav className="site-footer-nav" aria-label={t('footer.legalNav')}>
          <Link to="/about">{t('footer.about')}</Link>
          <Link to="/guides">{t('footer.guides')}</Link>
          <Link to="/privacy">{t('legal.privacy')}</Link>
          <Link to="/terms">{t('legal.terms')}</Link>
        </nav>
      </div>
    </footer>
  )
}
