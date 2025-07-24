import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Power, PowerOff, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Switch } from '../components/ui/switch'
import { Alert, AlertDescription } from '../components/ui/alert'
import { sentinelAPI, Policy, PolicyCreate, mockPolicies } from '../services/api'

export function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPolicy, setNewPolicy] = useState<PolicyCreate>({
    name: '',
    description: '',
    type: 'keyword_filter',
    config: {},
    tags: []
  })

  const loadPolicies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to load from API, fallback to mock data
      try {
        const data = await sentinelAPI.listPolicies()
        setPolicies(data)
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        setPolicies(mockPolicies)
      }
    } catch (err) {
      setError('Failed to load policies')
      console.error('Error loading policies:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load policies on component mount
  useEffect(() => {
    loadPolicies()
  }, [])

  const handleCreatePolicy = async () => {
    try {
      setError(null)
      
      // Set default config based on policy type
      const defaultConfigs = {
        keyword_filter: {
          patterns: ['\\b(example)\\b'],
          case_sensitive: false,
          whole_words_only: true
        },
        performance: {
          max_response_time_ms: 5000,
          min_quality_score: 0.7,
          max_tokens: 4000
        },
        content_safety: {
          toxicity_threshold: 0.8,
          categories: ['hate', 'harassment', 'violence', 'sexual'],
          model_name: 'unitary/toxic-bert'
        },
        semantic: {
          similarity_threshold: 0.85,
          reference_texts: [],
          embedding_model: 'sentence-transformers/all-MiniLM-L6-v2'
        }
      }

      const policyWithConfig = {
        ...newPolicy,
        config: defaultConfigs[newPolicy.type]
      }

      try {
        const createdPolicy = await sentinelAPI.createPolicy(policyWithConfig)
        setPolicies(prev => [createdPolicy, ...prev])
      } catch (apiError) {
        // Fallback: add to local state with mock ID
        const mockPolicy: Policy = {
          id: Date.now().toString(),
          ...policyWithConfig,
          status: 'draft',
          organization_id: 'org_123',
          created_by: 'user_123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1
        }
        setPolicies(prev => [mockPolicy, ...prev])
      }

      setIsCreateDialogOpen(false)
      setNewPolicy({
        name: '',
        description: '',
        type: 'keyword_filter',
        config: {},
        tags: []
      })
    } catch (err) {
      setError('Failed to create policy')
      console.error('Error creating policy:', err)
    }
  }

  const handleToggleStatus = async (policyId: string) => {
    try {
      setError(null)
      
      try {
        const updatedPolicy = await sentinelAPI.togglePolicyStatus(policyId)
        setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p))
      } catch (apiError) {
        // Fallback: toggle locally
        setPolicies(prev => prev.map(p => 
          p.id === policyId 
            ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' as const }
            : p
        ))
      }
    } catch (err) {
      setError('Failed to toggle policy status')
      console.error('Error toggling policy:', err)
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    try {
      setError(null)
      
      try {
        await sentinelAPI.deletePolicy(policyId)
      } catch (apiError) {
        console.warn('API delete failed, removing locally:', apiError)
      }
      
      setPolicies(prev => prev.filter(p => p.id !== policyId))
    } catch (err) {
      setError('Failed to delete policy')
      console.error('Error deleting policy:', err)
    }
  }

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter
    const matchesType = typeFilter === 'all' || policy.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      keyword_filter: 'bg-blue-100 text-blue-800 border-blue-200',
      performance: 'bg-purple-100 text-purple-800 border-purple-200',
      content_safety: 'bg-red-100 text-red-800 border-red-200',
      semantic: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return variants[type as keyof typeof variants] || variants.keyword_filter
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Policy Management</h1>
          <p className="text-slate-600 mt-2">Create and manage AI governance policies</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Define a new AI governance policy for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter policy name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this policy does"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Policy Type</Label>
                <Select
                  value={newPolicy.type}
                  onValueChange={(value: any) => setNewPolicy(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword_filter">Keyword Filter</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="content_safety">Content Safety</SelectItem>
                    <SelectItem value="semantic">Semantic Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePolicy}
                disabled={!newPolicy.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Policies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{policy.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusBadge(policy.status)}>
                      {policy.status}
                    </Badge>
                    <Badge className={getTypeBadge(policy.type)}>
                      {policy.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(policy.id)}>
                      {policy.status === 'active' ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-600 mb-4">
                {policy.description}
              </CardDescription>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Created: {new Date(policy.created_at).toLocaleDateString()}</div>
                <div>Updated: {new Date(policy.updated_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No policies found</div>
          <div className="text-slate-500 text-sm">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first policy to get started'
            }
          </div>
        </div>
      )}
    </div>
  )
}