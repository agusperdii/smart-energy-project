import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './app/Layout'
import DashboardPage from './app/Dashboard/DashboardPage'
import SimulationPage from './app/Simulation/SimulationPage'
import AboutPage from './app/About/AboutPage'
import ProfilePage from './app/Profile/ProfilePage'
import { TelemetryProvider } from './app/Dashboard/TelemetryContext'
import { ThemeProvider } from './app/Components/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <TelemetryProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </TelemetryProvider>
    </ThemeProvider>
  )
}

export default App