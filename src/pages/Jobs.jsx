import { useLanguage } from '../context/LanguageContext'

export default function Jobs() {
  const { t } = useLanguage()

  return (
    <main className="main">
      <div className="page-header">
        <h1 className="page-title">{t('jobs.title')}</h1>
        <p className="page-subtitle">{t('jobs.subtitle')}</p>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="empty-state-title">{t('jobs.emptyTitle')}</h2>
        <p className="empty-state-text">{t('jobs.emptyText')}</p>
      </div>
    </main>
  )
}
