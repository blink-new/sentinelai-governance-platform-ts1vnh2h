import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import {
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Server,
  Eye
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Mock data for demonstration
const performanceData = [
  { time: '00:00', evaluations: 1200, latency: 8 },
  { time: '04:00', evaluations: 800, latency: 6 },
  { time: '08:00', evaluations: 2400, latency: 12 },
  { time: '12:00', evaluations: 3200, latency: 15 },
  { time: '16:00', evaluations: 2800, latency: 11 },
  { time: '20:00', evaluations: 1600, latency: 9 },
]

const policyViolations = [
  { policy: 'Content Safety', violations: 45, severity: 'high' },
  { policy: 'Keyword Filter', violations: 23, severity: 'medium' },
  { policy: 'Performance', violations: 12, severity: 'low' },
  { policy: 'Semantic', violations: 8, severity: 'medium' },
]

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    avgLatency: 0,
    activeViolations: 0,
    activePolicies: 0
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        totalEvaluations: prev.totalEvaluations + Math.floor(Math.random() * 10),
        avgLatency: 8 + Math.random() * 4,
        activeViolations: 88 + Math.floor(Math.random() * 10),
        activePolicies: 24
      }))
    }, 2000)

    // Initial load
    setStats({
      totalEvaluations: 125847,
      avgLatency: 9.2,
      activeViolations: 88,
      activePolicies: 24
    })

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time AI governance and policy enforcement overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Live
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvaluations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLatency.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-2.1ms</span> from target
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeViolations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">+3</span> in last 10 minutes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolicies}</div>
            <p className="text-xs text-muted-foreground">
              Across 3 organizations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evaluation Performance
            </CardTitle>
            <CardDescription>
              Real-time evaluation throughput and latency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="evaluations" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Evaluations"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="latency" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Latency (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Policy Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Policy Violations
            </CardTitle>
            <CardDescription>
              Recent violations by policy type and severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policyViolations.map((violation, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      violation.severity === 'high' ? 'bg-red-500' :
                      violation.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium text-sm">{violation.policy}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {violation.severity} severity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{violation.violations}</div>
                    <div className="text-xs text-muted-foreground">violations</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rust Engine</span>
                <span className="text-green-600">Healthy</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Python ML Service</span>
                <span className="text-green-600">Healthy</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span className="text-green-600">Healthy</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-sm text-muted-foreground mb-4">
              Across 12 organizations
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>API Requests</span>
                <span>89%</span>
              </div>
              <Progress value={89} className="h-1" />
              <div className="flex justify-between text-xs">
                <span>Dashboard Users</span>
                <span>11%</span>
              </div>
              <Progress value={11} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">2m ago</span>
                <span>Policy updated: Content Safety</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-muted-foreground">5m ago</span>
                <span>High violation rate detected</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">12m ago</span>
                <span>New user joined: acme-corp</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">18m ago</span>
                <span>System health check passed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}