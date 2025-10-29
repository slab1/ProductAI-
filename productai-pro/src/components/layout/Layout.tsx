import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  FileText,
  Map,
  CalendarDays,
  TrendingUp,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'RICE Framework', href: '/rice', icon: BarChart3 },
    { name: 'User Stories', href: '/user-stories', icon: FileText },
    { name: 'Roadmap', href: '/roadmap', icon: Map },
    { name: 'Sprint Planning', href: '/sprint-planning', icon: CalendarDays },
    { name: 'Competitive Analysis', href: '/competitive-analysis', icon: TrendingUp },
    { name: 'OKR Alignment', href: '/okr', icon: Target },
    { name: 'Communications', href: '/communications', icon: MessageSquare },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-indigo-600">ProductAI Pro</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.subscription_tier || 'Free'} Plan</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 pt-14 lg:pt-0 z-20
            w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="h-full overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-200 px-3">
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
