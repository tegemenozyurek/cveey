import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ResumeProvider } from './context/ResumeContext'
import { ConsentProvider } from './context/ConsentContext'
import Navbar from './components/Navbar'
import AdBanner from './components/AdBanner'
import AdSenseLoader from './components/AdSenseLoader'
import CookieConsent from './components/CookieConsent'
import SiteFooter from './components/SiteFooter'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import CreateCV from './pages/CreateCV'
import MyCV from './pages/MyCV'
import Profile from './pages/Profile'
import Preferences from './pages/Preferences'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Network from './pages/Network'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ConsentProvider>
          <AuthProvider>
            <ResumeProvider>
              <AdSenseLoader />
              <div className="page">
                <Navbar />
                <div className="app-body">
                  <aside className="ad-rail ad-rail--left">
                    <AdBanner position="left" />
                  </aside>
                  <div className="app-body-main">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/network" element={<Network />} />
                      <Route path="/create-cv" element={<CreateCV />} />
                      <Route path="/my-cv" element={<MyCV />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/preferences" element={<Preferences />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                    </Routes>
                  </div>
                  <aside className="ad-rail ad-rail--right">
                    <AdBanner position="right" />
                  </aside>
                </div>
                <SiteFooter />
              </div>
              <CookieConsent />
            </ResumeProvider>
          </AuthProvider>
        </ConsentProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
