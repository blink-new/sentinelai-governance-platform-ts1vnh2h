import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Users, UserPlus } from 'lucide-react'

export function TeamManagement() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage team members, roles, and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team & Permissions
          </CardTitle>
          <CardDescription>
            Role-based access control and team member management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Team management with RBAC and SSO integration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}