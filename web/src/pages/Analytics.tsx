import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  Clock, 
  Users,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Zap
} from 'lucide-react';

// Mock data for analytics
const evaluationTrends = [
  { date: '2024-01-15', evaluations: 1200, violations: 45, avgLatency: 23 },
  { date: '2024-01-16', evaluations: 1350, violations: 52, avgLatency: 21 },
  { date: '2024-01-17', evaluations: 1100, violations: 38, avgLatency: 25 },
  { date: '2024-01-18', evaluations: 1450, violations: 61, avgLatency: 19 },
  { date: '2024-01-19', evaluations: 1600, violations: 48, avgLatency: 22 },
  { date: '2024-01-20', evaluations: 1750, violations: 55, avgLatency: 18 },
  { date: '2024-01-21', evaluations: 1900, violations: 42, avgLatency: 20 }
];

const policyEffectiveness = [
  { name: 'Keyword Filter', blocked: 245, flagged: 89, passed: 1566, effectiveness: 95.2 },
  { name: 'Content Safety', blocked: 156, flagged: 134, passed: 1610, effectiveness: 92.8 },
  { name: 'Performance', blocked: 78, flagged: 45, passed: 1777, effectiveness: 96.5 },
  { name: 'Semantic', blocked: 92, flagged: 67, passed: 1741, effectiveness: 94.1 }
];

const violationTypes = [
  { name: 'Profanity', value: 35, color: '#ef4444' },
  { name: 'Spam', value: 28, color: '#f97316' },
  { name: 'Toxicity', value: 22, color: '#eab308' },
  { name: 'Performance', value: 15, color: '#3b82f6' }
];

const costAnalysis = [
  { date: '2024-01-15', cost: 45.20, evaluations: 1200, costPerEval: 0.0377 },
  { date: '2024-01-16', cost: 50.85, evaluations: 1350, costPerEval: 0.0377 },
  { date: '2024-01-17', cost: 41.47, evaluations: 1100, costPerEval: 0.0377 },
  { date: '2024-01-18', cost: 54.65, evaluations: 1450, costPerEval: 0.0377 },
  { date: '2024-01-19', cost: 60.32, evaluations: 1600, costPerEval: 0.0377 },
  { date: '2024-01-20', cost: 65.98, evaluations: 1750, costPerEval: 0.0377 },
  { date: '2024-01-21', cost: 71.63, evaluations: 1900, costPerEval: 0.0377 }
];

const userActivity = [
  { hour: '00:00', evaluations: 45 },
  { hour: '04:00', evaluations: 23 },
  { hour: '08:00', evaluations: 156 },
  { hour: '12:00', evaluations: 234 },
  { hour: '16:00', evaluations: 189 },
  { hour: '20:00', evaluations: 98 }
];

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('evaluations');

  const metrics = [
    {
      title: 'Total Evaluations',
      value: '12.4K',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Activity className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Policy Violations',
      value: '342',
      change: '-8.2%',
      trend: 'down' as const,
      icon: <Shield className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Avg Latency',
      value: '21ms',
      change: '-15.3%',
      trend: 'down' as const,
      icon: <Clock className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+23.1%',
      trend: 'up' as const,
      icon: <Users className="h-6 w-6 text-blue-600" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-600 mt-2">
            Monitor policy effectiveness, usage patterns, and system performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policy Performance</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Trends</CardTitle>
                <CardDescription>
                  Daily evaluation volume and violation rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evaluationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name) => [value, name === 'evaluations' ? 'Evaluations' : 'Violations']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="evaluations" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="violations" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Latency</CardTitle>
                <CardDescription>
                  Policy evaluation response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evaluationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [`${value}ms`, 'Avg Latency']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgLatency" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Real-time system performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-slate-600">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-slate-600">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Success Rate</span>
                    <span className="text-sm text-slate-600">99.8%</span>
                  </div>
                  <Progress value={99.8} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Effectiveness</CardTitle>
              <CardDescription>
                Performance metrics for each policy type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {policyEffectiveness.map((policy, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{policy.name}</h4>
                      <Badge variant="secondary">{policy.effectiveness}% effective</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Blocked: {policy.blocked}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Flagged: {policy.flagged}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Passed: {policy.passed}</span>
                      </div>
                    </div>
                    <Progress value={policy.effectiveness} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Performance Comparison</CardTitle>
              <CardDescription>
                Blocked vs flagged content by policy type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={policyEffectiveness}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="blocked" fill="#ef4444" name="Blocked" />
                  <Bar dataKey="flagged" fill="#f59e0b" name="Flagged" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Violation Types</CardTitle>
                <CardDescription>
                  Distribution of policy violations by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={violationTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {violationTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Violations</CardTitle>
                <CardDescription>
                  Latest policy violations and their severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Profanity', content: 'Inappropriate language detected', severity: 'high', time: '2 min ago' },
                    { type: 'Spam', content: 'Promotional content flagged', severity: 'medium', time: '5 min ago' },
                    { type: 'Toxicity', content: 'Toxic behavior identified', severity: 'high', time: '8 min ago' },
                    { type: 'Performance', content: 'Response quality below threshold', severity: 'low', time: '12 min ago' }
                  ].map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          violation.severity === 'high' ? 'text-red-500' :
                          violation.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{violation.type}</p>
                          <p className="text-xs text-slate-600">{violation.content}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          violation.severity === 'high' ? 'destructive' :
                          violation.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {violation.severity}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{violation.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Cost</p>
                    <p className="text-2xl font-bold text-slate-900">$1,247.83</p>
                    <p className="text-sm text-green-600 mt-1">-12.5% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Cost per Evaluation</p>
                    <p className="text-2xl font-bold text-slate-900">$0.0377</p>
                    <p className="text-sm text-blue-600 mt-1">Stable pricing</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Projected Savings</p>
                    <p className="text-2xl font-bold text-slate-900">$3,245</p>
                    <p className="text-sm text-green-600 mt-1">vs manual review</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>
                Daily costs and evaluation volume correlation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis yAxisId="cost" orientation="left" />
                  <YAxis yAxisId="evaluations" orientation="right" />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'cost' ? `$${value}` : value,
                      name === 'cost' ? 'Daily Cost' : 'Evaluations'
                    ]}
                  />
                  <Line 
                    yAxisId="cost"
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="cost"
                  />
                  <Line 
                    yAxisId="evaluations"
                    type="monotone" 
                    dataKey="evaluations" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="evaluations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Patterns</CardTitle>
              <CardDescription>
                Evaluation requests by time of day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="evaluations" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>
                  Most active users by evaluation count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Alice Johnson', email: 'alice@company.com', evaluations: 1247, role: 'Admin' },
                    { name: 'Bob Smith', email: 'bob@company.com', evaluations: 892, role: 'Manager' },
                    { name: 'Carol Davis', email: 'carol@company.com', evaluations: 634, role: 'Analyst' },
                    { name: 'David Wilson', email: 'david@company.com', evaluations: 521, role: 'Viewer' }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{user.evaluations.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active This Month</span>
                    <span className="font-bold">892</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New This Week</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retention Rate</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}