import { useState, useEffect } from 'react'
import { supabase, Project, Competitor } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, TrendingUp, Sparkles, AlertCircle, ExternalLink } from 'lucide-react'

export default function CompetitiveAnalysisPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    market_position: '',
    pricing_model: '',
    strengths: '',
    weaknesses: '',
    features: ''
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadCompetitors()
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

  const loadCompetitors = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('competitors')
      .select('*')
      .eq('project_id', selectedProjectId)
      .order('created_at', { ascending: false })

    if (data) setCompetitors(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !user) return

    try {
      const { error } = await supabase.from('competitors').insert({
        project_id: selectedProjectId,
        name: formData.name,
        website: formData.website,
        description: formData.description,
        market_position: formData.market_position,
        pricing_model: formData.pricing_model,
        strengths: formData.strengths.split('\n').filter(s => s.trim()),
        weaknesses: formData.weaknesses.split('\n').filter(s => s.trim()),
        features: formData.features.split('\n').filter(s => s.trim()),
        added_by: user.id
      })

      if (error) throw error

      setFormData({
        name: '', website: '', description: '', market_position: '',
        pricing_model: '', strengths: '', weaknesses: '', features: ''
      })
      setShowForm(false)
      loadCompetitors()
    } catch (error) {
      console.error('Error adding competitor:', error)
      alert('Failed to add competitor')
    }
  }

  const runAnalysis = async () => {
    if (!selectedProjectId || competitors.length === 0) {
      alert('Please add competitors first')
      return
    }

    setAnalyzing(true)
    try {
      const { data: features } = await supabase
        .from('features')
        .select('title, description')
        .eq('project_id', selectedProjectId)

      const { data, error } = await supabase.functions.invoke('ai-competitive-analysis', {
        body: {
          competitors: competitors.map(c => ({
            name: c.name, website: c.website, description: c.description,
            marketPosition: c.market_position, pricingModel: c.pricing_model,
            strengths: c.strengths, weaknesses: c.weaknesses, features: c.features
          })),
          productFeatures: features || [],
          analysisType: 'comprehensive'
        }
      })

      if (error) throw error

      const analysisData = data?.data || data
      setAnalysis(analysisData)

      await supabase.from('competitive_analysis').insert({
        project_id: selectedProjectId, analysis_type: 'comprehensive',
        title: 'AI-Generated Competitive Analysis', insights: analysisData,
        ai_generated: true, created_by: user?.id
      })
    } catch (error) {
      console.error('Error running analysis:', error)
      alert('Failed to run competitive analysis. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitive Analysis Dashboard</h1>
          <p className="mt-2 text-gray-600">Market intelligence and gap analysis</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Competitor
        </button>
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

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add Competitor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Name</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} rows={2}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strengths (one per line)</label>
                <textarea value={formData.strengths} rows={3}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Strong brand&#10;Advanced features&#10;Large user base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weaknesses (one per line)</label>
                <textarea value={formData.weaknesses} rows={3}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="High pricing&#10;Complex UI" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Features (one per line)</label>
                <textarea value={formData.features} rows={3}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Feature A&#10;Feature B" />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Add Competitor
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProjectId && competitors.length > 0 && (
        <div className="flex justify-center">
          <button onClick={runAnalysis} disabled={analyzing}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50">
            <Sparkles className="w-5 h-5 mr-2" />
            {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      )}

      {analysis && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">AI-Generated Analysis</h2>
          {analysis.marketPositioning && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Positioning</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2"><strong>Our Position:</strong> {analysis.marketPositioning.ourPosition}</p>
              </div>
            </div>
          )}
          {analysis.strategicRecommendations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Recommendations</h3>
              <div className="space-y-3">
                {analysis.strategicRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-indigo-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{rec.recommendation}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedProjectId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Competitors ({competitors.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : competitors.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No competitors added yet. Add your first competitor to start analysis.
              </div>
            ) : (
              competitors.map(comp => (
                <div key={comp.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{comp.name}</h3>
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visit
                          </a>
                        )}
                      </div>
                      {comp.description && <p className="text-sm text-gray-600 mb-3">{comp.description}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
