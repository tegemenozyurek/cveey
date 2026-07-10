export default function CreateCvSectionHead({ stepNumber, title, description }) {
  return (
    <div className="create-cv-section-head">
      <span className="create-cv-section-step">{stepNumber}</span>
      <div>
        <h2 className="create-cv-section-title">{title}</h2>
        <p className="create-cv-section-desc">{description}</p>
      </div>
    </div>
  )
}
