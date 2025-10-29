import { useState, useEffect } from 'react'
import { supabase, Feature, Project } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Save, Trash2, BarChart, Sparkles } from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RICEPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reach_score: 0,
    impact_score: 1,
    confidence_score: 50,
    effort_score: 1
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadFeatures()
    }
  }, [selectedProjectId])

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (data) setProjects(data)
  }

  const loadFeatures = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('features')
      .select('*')
      .eq('project_id', selectedProjectId)
      .order('rice_score', { ascending: false })

    if (data) setFeatures(data)
    setLoading(false)
  }

  const calculateRICE = async () => {
    if (!selectedProjectId || features.length === 0) return

    const featuresToCalculate = features.map(f => ({
      id: f.id,
      reach: f.reach_score || 0,
      impact: f.impact_score || 0,
      confidence: f.confidence_score || 0,
      effort: f.effort_score || 1
    }))

    try {
      const { data, error } = await supabase.functions.invoke('rice-calculator', {
        body: { features: featuresToCalculate }
      })

      if (error) throw error

      const calculatedFeatures = data?.data || data
      
      // Update features with calculated scores
      for (const calc of calculatedFeatures) {
        await supabase
          .from('features')
          .update({
            rice_score: calc.riceScore,
            priority_rank: calc.priorityRank
          })
          .eq('id', calc.id)
      }

      loadFeatures()
    } catch (error) {
      console.error('Error calculating RICE:', error)
      alert('Failed to calculate RICE scores. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !user) return

    try {
      const { error } = await supabase.from('features').insert({
        project_id: selectedProjectId,
        ...formData,
        created_by: user.id,
        status: 'backlog'
      })

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        reach_score: 0,
        impact_score: 1,
        confidence_score: 50,
        effort_score: 1
      })
      setShowForm(false)
      loadFeatures()
    } catch (error) {
      console.error('Error creating feature:', error)
      alert('Failed to create feature')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      await supabase.from('features').delete().eq('id', id)
      loadFeatures()
    } catch (error) {
      console.error('Error deleting feature:', error)
    }
  }

  const chartData = features.map(f => ({
    name: f.title.substring(0, 20) + (f.title.length > 20 ? '...' : ''),
    rice: f.rice_score || 0,
    reach: f.reach_score || 0,
    impact: f.impact_score || 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RICE Framework</h1>
          <p className="mt-2 text-gray-600">Prioritize features with data-driven scoring</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Feature
        </button>
      </div>

      {/* Project Selector */}
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

      {/* Add Feature Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add New Feature</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reach</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.reach_score}
                  onChange={(e) => setFormData({ ...formData, reach_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Users affected"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact (1-3)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="3"
                  value={formData.impact_score}
                  onChange={(e) => setFormData({ ...formData, impact_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confidence (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.confidence_score}
                  onChange={(e) => setFormData({ ...formData, confidence_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effort (weeks)</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={formData.effort_score}
                  onChange={(e) => setFormData({ ...formData, effort_score: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Feature
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calculate Button */}
      {selectedProjectId && features.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={calculateRICE}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Calculate RICE Scores
          </button>
        </div>
      )}

      {/* Chart Visualization */}
      {features.length > 0 && chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">RICE Score Visualization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rice" fill="#4f46e5" name="RICE Score" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Features Table */}
      {selectedProjectId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effort</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RICE Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : features.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No features yet. Add your first feature to get started!</td>
                </tr>
              ) : (
                features.map((feature, index) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{feature.title}</p>
                        {feature.description && (
                          <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{feature.reach_score || 0}</td>
                    <td className="px-6 py-4 text-gray-900">{feature.impact_score || 0}</td>
                    <td className="px-6 py-4 text-gray-900">{feature.confidence_score || 0}%</td>
                    <td className="px-6 py-4 text-gray-900">{feature.effort_score || 0}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                        {feature.rice_score?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(feature.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
