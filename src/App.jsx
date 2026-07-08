import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFiles = (incoming) => {
    const list = Array.from(incoming).filter((f) =>
      /\.(pdf|doc|docx)$/i.test(f.name),
    )
    if (list.length) setFiles((prev) => [...prev, ...list])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onBrowse = () => fileInputRef.current?.click()

  const onFileChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div className="page">
      <header className="header">
        <span className="logo">SAP</span>
        <button type="button" className="login-btn">
          Login
        </button>
      </header>

      <main className="main">
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onBrowse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBrowse()}
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v10M12 3l-4 4M12 3l4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button type="button" className="browse-btn" onClick={onBrowse}>
          Browse
        </button>

        <p className="hint">drag your resumes here</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          hidden
          onChange={onFileChange}
        />

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`}>{f.name}</li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )

}

export default App
