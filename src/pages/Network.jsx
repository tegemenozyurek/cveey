import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import UserAvatar from '../components/UserAvatar'

const MOCK_SUGGESTED = [
  {
    id: '1',
    displayName: 'Elif Yılmaz',
    headline: 'Product Designer · Figma',
    location: 'Istanbul, TR',
    photoURL: null,
  },
  {
    id: '2',
    displayName: 'Can Demir',
    headline: 'Frontend Engineer · React',
    location: 'Ankara, TR',
    photoURL: null,
  },
  {
    id: '3',
    displayName: 'Maya Chen',
    headline: 'Data Analyst · SQL · Python',
    location: 'Berlin, DE',
    photoURL: null,
  },
  {
    id: '4',
    displayName: 'Omar Hassan',
    headline: 'DevOps Engineer · AWS',
    location: 'London, UK',
    photoURL: null,
  },
  {
    id: '5',
    displayName: 'Sofia Rossi',
    headline: 'HR Business Partner',
    location: 'Milan, IT',
    photoURL: null,
  },
]

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export default function Network() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_SUGGESTED
    return MOCK_SUGGESTED.filter((person) => {
      const haystack = `${person.displayName} ${person.headline} ${person.location}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query])

  return (
    <main className="main">
      <div className="network-main">
        <header className="network-header">
          <h1 className="network-title">{t('network.title')}</h1>
          <p className="network-subtitle">{t('network.subtitle')}</p>
        </header>

        <div className="network-search">
          <span className="network-search-icon">
            <SearchIcon />
          </span>
          <input
            type="search"
            className="network-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('network.searchPlaceholder')}
            aria-label={t('network.searchAria')}
            autoComplete="off"
          />
        </div>

        <section className="network-suggested" aria-labelledby="network-suggested-heading">
          <div className="network-section-head">
            <h2 id="network-suggested-heading" className="network-section-title">
              {t('network.suggested')}
            </h2>
            <p className="network-section-hint">{t('network.suggestedHint')}</p>
          </div>

          {filtered.length === 0 ? (
            <p className="network-empty">{t('network.noResults')}</p>
          ) : (
            <ul className="network-people-list">
              {filtered.map((person) => (
                <li key={person.id} className="network-person">
                  <UserAvatar user={person} className="network-person-avatar" />
                  <div className="network-person-info">
                    <p className="network-person-name">{person.displayName}</p>
                    <p className="network-person-headline">{person.headline}</p>
                    <p className="network-person-location">{person.location}</p>
                  </div>
                  <button type="button" className="network-connect-btn">
                    {t('network.connect')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
