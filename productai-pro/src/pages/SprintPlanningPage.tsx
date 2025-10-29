import { useState, useEffect } from 'react'
import { supabase, Project } from '@/lib/supabase'
import { CalendarDays } from 'lucide-react'

export default function SprintPlanningPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
      if (data) setProjects(data)
    }
    loadProjects()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sprint Planning Assistant</h1>
        <p className="mt-2 text-gray-600">Intelligent task breakdown and estimation</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Choose a project...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
        <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Sprint planning feature with AI-powered task breakdown</p>
      </div>
    </div>
  )
}
