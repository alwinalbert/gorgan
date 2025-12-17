import Dashboard from './components/Dashboard'
import AuthPage from './components/AuthPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
