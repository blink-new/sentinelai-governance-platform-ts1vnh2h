import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { CreditCard, DollarSign } from 'lucide-react'

export function Billing() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">
          Monitor usage, billing, and subscription details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Usage & Billing
          </CardTitle>
          <CardDescription>
            Track your usage metrics and manage billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Usage-based billing dashboard with detailed metrics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}