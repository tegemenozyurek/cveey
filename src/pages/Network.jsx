import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LockIcon from '../components/LockIcon'
import UserAvatar from '../components/UserAvatar'
import { subscribeToUserNetworks } from '../networkService'
import { getUsersByIds, searchUsersByUsername } from '../userService'

const SUGGESTED_USER_IDS = [
  'HRVXsVDQOMRv8B3aYqeXdYcraEw1',
  'uxdVROF7gCYESRYuSbMSjbPUBW92',
]

const SEARCH_DEBOUNCE_MS = 300

function SearchIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 6l-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PersonRow({ person, actionLabel, iconOnly = false, variant = 'default', onAction }) {
  const username = person.username || person.displayName || ''
  const bachelorNames = Array.isArray(person.bachelorNames) ? person.bachelorNames : []
  const isResult = variant === 'result'

  return (
    <li className={`network-person${isResult ? ' network-person--result' : ''}`}>
      <UserAvatar user={person} className="network-person-avatar" />
      <div className="network-person-info">
        {isResult ? (
          <p className="network-person-name">
            <span className="network-person-username">{username}</span>
            {bachelorNames.length > 0 ? (
              <>
                <span className="network-person-sep"> · </span>
                <span className="network-person-bachelors">{bachelorNames.join(', ')}</span>
              </>
            ) : null}
          </p>
        ) : (
          <>
            <p className="network-person-name">{person.displayName || person.username}</p>
            {person.headline ? <p className="network-person-headline">{person.headline}</p> : null}
            {person.location || person.homeCity ? (
              <p className="network-person-location">{person.location || person.homeCity}</p>
            ) : null}
          </>
        )}
      </div>
      <button
        type="button"
        className={`network-connect-btn${iconOnly ? ' network-connect-btn--icon' : ''}`}
        aria-label={actionLabel}
        title={actionLabel}
        onClick={onAction}
        disabled={!onAction}
      >
        {iconOnly ? <MessageIcon /> : actionLabel}
      </button>
    </li>
  )
}

export default function Network() {
  const { t } = useLanguage()
  const { user, openLogin, authLoading } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showMyNetwork, setShowMyNetwork] = useState(false)
  const [myNetwork, setMyNetwork] = useState([])
  const [myNetworkLoading, setMyNetworkLoading] = useState(true)
  const [suggested, setSuggested] = useState([])
  const [suggestedLoading, setSuggestedLoading] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (!user?.uid) {
      setMyNetwork([])
      setMyNetworkLoading(false)
      return undefined
    }

    setMyNetworkLoading(true)
    return subscribeToUserNetworks(
      user.uid,
      (people) => {
        setMyNetwork(people)
        setMyNetworkLoading(false)
      },
      () => {
        setMyNetwork([])
        setMyNetworkLoading(false)
      },
    )
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) {
      setSuggested([])
      setSuggestedLoading(false)
      return undefined
    }

    let cancelled = false
    setSuggestedLoading(true)

    getUsersByIds(SUGGESTED_USER_IDS)
      .then((people) => {
        if (!cancelled) {
          setSuggested(people)
          setSuggestedLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggested([])
          setSuggestedLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  const isSearching = !showMyNetwork && debouncedQuery.length >= 3

  useEffect(() => {
    if (!isSearching || !user) {
      setResults([])
      setSearching(false)
      setSearchError('')
      return
    }

    let cancelled = false
    setSearching(true)
    setSearchError('')

    searchUsersByUsername(debouncedQuery, { excludeUid: user.uid })
      .then((people) => {
        if (!cancelled) {
          setResults(people)
          setSearching(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([])
          setSearching(false)
          setSearchError(t('network.searchError'))
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, isSearching, user, t])

  if (authLoading) {
    return (
      <main className="main">
        <p className="page-loading">{t('network.loading')}</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="main">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <LockIcon />
          </div>
          <h2 className="empty-state-title">{t('network.signInRequired')}</h2>
          <p className="empty-state-text">{t('network.signInText')}</p>
          <button type="button" className="btn-gradient-wrap" onClick={openLogin}>
            <span className="btn-gradient-inner">{t('nav.signIn')}</span>
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="network-main">
        <header className="network-header">
          <div className="network-header-left">
            <h1 className="network-title">{t('network.title')}</h1>
          </div>
          <div className="network-header-actions">
            <button
              type="button"
              className={`network-my-btn${showMyNetwork ? ' network-my-btn--active' : ''}`}
              onClick={() => setShowMyNetwork((open) => !open)}
              aria-pressed={showMyNetwork}
            >
              {showMyNetwork ? <SearchIcon size={16} /> : <PeopleIcon />}
              {showMyNetwork ? t('network.backToSearch') : t('network.myNetworks')}
            </button>
          </div>
        </header>

        {showMyNetwork ? (
          <section className="network-suggested" aria-labelledby="network-mine-heading">
            <div className="network-section-head">
              <h2 id="network-mine-heading" className="network-section-title">
                {t('network.myNetworks')}
              </h2>
              <p className="network-section-hint">{t('network.myNetworksHint')}</p>
            </div>

            <ul className="network-people-list">
              {myNetworkLoading ? (
                <li className="network-empty">{t('network.loading')}</li>
              ) : myNetwork.length === 0 ? (
                <li className="network-empty">{t('network.noConnections')}</li>
              ) : (
                myNetwork.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    actionLabel={t('network.connect')}
                    onAction={() => navigate(`/profile/${person.uid}`)}
                  />
                ))
              )}
            </ul>
          </section>
        ) : (
          <>
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

            {isSearching ? (
              <section className="network-suggested" aria-labelledby="network-results-heading">
                <div className="network-section-head">
                  <h2 id="network-results-heading" className="network-section-title">
                    {t('network.results')}
                  </h2>
                </div>

                {searching ? (
                  <p className="network-empty">{t('network.searching')}</p>
                ) : searchError ? (
                  <p className="network-empty">{searchError}</p>
                ) : results.length === 0 ? (
                  <p className="network-empty">{t('network.noResults')}</p>
                ) : (
                  <ul className="network-people-list">
                    {results.map((person) => (
                      <PersonRow
                        key={person.id}
                        person={person}
                        actionLabel={t('network.connect')}
                        variant="result"
                        onAction={
                          person.uid
                            ? () => navigate(`/profile/${person.uid}`)
                            : undefined
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>
            ) : (
              <section className="network-suggested" aria-labelledby="network-suggested-heading">
                <div className="network-section-head">
                  <h2 id="network-suggested-heading" className="network-section-title">
                    {t('network.suggested')}
                  </h2>
                  <p className="network-section-hint">{t('network.suggestedHint')}</p>
                </div>

                {suggestedLoading ? (
                  <p className="network-empty">{t('network.loading')}</p>
                ) : suggested.length === 0 ? (
                  <p className="network-empty">{t('network.noSuggested')}</p>
                ) : (
                  <ul className="network-people-list">
                    {suggested.map((person) => (
                      <PersonRow
                        key={person.id}
                        person={person}
                        actionLabel={t('network.connect')}
                        variant="result"
                        onAction={
                          person.uid
                            ? () => navigate(`/profile/${person.uid}`)
                            : undefined
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
