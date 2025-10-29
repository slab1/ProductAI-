import { useState, useEffect } from 'react'
import { supabase, UserStory, Project } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Sparkles, FileText } from 'lucide-react'

export default function UserStoriesPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [stories, setStories] = useState<UserStory[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [requirement, setRequirement] = useState('')
  const [featureTitle, setFeatureTitle] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadStories()
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

  const loadStories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_stories')
      .select('*')
      .eq('project_id', selectedProjectId)
      .order('created_at', { ascending: false })

    if (data) setStories(data)
    setLoading(false)
  }

  const generateStory = async () => {
    if (!selectedProjectId || !requirement || !user) return

    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai-user-story-generator', {
        body: {
          requirement,
          featureTitle,
          projectContext: projects.find(p => p.id === selectedProjectId)?.description || ''
        }
      })

      if (error) throw error

      const storyData = data?.data || data

      // Insert the generated story
      await supabase.from('user_stories').insert({
        project_id: selectedProjectId,
        title: storyData.title,
        user_role: storyData.userRole,
        user_goal: storyData.userGoal,
        user_benefit: storyData.userBenefit,
        acceptance_criteria: storyData.acceptanceCriteria,
        story_points: storyData.storyPoints,
        priority: storyData.priority,
        ai_generated: true,
        status: 'draft',
        created_by: user.id
      })

      setRequirement('')
      setFeatureTitle('')
      loadStories()
      alert('User story generated successfully!')
    } catch (error) {
      console.error('Error generating story:', error)
      alert('Failed to generate user story. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Story Generator</h1>
        <p className="mt-2 text-gray-600">AI-powered user story creation from requirements</p>
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

      {selectedProjectId && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm p-6 border border-indigo-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
            Generate User Story with AI
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature Title</label>
              <input
                type="text"
                value={featureTitle}
                onChange={(e) => setFeatureTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., User Authentication"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Description</label>
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the feature or requirement you want to convert into a user story..."
              />
            </div>

            <button
              onClick={generateStory}
              disabled={generating || !requirement}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {generating ? 'Generating...' : 'Generate User Story'}
            </button>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">User Stories</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
            ) : stories.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No user stories yet. Generate your first story using AI!
              </div>
            ) : (
              stories.map(story => (
                <div key={story.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{story.title}</h3>
                        {story.ai_generated && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">AI Generated</span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          story.priority === 'high' ? 'bg-red-100 text-red-700' :
                          story.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {story.priority || 'medium'}
                        </span>
                      </div>

                      {story.user_role && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>As a</strong> {story.user_role}<br />
                          <strong>I want to</strong> {story.user_goal}<br />
                          <strong>So that</strong> {story.user_benefit}
                        </p>
                      )}

                      {story.acceptance_criteria && Array.isArray(story.acceptance_criteria) && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Acceptance Criteria:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {story.acceptance_criteria.map((criteria: string, idx: number) => (
                              <li key={idx}>{criteria}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {story.story_points && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Story Points: {story.story_points}</span>
                        </div>
                      )}
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
