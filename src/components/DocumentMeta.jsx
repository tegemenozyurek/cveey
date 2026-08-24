import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_NAME, SITE_ORIGIN } from '../config/site'
import { getGuideBySlug } from '../content/guides'
import { useLanguage } from '../context/LanguageContext'

function upsertMeta(name, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Per-route title, description, canonical URL, and robots.
 * App screens are noindex so empty dashboards are not treated as inventory.
 */
export default function DocumentMeta() {
  const { pathname } = useLocation()
  const { t, lang } = useLanguage()

  useEffect(() => {
    const copy = metaForPath(pathname, t, lang)
    document.title = copy.title
    upsertMeta('description', copy.description)
    upsertMeta('robots', copy.robots)
    upsertCanonical(`${SITE_ORIGIN}${copy.canonicalPath}`)
    document.documentElement.lang = lang
    upsertJsonLd('cveey-jsonld', copy.jsonLd || null)
  }, [pathname, t, lang])

  return null
}

function metaForPath(pathname, t, lang) {
  const noindex = 'noindex, follow'
  const index = 'index, follow'

  if (pathname === '/') {
    return {
      title: t('meta.homeTitle'),
      description: t('meta.homeDescription'),
      robots: index,
      canonicalPath: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_ORIGIN,
      },
    }
  }
  if (pathname === '/about') {
    return {
      title: t('meta.aboutTitle'),
      description: t('meta.aboutDescription'),
      robots: index,
      canonicalPath: '/about',
    }
  }
  if (pathname === '/guides') {
    return {
      title: t('meta.guidesTitle'),
      description: t('meta.guidesDescription'),
      robots: index,
      canonicalPath: '/guides',
    }
  }
  if (pathname.startsWith('/guides/')) {
    const slug = decodeURIComponent(pathname.slice('/guides/'.length)).replace(/\/+$/, '')
    const guide = getGuideBySlug(slug)
    if (guide) {
      const copy = guide[lang] || guide.en
      const url = `${SITE_ORIGIN}/guides/${guide.slug}`
      return {
        title: `${copy.title} · ${SITE_NAME}`,
        description: copy.description,
        robots: index,
        canonicalPath: `/guides/${guide.slug}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: copy.title,
          description: copy.description,
          datePublished: guide.published,
          dateModified: guide.updated,
          inLanguage: lang,
          mainEntityOfPage: url,
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
        },
      }
    }
    return {
      title: t('meta.guideNotFoundTitle'),
      description: t('meta.guidesDescription'),
      robots: noindex,
      canonicalPath: '/guides',
    }
  }
  if (pathname === '/privacy') {
    return {
      title: t('meta.privacyTitle'),
      description: t('meta.privacyDescription'),
      robots: index,
      canonicalPath: '/privacy',
    }
  }
  if (pathname === '/terms') {
    return {
      title: t('meta.termsTitle'),
      description: t('meta.termsDescription'),
      robots: index,
      canonicalPath: '/terms',
    }
  }

  return {
    title: `${SITE_NAME}`,
    description: t('meta.homeDescription'),
    robots: noindex,
    canonicalPath: pathname || '/',
  }
}
