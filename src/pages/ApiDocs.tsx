import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BookOpen, Code } from 'lucide-react'

export function ApiDocs() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Complete API reference and integration guides
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            API Reference
          </CardTitle>
          <CardDescription>
            Interactive API documentation with examples and SDKs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Interactive API documentation with OpenAPI/Swagger integration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}