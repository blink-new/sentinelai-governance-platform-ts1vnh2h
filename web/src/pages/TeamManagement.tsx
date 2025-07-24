import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Mail, 
  MoreHorizontal,
  Crown,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  evaluations: number;
  joinedAt: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'admin',
    status: 'active',
    lastActive: '2 minutes ago',
    evaluations: 1247,
    joinedAt: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    role: 'manager',
    status: 'active',
    lastActive: '1 hour ago',
    evaluations: 892,
    joinedAt: '2024-01-16'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@company.com',
    role: 'analyst',
    status: 'active',
    lastActive: '3 hours ago',
    evaluations: 634,
    joinedAt: '2024-01-18'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@company.com',
    role: 'viewer',
    status: 'inactive',
    lastActive: '2 days ago',
    evaluations: 521,
    joinedAt: '2024-01-20'
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma@company.com',
    role: 'analyst',
    status: 'pending',
    lastActive: 'Never',
    evaluations: 0,
    joinedAt: '2024-01-21'
  }
];

const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: [
      'Manage users and roles',
      'Create and edit policies',
      'View all analytics',
      'Configure system settings',
      'Access audit logs',
      'Manage billing'
    ],
    userCount: 1
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage policies and view team analytics',
    permissions: [
      'Create and edit policies',
      'View team analytics',
      'Manage team members',
      'Access audit logs',
      'Configure integrations'
    ],
    userCount: 1
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'View analytics and create policies',
    permissions: [
      'View analytics',
      'Create policies',
      'Run evaluations',
      'Export reports'
    ],
    userCount: 2
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboards',
    permissions: [
      'View dashboard',
      'View policies',
      'Run evaluations'
    ],
    userCount: 1
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'manager': return 'bg-blue-100 text-blue-800';
    case 'analyst': return 'bg-green-100 text-green-800';
    case 'viewer': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
    case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default: return <XCircle className="h-4 w-4 text-gray-500" />;
  }
};

export function TeamManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const handleInviteUser = () => {
    // Mock invite functionality
    const newUser: User = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as any,
      status: 'pending',
      lastActive: 'Never',
      evaluations: 0,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setInviteEmail('');
    setInviteRole('viewer');
    setIsInviteDialogOpen(false);
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as any }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-600 mt-2">
            Manage users, roles, and permissions for your organization
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to join your SentinelAI organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={!inviteEmail}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {users.filter(u => u.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {users.filter(u => u.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Admins</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage user access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Evaluations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-slate-600">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {user.lastActive}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.evaluations.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.status === 'active'}
                            onCheckedChange={() => handleStatusToggle(user.id)}
                            disabled={user.status === 'pending'}
                          />
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className={getRoleColor(role.id)}>
                          {role.name}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                        </span>
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Permissions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of permissions across all roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Permission</th>
                      <th className="text-center p-3">Admin</th>
                      <th className="text-center p-3">Manager</th>
                      <th className="text-center p-3">Analyst</th>
                      <th className="text-center p-3">Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'Manage users and roles',
                      'Create and edit policies',
                      'View all analytics',
                      'Configure system settings',
                      'Access audit logs',
                      'Manage billing',
                      'View team analytics',
                      'Manage team members',
                      'Configure integrations',
                      'View analytics',
                      'Run evaluations',
                      'Export reports',
                      'View dashboard',
                      'View policies'
                    ].map((permission, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium text-sm">{permission}</td>
                        <td className="text-center p-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </td>
                        <td className="text-center p-3">
                          {['Create and edit policies', 'View team analytics', 'Manage team members', 'Access audit logs', 'Configure integrations'].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-3">
                          {['View analytics', 'Create policies', 'Run evaluations', 'Export reports'].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-3">
                          {['View dashboard', 'View policies', 'Run evaluations'].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure team-wide settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Require Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600">
                    Enforce 2FA for all team members
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-approve Invitations</h4>
                  <p className="text-sm text-slate-600">
                    Automatically approve invitations from your domain
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Timeout</h4>
                  <p className="text-sm text-slate-600">
                    Automatically log out inactive users
                  </p>
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-slate-600">
                    Send email alerts for policy violations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SSO Configuration</CardTitle>
              <CardDescription>
                Configure Single Sign-On for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">SAML 2.0</h4>
                      <p className="text-xs text-slate-600">Enterprise SSO</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">OAuth 2.0</h4>
                      <p className="text-xs text-slate-600">Google, GitHub</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Key className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">LDAP</h4>
                      <p className="text-xs text-slate-600">Active Directory</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Configure
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}