import { Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ResumeProvider } from './context/ResumeContext'
import { ConsentProvider } from './context/ConsentContext'
import { AdsPlacementProvider, useAdsPlacement } from './context/AdsPlacementContext'
import Navbar from './components/Navbar'
import AdBanner from './components/AdBanner'
import AdSenseLoader from './components/AdSenseLoader'
import CookieConsent from './components/CookieConsent'
import SiteFooter from './components/SiteFooter'
import Home from './pages/Home'
import CreateCV from './pages/CreateCV'
import MyCV from './pages/MyCV'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Network from './pages/Network'
import About from './pages/About'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import './App.css'

function AppShell() {
  const { adsEligible } = useAdsPlacement()

  return (
    <>
      <AdSenseLoader />
      <div className={`page${adsEligible ? '' : ' page--no-ads'}`}>
        <Navbar />
        <div className="app-scroll">
          <div className="app-body">
            {adsEligible ? (
              <aside className="side-rail side-rail--left">
                <AdBanner position="left" />
              </aside>
            ) : null}
            <div className="app-body-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Navigate to="/" replace />} />
                <Route path="/network" element={<Network />} />
                <Route path="/create-cv" element={<CreateCV />} />
                <Route path="/my-cv" element={<MyCV />} />
                <Route path="/messages" element={<Navigate to="/" replace />} />
                <Route path="/notifications" element={<Navigate to="/" replace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:uid" element={<PublicProfile />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
            </div>
            {adsEligible ? (
              <aside className="side-rail side-rail--right">
                <AdBanner position="right" />
              </aside>
            ) : null}
          </div>
          <SiteFooter />
        </div>
        {adsEligible ? (
          <div className="foot-slot-bar">
            <AdBanner position="bottom" format="horizontal" />
          </div>
        ) : null}
      </div>
      <CookieConsent />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ConsentProvider>
          <AuthProvider>
            <ResumeProvider>
              <AdsPlacementProvider>
                <AppShell />
              </AdsPlacementProvider>
            </ResumeProvider>
          </AuthProvider>
        </ConsentProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
