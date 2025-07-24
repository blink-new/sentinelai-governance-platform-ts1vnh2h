import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Zap, Puzzle } from 'lucide-react'

export function Integrations() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect SentinelAI with your existing tools and workflows
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Integration Marketplace
          </CardTitle>
          <CardDescription>
            Pre-built connectors and custom integration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Puzzle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Integration marketplace with popular tools and services
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}