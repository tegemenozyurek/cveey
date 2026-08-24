import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { aboutPage } from '../src/content/aboutPage.js'
import { homePage } from '../src/content/homePage.js'
import { countWords, guideBodyText, guides } from '../src/content/guides/index.js'
import { SITE_NAME, SITE_ORIGIN } from '../src/config/site.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const LANG = 'tr'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraphs(items) {
  return items.map((item) => `<p>${escapeHtml(item)}</p>`).join('')
}

function listItems(items) {
  if (!items?.length) return ''
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function homeHtml() {
  const copy = homePage[LANG]
  const teasers = guides.slice(0, 6).map((guide) => {
    const item = guide[LANG] || guide.en
    return `<li><a href="/guides/${escapeHtml(guide.slug)}">${escapeHtml(item.title)}</a></li>`
  })
  return `
<main class="main home-main">
  <h1>${escapeHtml('İşe Alınmanın En Kolay Yolu')}</h1>
  <p>${escapeHtml('CV\'nizi yükleyin ve İK firmalarının sizinle iletişime geçmesini bekleyin.')}</p>
  <article class="home-prose">
    <section>
      <h2>${escapeHtml(copy.introTitle)}</h2>
      ${paragraphs(copy.intro)}
    </section>
    <section>
      <h2>${escapeHtml(copy.howTitle)}</h2>
      <ol>${copy.how.map((step) => `<li><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol>
    </section>
    <section>
      <h2>${escapeHtml(copy.whyTitle)}</h2>
      ${paragraphs(copy.why)}
    </section>
    <section>
      <h2>${escapeHtml(copy.whoTitle)}</h2>
      ${paragraphs(copy.who)}
    </section>
    <section>
      <h2>${escapeHtml(copy.faqTitle)}</h2>
      <dl>${copy.faq.map((item) => `<div><dt>${escapeHtml(item.q)}</dt><dd>${escapeHtml(item.a)}</dd></div>`).join('')}</dl>
    </section>
    <section>
      <h2>${escapeHtml(copy.guidesTitle)}</h2>
      <p>${escapeHtml(copy.guidesLead)}</p>
      <ul>${teasers.join('')}</ul>
      <p><a href="/guides">${escapeHtml(copy.guidesCta)}</a></p>
    </section>
  </article>
</main>`
}

function aboutHtml() {
  const extra = aboutPage[LANG]
  return `
<main class="main about-page">
  <article class="about-article">
    <h1>cveey nedir?</h1>
    <p>cveey, profesyonel bir CV platformudur. Özgeçmiş oluşturur veya yüklersiniz, şehir ve eğitim bilgilerinizle bir profil tutarsınız ve iş ortağı İK firmalarının inceleyebileceği yetenek havuzuna katılırsınız.</p>
    <p>Fikir basit: aynı PDF’i onlarca iş sitesine göndermek yerine cveey’de tek bir aktif CV tutar, zaten aday arayan işe alımcılara görünür kalırsınız.</p>
    <h2>${escapeHtml(extra.extraTitle)}</h2>
    ${paragraphs(extra.extra)}
    <p><a href="/guides">Tüm rehberlere git</a></p>
  </article>
</main>`
}

function guidesIndexHtml() {
  const cards = guides.map((guide) => {
    const copy = guide[LANG] || guide.en
    return `<li><a href="/guides/${escapeHtml(guide.slug)}"><h2>${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.description)}</p></a></li>`
  })
  return `
<main class="main guides-page">
  <article class="guides-index">
    <h1>CV rehberleri</h1>
    <p>ATS uyumlu CV, Türkiye ve uluslararası format, gizlilik ve iş başvuruları için pratik yazılar.</p>
    <ul>${cards.join('')}</ul>
  </article>
</main>`
}

function guideHtml(guide) {
  const copy = guide[LANG] || guide.en
  const sections = copy.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${paragraphs(section.paragraphs || [])}
      ${listItems(section.list)}
    </section>`).join('')
  return `
<main class="main about-page">
  <article class="about-article guide-article">
    <p><a href="/guides">← Tüm rehberler</a></p>
    <h1>${escapeHtml(copy.title)}</h1>
    <p>${escapeHtml(copy.description)}</p>
    ${sections}
  </article>
</main>`
}

function wrapPage(indexHtml, { title, description, canonical, body, lang = LANG }) {
  return indexHtml
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    )
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

function sitemapXml() {
  const lastmod = '2026-08-24'
  const urls = [
    { loc: `${SITE_ORIGIN}/`, priority: '1.0' },
    { loc: `${SITE_ORIGIN}/about`, priority: '0.8' },
    { loc: `${SITE_ORIGIN}/guides`, priority: '0.9' },
    { loc: `${SITE_ORIGIN}/privacy`, priority: '0.3' },
    { loc: `${SITE_ORIGIN}/terms`, priority: '0.3' },
    ...guides.map((guide) => ({
      loc: `${SITE_ORIGIN}/guides/${guide.slug}`,
      priority: '0.8',
    })),
  ]
  const body = urls.map((url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>
`
}

async function writeRoute(indexHtml, routePath, page) {
  const target = routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.replace(/^\//, ''), 'index.html')
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, wrapPage(indexHtml, page), 'utf8')
}

export async function prerenderContent() {
  const indexPath = path.join(distDir, 'index.html')
  const indexHtml = await readFile(indexPath, 'utf8')
  const short = []

  for (const guide of guides) {
    for (const lang of ['en', 'tr']) {
      const words = countWords(guideBodyText(guide[lang]))
      if (words < 800) short.push(`${guide.slug} ${lang}: ${words}`)
    }
  }

  if (short.length) {
    console.warn(`[prerender] short articles:\n${short.join('\n')}`)
  } else {
    console.log(`[prerender] ${guides.length} guides, all language versions ≥ 800 words`)
  }

  const homeIndex = wrapPage(indexHtml, {
    title: `${SITE_NAME} — CV platformu ve yetenek havuzu`,
    description:
      'ATS uyumlu CV yükleyin veya oluşturun, kimlerin göreceğini siz seçin, ortak İK firmalarına görünür kalın. Türkiye’de CV yazımı için açık rehberler.',
    canonical: `${SITE_ORIGIN}/`,
    body: '',
  }).replace('</body>', `<noscript>${homeHtml()}</noscript>\n  </body>`)
  await writeFile(path.join(distDir, 'index.html'), homeIndex, 'utf8')
  await writeRoute(indexHtml, '/about', {
    title: `cveey hakkında · ${SITE_NAME}`,
    description: 'cveey, yetenek havuzu ve ATS odaklı CV oluşturucu sunan bir CV platformudur.',
    canonical: `${SITE_ORIGIN}/about`,
    body: aboutHtml(),
  })
  await writeRoute(indexHtml, '/guides', {
    title: `CV rehberleri · ${SITE_NAME}`,
    description: 'ATS uyumlu CV, Türkiye formatı, özet, gizlilik ve PDF kontrol listesi rehberleri.',
    canonical: `${SITE_ORIGIN}/guides`,
    body: guidesIndexHtml(),
  })

  for (const guide of guides) {
    const copy = guide[LANG] || guide.en
    await writeRoute(indexHtml, `/guides/${guide.slug}`, {
      title: `${copy.title} · ${SITE_NAME}`,
      description: copy.description,
      canonical: `${SITE_ORIGIN}/guides/${guide.slug}`,
      body: guideHtml(guide),
    })
  }

  await writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml(), 'utf8')
  console.log(`[prerender] wrote home, about, guides index, ${guides.length} articles, sitemap.xml`)
}

if (process.argv[1] && path.normalize(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prerenderContent().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
