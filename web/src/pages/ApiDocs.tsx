import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Play, Code, Book, Zap } from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: string;
  responseExample?: string;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/v1/chat/completions',
    description: 'OpenAI-compatible endpoint with real-time policy enforcement',
    requestBody: `{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello, world!"}
  ],
  "stream": false
}`,
    responseExample: `{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  },
  "sentinelai": {
    "evaluation_time_ms": 15,
    "policies_evaluated": 3,
    "violations": []
  }
}`
  },
  {
    method: 'POST',
    path: '/v1/evaluation/evaluate',
    description: 'Evaluate content against specific policies',
    requestBody: `{
  "content": "This is test content",
  "policy_ids": ["pol_001", "pol_002"],
  "metadata": {
    "user_id": "user_123",
    "session_id": "sess_456"
  }
}`,
    responseExample: `{
  "evaluation_id": "eval_789",
  "content": "This is test content",
  "timestamp": "2024-01-20T10:30:00Z",
  "total_time_ms": 25,
  "results": [
    {
      "policy_id": "pol_001",
      "policy_name": "Keyword Filter",
      "status": "passed",
      "score": 1.0,
      "evaluation_time_ms": 2
    },
    {
      "policy_id": "pol_002",
      "policy_name": "Content Safety",
      "status": "passed",
      "score": 0.95,
      "evaluation_time_ms": 23
    }
  ],
  "overall_status": "passed"
}`
  },
  {
    method: 'GET',
    path: '/v1/policies',
    description: 'List all policies with filtering and pagination',
    parameters: [
      { name: 'type', type: 'string', required: false, description: 'Filter by policy type' },
      { name: 'status', type: 'string', required: false, description: 'Filter by policy status' },
      { name: 'limit', type: 'number', required: false, description: 'Number of results per page' },
      { name: 'offset', type: 'number', required: false, description: 'Pagination offset' }
    ],
    responseExample: `{
  "policies": [
    {
      "id": "pol_001",
      "name": "Profanity Filter",
      "type": "keyword_filter",
      "status": "active",
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-20T10:30:00Z",
      "config": {
        "patterns": ["\\\\b(spam|scam)\\\\b"],
        "case_sensitive": false,
        "severity": "high"
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}`
  },
  {
    method: 'POST',
    path: '/v1/policies',
    description: 'Create a new policy',
    requestBody: `{
  "name": "Custom Keyword Filter",
  "type": "keyword_filter",
  "description": "Filters inappropriate content",
  "config": {
    "patterns": ["\\\\b(inappropriate|spam)\\\\b"],
    "case_sensitive": false,
    "severity": "medium",
    "action": "flag"
  },
  "status": "draft"
}`,
    responseExample: `{
  "id": "pol_002",
  "name": "Custom Keyword Filter",
  "type": "keyword_filter",
  "status": "draft",
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T10:30:00Z"
}`
  }
];

const cliExamples = [
  {
    title: 'Authentication',
    commands: [
      'sentinelai auth login --api-key sk_your_api_key',
      'sentinelai auth test',
      'sentinelai auth logout'
    ]
  },
  {
    title: 'Policy Management',
    commands: [
      'sentinelai policy list --format table',
      'sentinelai policy create --name "Test Policy" --type keyword_filter',
      'sentinelai policy get pol_001 --format yaml',
      'sentinelai policy update pol_001 --status active',
      'sentinelai policy delete pol_001 --force'
    ]
  },
  {
    title: 'Content Evaluation',
    commands: [
      'sentinelai evaluate --content "Test message" --format table',
      'sentinelai evaluate --content "Test" --policy-id pol_001 --verbose',
      'sentinelai evaluate --file input.txt --format json'
    ]
  },
  {
    title: 'Real-time Enforcement',
    commands: [
      'sentinelai guard --port 8080 --policies pol_001,pol_002',
      'sentinelai guard --config guard.yaml --verbose',
      'sentinelai guard --proxy openai --model gpt-4'
    ]
  }
];

