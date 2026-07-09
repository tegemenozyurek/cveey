import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ResumeProvider } from './context/ResumeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import CreateCV from './pages/CreateCV'
import MyCV from './pages/MyCV'
import Profile from './pages/Profile'
import Preferences from './pages/Preferences'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
        <ResumeProvider>
        <div className="page">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/create-cv" element={<CreateCV />} />
            <Route path="/my-cv" element={<MyCV />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/preferences" element={<Preferences />} />
          </Routes>
        </div>
        </ResumeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
