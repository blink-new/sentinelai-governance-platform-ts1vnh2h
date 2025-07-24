import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Settings as SettingsIcon, Cog } from 'lucide-react'

export function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your SentinelAI platform settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            System settings, integrations, and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Cog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Comprehensive settings panel for platform configuration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}