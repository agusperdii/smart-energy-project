import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './app/Layout'
import DashboardPage from './app/Dashboard/DashboardPage'
import SimulationPage from './app/Simulation/SimulationPage'
import AboutPage from './app/About/AboutPage'
import { TelemetryProvider } from './app/Dashboard/TelemetryContext'

function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Pengaturan akun dan preferensi pengguna.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 max-w-lg space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
            JD
          </div>
          <div>
            <h2 className="text-lg font-semibold">John Doe</h2>
            <p className="text-sm text-muted-foreground">Manager Operasional</p>
          </div>
        </div>
        <hr className="border-border/50" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Email:</strong> john.doe@energizer.io</p>
          <p><strong>Divisi:</strong> Operasi Gardu</p>
          <p><strong>ID Fasilitas:</strong> FAC-8892-IND</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
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
  )
}

export default App