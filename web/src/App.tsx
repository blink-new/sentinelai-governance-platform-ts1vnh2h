import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from './components/layout/AppSidebar'
import { Dashboard } from './pages/Dashboard'
import { PolicyManagement } from './pages/PolicyManagement'
import { RealtimeMonitoring } from './pages/RealtimeMonitoring'
import { Analytics } from './pages/Analytics'
import { ApiDocs } from './pages/ApiDocs'
import { Settings } from './pages/Settings'
import { AuditLogs } from './pages/AuditLogs'
import { Billing } from './pages/Billing'
import { TeamManagement } from './pages/TeamManagement'
import { Integrations } from './pages/Integrations'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SentinelAI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">SentinelAI</h1>
            <p className="text-muted-foreground">Real-Time AI Governance & Policy Enforcement Platform</p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/policies" element={<PolicyManagement />} />
              <Route path="/monitoring" element={<RealtimeMonitoring />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/team" element={<TeamManagement />} />
              <Route path="/integrations" element={<Integrations />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  )
}

export default App