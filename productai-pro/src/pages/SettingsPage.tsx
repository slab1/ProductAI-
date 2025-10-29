import { useAuth } from '@/contexts/AuthContext'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{profile?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <p className="font-medium">{profile?.full_name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Subscription</label>
            <p className="font-medium capitalize">{profile?.subscription_tier || 'Free'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Additional settings coming soon</p>
      </div>
    </div>
  )
}
