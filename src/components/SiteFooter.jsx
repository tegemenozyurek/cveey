import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function SiteFooter() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© {year} cveey</p>
        <nav className="site-footer-nav" aria-label={t('footer.legalNav')}>
          <Link to="/privacy">{t('legal.privacy')}</Link>
          <Link to="/terms">{t('legal.terms')}</Link>
        </nav>
      </div>
    </footer>
  )
}
