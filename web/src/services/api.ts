import { blink } from '../blink/client'

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.sentinelai.com' 
  : 'http://localhost:8000'

// Types
export interface Policy {
  id: string
  name: string
  description: string
  type: 'keyword_filter' | 'performance' | 'content_safety' | 'semantic'
  status: 'active' | 'inactive' | 'draft'
  config: Record<string, any>
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
  version: number
  tags: string[]
}

export interface PolicyCreate {
  name: string
  description?: string
  type: 'keyword_filter' | 'performance' | 'content_safety' | 'semantic'
  config: Record<string, any>
  tags?: string[]
}

export interface PolicyUpdate {
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'draft'
  config?: Record<string, any>
  tags?: string[]
}

export interface EvaluationResult {
  id: string
  request_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked'
  overall_score: number
  has_violations: boolean
  policy_results: PolicyEvaluationResult[]
  total_execution_time_ms: number
  created_at: string
  completed_at?: string
}

export interface PolicyEvaluationResult {
  policy_id: string
  policy_name: string
  policy_type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked'
  score: number
  confidence: number
  violation: boolean
  details: Record<string, any>
  execution_time_ms: number
  error_message?: string
}

export interface EvaluationStats {
  total_evaluations: number
  successful_evaluations: number
  failed_evaluations: number
  blocked_evaluations: number
  average_execution_time_ms: number
  violation_rate: number
  period_start: string
  period_end: string
}

// API Client class
class SentinelAIAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Use Blink's secure API proxy for backend calls
      const response = await blink.data.fetch({
        url: `${API_BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer {{sentinelai_api_token}}`, // Secret substitution
          ...options.headers,
        },
        body: options.body ? JSON.parse(options.body as string) : undefined,
      })

      if (response.status >= 400) {
        throw new Error(`API Error: ${response.status} - ${response.body?.error || 'Unknown error'}`)
      }

      return response.body as T
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Policy Management
  async createPolicy(policy: PolicyCreate): Promise<Policy> {
    return this.makeRequest<Policy>('/v1/policies/', {
      method: 'POST',
      body: JSON.stringify(policy),
    })
  }

  async listPolicies(params?: {
    status?: string
    policy_type?: string
    skip?: number
    limit?: number
  }): Promise<Policy[]> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.policy_type) searchParams.append('policy_type', params.policy_type)
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.makeRequest<Policy[]>(`/v1/policies/${query}`)
  }

  async getPolicy(policyId: string): Promise<Policy> {
    return this.makeRequest<Policy>(`/v1/policies/${policyId}`)
  }

  async updatePolicy(policyId: string, update: PolicyUpdate): Promise<Policy> {
    return this.makeRequest<Policy>(`/v1/policies/${policyId}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    })
  }

  async deletePolicy(policyId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/v1/policies/${policyId}`, {
      method: 'DELETE',
    })
  }

  async togglePolicyStatus(policyId: string): Promise<Policy> {
    return this.makeRequest<Policy>(`/v1/policies/${policyId}/toggle`, {
      method: 'POST',
    })
  }

  // Content Evaluation
  async evaluateContent(
    content: string,
    policyIds?: string[]
  ): Promise<EvaluationResult> {
    return this.makeRequest<EvaluationResult>('/v1/evaluation/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        content,
        policy_ids: policyIds || [],
      }),
    })
  }

  async evaluateBatch(
    requests: Array<{ content: string; policy_ids?: string[] }>
  ): Promise<EvaluationResult[]> {
    return this.makeRequest<EvaluationResult[]>('/v1/evaluation/batch', {
      method: 'POST',
      body: JSON.stringify(requests),
    })
  }

  // Chat Completions (LLM Proxy with Policy Enforcement)
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string
      max_tokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<any> {
    return this.makeRequest<any>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        ...options,
      }),
    })
  }

  // Analytics and Monitoring
  async getEvaluationStats(
    startDate: string,
    endDate: string
  ): Promise<EvaluationStats> {
    return this.makeRequest<EvaluationStats>(
      `/v1/analytics/stats?start_date=${startDate}&end_date=${endDate}`
    )
  }

  async getSystemHealth(): Promise<{
    status: string
    version: string
    features: Record<string, boolean>
  }> {
    return this.makeRequest<{
      status: string
      version: string
      features: Record<string, boolean>
    }>('/v1/status')
  }
}

// Export singleton instance
export const sentinelAPI = new SentinelAIAPI()

// Mock data for development (when backend is not available)
export const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Profanity Filter',
    description: 'Blocks profanity and inappropriate language',
    type: 'keyword_filter',
    status: 'active',
    config: {
      patterns: ['\\b(badword1|badword2)\\b'],
      case_sensitive: false,
      whole_words_only: true,
    },
    organization_id: 'org_123',
    created_by: 'user_123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    tags: ['content', 'safety'],
  },
  {
    id: '2',
    name: 'Content Safety',
    description: 'ML-based toxicity and harmful content detection',
    type: 'content_safety',
    status: 'active',
    config: {
      toxicity_threshold: 0.8,
      categories: ['hate', 'harassment', 'violence', 'sexual'],
      model_name: 'unitary/toxic-bert',
    },
    organization_id: 'org_123',
    created_by: 'user_123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    tags: ['ml', 'safety'],
  },
  {
    id: '3',
    name: 'Performance Monitor',
    description: 'Monitors response quality and performance metrics',
    type: 'performance',
    status: 'active',
    config: {
      max_response_time_ms: 5000,
      min_quality_score: 0.7,
      max_tokens: 4000,
    },
    organization_id: 'org_123',
    created_by: 'user_123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    version: 1,
    tags: ['performance', 'quality'],
  },
]

export const mockEvaluationStats: EvaluationStats = {
  total_evaluations: 15420,
  successful_evaluations: 14890,
  failed_evaluations: 125,
  blocked_evaluations: 405,
  average_execution_time_ms: 23.5,
  violation_rate: 0.026,
  period_start: '2024-01-01T00:00:00Z',
  period_end: '2024-01-31T23:59:59Z',
}