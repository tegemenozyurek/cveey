import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import ThemeSwitcher from './ThemeSwitcher'

export default function SiteFooter() {
  const { t } = useLanguage()
  const { user, authLoading } = useAuth()
  const year = new Date().getFullYear()
  const showTheme = !authLoading && !user

  return (
    <footer className="site-footer">
      <div className={`site-footer-inner${showTheme ? '' : ' site-footer-inner--no-controls'}`}>
        {showTheme ? (
          <div className="site-footer-controls site-footer-controls--with-theme">
            <ThemeSwitcher />
          </div>
        ) : null}
        <p className="site-footer-copy">© {year} cveey</p>
        <nav className="site-footer-nav" aria-label={t('footer.legalNav')}>
          <Link to="/privacy">{t('legal.privacy')}</Link>
          <Link to="/terms">{t('legal.terms')}</Link>
        </nav>
      </div>
    </footer>
  )
}
