import { useLanguage } from '../context/LanguageContext'
import constructionArt from '../assets/images/undraw_under-construction_c2y1.svg'

export default function UnderConstruction() {
  const { t } = useLanguage()

  return (
    <main className="main">
      <div className="under-construction">
        <h1 className="under-construction-title">{t('underConstruction.title')}</h1>
        <p className="under-construction-text">{t('underConstruction.text')}</p>
        <img
          className="under-construction-art"
          src={constructionArt}
          alt=""
          width={420}
          height={258}
          loading="lazy"
        />
      </div>
    </main>
  )
}
