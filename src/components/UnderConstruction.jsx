import { useLanguage } from '../context/LanguageContext'

const CONSTRUCTION_GIF =
  'https://assets-v2.lottiefiles.com/a/7169871e-9f86-11ee-8945-b7fc8fe73392/cywZsb99zQ.gif'

export default function UnderConstruction() {
  const { t } = useLanguage()

  return (
    <main className="main">
      <div className="under-construction">
        <h1 className="under-construction-title">{t('underConstruction.title')}</h1>
        <p className="under-construction-text">{t('underConstruction.text')}</p>
        <img
          className="under-construction-gif"
          src={CONSTRUCTION_GIF}
          alt=""
          width={280}
          height={280}
          loading="lazy"
        />
      </div>
    </main>
  )
}
