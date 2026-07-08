import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import CreateCV from './pages/CreateCV'
import MyCV from './pages/MyCV'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <div className="page">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/create-cv" element={<CreateCV />} />
          <Route path="/my-cv" element={<MyCV />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
