import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Play,
  Pause,
  Code,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Policy {
  id: string
  name: string
  type: 'keyword_filter' | 'performance' | 'content_safety' | 'semantic'
  status: 'active' | 'inactive' | 'draft'
  severity: 'low' | 'medium' | 'high'
  evaluations: number
  violations: number
  lastModified: string
  description: string
}

const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Content Safety Filter',
    type: 'content_safety',
    status: 'active',
    severity: 'high',
    evaluations: 45230,
    violations: 127,
    lastModified: '2024-01-20T10:30:00Z',
    description: 'ML-based toxicity and harmful content detection'
  },
  {
    id: '2',
    name: 'Keyword Blocklist',
    type: 'keyword_filter',
    status: 'active',
    severity: 'medium',
    evaluations: 89450,
    violations: 45,
    lastModified: '2024-01-19T15:45:00Z',
    description: 'Fast regex-based keyword filtering'
  },
  {
    id: '3',
    name: 'Response Quality Check',
    type: 'performance',
    status: 'active',
    severity: 'low',
    evaluations: 67890,
    violations: 23,
    lastModified: '2024-01-18T09:15:00Z',
    description: 'Response quality and performance metrics'
  },
  {
    id: '4',
    name: 'Semantic Similarity',
    type: 'semantic',
    status: 'draft',
    severity: 'medium',
    evaluations: 0,
    violations: 0,
    lastModified: '2024-01-17T14:20:00Z',
    description: 'Semantic similarity matching for content'
  }
]

const policyTypeColors = {
  keyword_filter: 'bg-blue-100 text-blue-800',
  performance: 'bg-green-100 text-green-800',
  content_safety: 'bg-red-100 text-red-800',
  semantic: 'bg-purple-100 text-purple-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800'
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
}

export function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || policy.type === selectedType
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const togglePolicyStatus = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, status: policy.status === 'active' ? 'inactive' : 'active' }
        : policy
    ))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Policy Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, configure, and manage AI governance policies
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Define a new AI governance policy with custom rules and configurations.
              </DialogDescription>
            </DialogHeader>
            <CreatePolicyForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="keyword_filter">Keyword Filter</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="content_safety">Content Safety</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policy List */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{policy.name}</h3>
                    <Badge className={policyTypeColors[policy.type]}>
                      {policy.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={statusColors[policy.status]}>
                      {policy.status}
                    </Badge>
                    <Badge className={severityColors[policy.severity]}>
                      {policy.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {policy.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{policy.evaluations.toLocaleString()} evaluations</span>
                    <span>{policy.violations} violations</span>
                    <span>Modified {new Date(policy.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePolicyStatus(policy.id)}
                  >
                    {policy.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              No policies match your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreatePolicyForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    severity: 'medium',
    enabled: true
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Policy Name</label>
          <Input
            placeholder="Enter policy name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Policy Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword_filter">Keyword Filter (Rust)</SelectItem>
              <SelectItem value="performance">Performance (Rust)</SelectItem>
              <SelectItem value="content_safety">Content Safety (Python)</SelectItem>
              <SelectItem value="semantic">Semantic (Python)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe what this policy does..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Severity Level</label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
            <span className="text-sm">{formData.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-accent hover:bg-accent/90">
          Create Policy
        </Button>
      </div>
    </div>
  )
}