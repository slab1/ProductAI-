import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Project } from '@/lib/supabase'
import {
  BarChart3,
  FileText,
  Map,
  CalendarDays,
  TrendingUp,
  Target,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    features: 0,
    userStories: 0,
    activeOkrs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      if (projectsData) {
        setProjects(projectsData)
        setStats(prev => ({ ...prev, activeProjects: projectsData.length }))
      }

      // Load feature count
      const { count: featuresCount } = await supabase
        .from('features')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'completed')

      if (featuresCount !== null) {
        setStats(prev => ({ ...prev, features: featuresCount }))
      }

      // Load user stories count
      const { count: storiesCount } = await supabase
        .from('user_stories')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'completed')

      if (storiesCount !== null) {
        setStats(prev => ({ ...prev, userStories: storiesCount }))
      }

      // Load OKRs count
      const { count: okrsCount } = await supabase
        .from('okrs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (okrsCount !== null) {
        setStats(prev => ({ ...prev, activeOkrs: okrsCount }))
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      name: 'RICE Framework',
      description: 'Prioritize features with data-driven scoring',
      icon: BarChart3,
      href: '/rice',
      color: 'bg-blue-500'
    },
    {
      name: 'User Stories',
      description: 'AI-generated user stories from requirements',
      icon: FileText,
      href: '/user-stories',
      color: 'bg-green-500'
    },
    {
      name: 'Roadmap Intelligence',
      description: 'Strategic roadmap planning with AI insights',
      icon: Map,
      href: '/roadmap',
      color: 'bg-purple-500'
    },
    {
      name: 'Sprint Planning',
      description: 'Intelligent task breakdown and estimation',
      icon: CalendarDays,
      href: '/sprint-planning',
      color: 'bg-orange-500'
    },
    {
      name: 'Competitive Analysis',
      description: 'Market intelligence and gap analysis',
      icon: TrendingUp,
      href: '/competitive-analysis',
      color: 'bg-pink-500'
    },
    {
      name: 'OKR Alignment',
      description: 'Align objectives across your organization',
      icon: Target,
      href: '/okr',
      color: 'bg-red-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your product management today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeProjects}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Features in Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.features}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">User Stories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.userStories}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Map className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active OKRs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeOkrs}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Target className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.name}
                to={feature.href}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-indigo-600 group-hover:text-indigo-700">
                  <span className="text-sm font-medium">Get started</span>
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">No projects yet. Create your first project to get started!</p>
            <Link
              to="/projects"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
