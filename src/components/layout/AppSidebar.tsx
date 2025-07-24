import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Shield,
  Activity,
  FileText,
  Settings,
  Users,
  CreditCard,
  BookOpen,
  Zap,
  ScrollText,
  ChevronDown,
  LogOut
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '../ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { blink } from '../../blink/client'
import { useState, useEffect } from 'react'

const navigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/', icon: BarChart3 },
      { title: 'Real-time Monitoring', url: '/monitoring', icon: Activity },
    ]
  },
  {
    title: 'Policy Management',
    items: [
      { title: 'Policies', url: '/policies', icon: Shield },
      { title: 'Audit Logs', url: '/audit-logs', icon: ScrollText },
    ]
  },
  {
    title: 'Analytics & Insights',
    items: [
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      { title: 'API Documentation', url: '/api-docs', icon: BookOpen },
    ]
  },
  {
    title: 'Administration',
    items: [
      { title: 'Team Management', url: '/team', icon: Users },
      { title: 'Integrations', url: '/integrations', icon: Zap },
      { title: 'Billing & Usage', url: '/billing', icon: CreditCard },
      { title: 'Settings', url: '/settings', icon: Settings },
    ]
  }
]

export function AppSidebar() {
  const location = useLocation()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sidebar-foreground font-semibold text-sm">SentinelAI</span>
            <span className="text-sidebar-foreground/60 text-xs">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full justify-start"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-sidebar-foreground/60">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}