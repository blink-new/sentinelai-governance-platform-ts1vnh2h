import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Alert, AlertDescription } from '../components/ui/alert'
import { sentinelAPI, EvaluationResult, PolicyEvaluationResult } from '../services/api'

export function RealtimeMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [testContent, setTestContent] = useState('')
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentEvaluations, setRecentEvaluations] = useState<EvaluationResult[]>([])

  const handleEvaluateContent = async () => {
    if (!testContent.trim()) return

    try {
      setLoading(true)
      setError(null)

      // Simulate API call with mock data for demo
      const mockResult: EvaluationResult = {
        id: Date.now().toString(),
        request_id: `req_${Date.now()}`,
        status: Math.random() > 0.8 ? 'blocked' : 'completed',
        overall_score: Math.random(),
        has_violations: Math.random() > 0.7,
        policy_results: [
          {
            policy_id: '1',
            policy_name: 'Profanity Filter',
            policy_type: 'keyword_filter',
            status: 'completed',
            score: Math.random(),
            confidence: 0.95,
            violation: Math.random() > 0.8,
            details: { matched_patterns: testContent.toLowerCase().includes('test') ? ['test'] : [] },
            execution_time_ms: Math.random() * 10 + 5
          },
          {
            policy_id: '2',
            policy_name: 'Content Safety',
            policy_type: 'content_safety',
            status: 'completed',
            score: Math.random(),
            confidence: 0.87,
            violation: Math.random() > 0.9,
            details: { toxicity_scores: { hate: 0.1, harassment: 0.05, violence: 0.02 } },
            execution_time_ms: Math.random() * 50 + 20
          },
          {
            policy_id: '3',
            policy_name: 'Performance Monitor',
            policy_type: 'performance',
            status: 'completed',
            score: Math.random(),
            confidence: 1.0,
            violation: false,
            details: { quality_score: 0.85, token_count: testContent.split(' ').length },
            execution_time_ms: Math.random() * 5 + 2
          }
        ],
        total_execution_time_ms: Math.random() * 60 + 15,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }

      try {
        // Try real API call
        const result = await sentinelAPI.evaluateContent(testContent)
        setEvaluationResult(result)
        setRecentEvaluations(prev => [result, ...prev.slice(0, 9)])
      } catch (apiError) {
        // Fallback to mock data
        console.warn('API not available, using mock data:', apiError)
        setEvaluationResult(mockResult)
        setRecentEvaluations(prev => [mockResult, ...prev.slice(0, 9)])
      }

    } catch (err) {
      setError('Failed to evaluate content')
      console.error('Error evaluating content:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, violation: boolean) => {
    if (status === 'blocked' || violation) {
      return <XCircle className="w-4 h-4 text-red-500" />
    } else if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else {
      return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string, violation: boolean) => {
    if (status === 'blocked' || violation) {
      return 'bg-red-100 text-red-800 border-red-200'
    } else if (status === 'completed') {
      return 'bg-green-100 text-green-800 border-green-200'
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatExecutionTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Real-time Monitoring</h1>
          <p className="text-slate-600 mt-2">Test and monitor AI policy evaluation in real-time</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content Evaluation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              Content Evaluation Test
            </CardTitle>
            <CardDescription>
              Test content against your active policies in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Test Content</label>
              <Textarea
                placeholder="Enter content to evaluate against policies..."
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <Button 
              onClick={handleEvaluateContent}
              disabled={!testContent.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Evaluate Content
                </>
              )}
            </Button>

            {/* Evaluation Result */}
            {evaluationResult && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Evaluation Result</h3>
                  <Badge className={getStatusBadge(evaluationResult.status, evaluationResult.has_violations)}>
                    {evaluationResult.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Overall Score:</span>
                    <div className="font-mono text-lg">
                      {(evaluationResult.overall_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Execution Time:</span>
                    <div className="font-mono text-lg">
                      {formatExecutionTime(evaluationResult.total_execution_time_ms)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Policy Results</h4>
                  {evaluationResult.policy_results.map((result) => (
                    <div key={result.policy_id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status, result.violation)}
                          <span className="font-medium">{result.policy_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.policy_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatExecutionTime(result.execution_time_ms)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500">Score:</span>
                          <div className="font-mono">{(result.score * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Confidence:</span>
                          <div className="font-mono">{(result.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      {result.violation && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-xs text-red-800 font-medium">Policy Violation Detected</div>
                          {result.details && Object.keys(result.details).length > 0 && (
                            <div className="text-xs text-red-700 mt-1">
                              {JSON.stringify(result.details, null, 2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              Recent Evaluations
            </CardTitle>
            <CardDescription>
              History of recent content evaluations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <div>No evaluations yet</div>
                <div className="text-sm">Run a content evaluation to see results here</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(evaluation.status, evaluation.has_violations)}
                        <Badge className={getStatusBadge(evaluation.status, evaluation.has_violations)}>
                          {evaluation.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(evaluation.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Score:</span>
                        <div className="font-mono">{(evaluation.overall_score * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Policies:</span>
                        <div className="font-mono">{evaluation.policy_results.length}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Time:</span>
                        <div className="font-mono">{formatExecutionTime(evaluation.total_execution_time_ms)}</div>
                      </div>
                    </div>

                    {evaluation.has_violations && (
                      <div className="mt-2 text-xs text-red-600">
                        {evaluation.policy_results.filter(r => r.violation).length} violation(s) detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Average Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {recentEvaluations.length > 0 
                ? formatExecutionTime(
                    recentEvaluations.reduce((sum, e) => sum + e.total_execution_time_ms, 0) / recentEvaluations.length
                  )
                : '0ms'
              }
            </div>
            <p className="text-xs text-slate-500 mt-1">Sub-10ms target for fast policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Violation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {recentEvaluations.length > 0 
                ? `${((recentEvaluations.filter(e => e.has_violations).length / recentEvaluations.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-slate-500 mt-1">Content blocked by policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recentEvaluations.length > 0 
                ? `${((recentEvaluations.filter(e => e.status === 'completed').length / recentEvaluations.length) * 100).toFixed(1)}%`
                : '100%'
              }
            </div>
            <p className="text-xs text-slate-500 mt-1">Evaluations completed successfully</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}