const sdkExamples = {
  python: `# Install SentinelAI Python SDK
pip install sentinelai

# Initialize client
from sentinelai import SentinelAI

client = SentinelAI(api_key="sk_your_api_key")

# Evaluate content
result = client.evaluate(
    content="Hello, world!",
    policy_ids=["pol_001", "pol_002"]
)

# Create policy
policy = client.policies.create(
    name="Python Policy",
    type="keyword_filter",
    config={
        "patterns": ["spam", "scam"],
        "case_sensitive": False
    }
)

# Real-time chat with governance
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)`,
  nodejs: `// Install SentinelAI Node.js SDK
// npm install sentinelai

const { SentinelAI } = require('sentinelai');

const client = new SentinelAI({
  apiKey: 'sk_your_api_key'
});

// Evaluate content
const result = await client.evaluate({
  content: 'Hello, world!',
  policyIds: ['pol_001', 'pol_002']
});

// Create policy
const policy = await client.policies.create({
  name: 'Node.js Policy',
  type: 'keyword_filter',
  config: {
    patterns: ['spam', 'scam'],
    caseSensitive: false
  }
});

// Real-time chat with governance
const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});`,
  go: `// Install SentinelAI Go SDK
// go get github.com/sentinelai/go-sdk

package main

import (
    "context"
    "github.com/sentinelai/go-sdk"
)

func main() {
    client := sentinelai.NewClient("sk_your_api_key")
    
    // Evaluate content
    result, err := client.Evaluate(context.Background(), &sentinelai.EvaluateRequest{
        Content: "Hello, world!",
        PolicyIDs: []string{"pol_001", "pol_002"},
    })
    
    // Create policy
    policy, err := client.Policies.Create(context.Background(), &sentinelai.CreatePolicyRequest{
        Name: "Go Policy",
        Type: "keyword_filter",
        Config: map[string]interface{}{
            "patterns": []string{"spam", "scam"},
            "case_sensitive": false,
        },
    })
    
    // Real-time chat with governance
    response, err := client.Chat.Completions.Create(context.Background(), &sentinelai.ChatRequest{
        Model: "gpt-4",
        Messages: []sentinelai.Message{
            {Role: "user", Content: "Hello!"},
        },
    })
}`
};

export function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testEndpoint = async () => {
    // Mock API test for demo
    setTestResult(`{
  "status": "success",
  "message": "API endpoint tested successfully",
  "timestamp": "${new Date().toISOString()}"
}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
        <p className="text-slate-600 mt-2">
          Complete API reference and SDK documentation for SentinelAI
        </p>
      </div>

      <Tabs defaultValue="rest-api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rest-api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            REST API
          </TabsTrigger>
          <TabsTrigger value="cli" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            CLI
          </TabsTrigger>
          <TabsTrigger value="sdks" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            SDKs
          </TabsTrigger>
          <TabsTrigger value="playground" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Playground
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rest-api" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
                <CardDescription>
                  All API requests should be made to the following base URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm">
                  https://api.sentinelai.dev/v1
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  API requests require authentication using API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="font-mono text-sm">Authorization: Bearer sk_your_api_key</p>
                </div>
                <p className="text-sm text-slate-600">
                  Get your API key from the Settings page in your dashboard.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">API Endpoints</h3>
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedEndpoint(endpoint)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <Badge variant={
                          endpoint.method === 'GET' ? 'secondary' :
                          endpoint.method === 'POST' ? 'default' :
                          endpoint.method === 'PUT' ? 'outline' : 'destructive'
                        }>
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {selectedEndpoint && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Badge variant={
                      selectedEndpoint.method === 'GET' ? 'secondary' :
                      selectedEndpoint.method === 'POST' ? 'default' :
                      selectedEndpoint.method === 'PUT' ? 'outline' : 'destructive'
                    }>
                      {selectedEndpoint.method}
                    </Badge>
                    <span className="font-mono">{selectedEndpoint.path}</span>
                  </CardTitle>
                  <CardDescription>{selectedEndpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedEndpoint.parameters && (
                    <div>
                      <h4 className="font-semibold mb-3">Parameters</h4>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <code className="font-mono text-sm bg-white px-2 py-1 rounded">
                              {param.name}
                            </code>
                            <Badge variant="outline">{param.type}</Badge>
                            {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            <span className="text-sm text-slate-600">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.requestBody && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Request Body</h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedEndpoint.requestBody!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                        {selectedEndpoint.requestBody}
                      </pre>
                    </div>
                  )}

                  {selectedEndpoint.responseExample && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Response Example</h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedEndpoint.responseExample!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                        {selectedEndpoint.responseExample}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cli" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CLI Installation</CardTitle>
              <CardDescription>
                Install the SentinelAI CLI for high-performance policy evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre className="text-sm">
{`# Install from source
git clone https://github.com/sentinelai/core.git
cd core
cargo install --path .

# Or download binary
curl -L https://github.com/sentinelai/core/releases/latest/download/sentinelai-linux -o sentinelai
chmod +x sentinelai
sudo mv sentinelai /usr/local/bin/`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {cliExamples.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.commands.map((command, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 text-slate-100 p-3 rounded-lg">
                      <code className="text-sm">{command}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(command)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          <Tabs defaultValue="python" className="space-y-4">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
            </TabsList>

            {Object.entries(sdkExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{lang} SDK</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {code}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="playground" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Playground</CardTitle>
              <CardDescription>
                Test API endpoints directly from the documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Content</label>
                  <Textarea
                    placeholder="Enter content to evaluate..."
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Response</label>
                  <Textarea
                    placeholder="API response will appear here..."
                    value={testResult}
                    readOnly
                    rows={4}
                    className="bg-slate-50"
                  />
                </div>
              </div>
              <Button onClick={testEndpoint} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Test API Endpoint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}