import { useLanguage } from '../../context/LanguageContext'

export default function CreateCvMaxCvModal({ max, onGoToMyCv, onClose }) {
  const { t } = useLanguage()

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal confirm-modal"
        role="dialog"
        aria-labelledby="create-cv-max-cv-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-cv-max-cv-title" className="confirm-title">{t('createCv.maxCvTitle')}</h2>
        <p className="confirm-text">{t('createCv.maxCvMessage', { max })}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('myCv.cancel')}
          </button>
          <button type="button" className="btn-gradient-wrap" onClick={onGoToMyCv}>
            <span className="btn-gradient-inner">{t('createCv.goToMyCv')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
