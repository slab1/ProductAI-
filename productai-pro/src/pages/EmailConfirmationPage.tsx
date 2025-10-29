import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface EmailConfirmationPageProps {
  email?: string
}

export default function EmailConfirmationPage({ email }: EmailConfirmationPageProps) {
  const [resendEmail, setResendEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resendConfirmation } = useAuth()

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resendConfirmation(resendEmail || email || '')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">ProductAI Pro</h1>
          <p className="text-gray-600">AI-Powered Product Management Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a confirmation link to {email && <strong>{email}</strong>}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>You'll be redirected to your dashboard</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Didn't receive the email? Check your spam folder or request a new one.
              </p>
            </div>

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Confirmation email sent successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <label htmlFor="resendEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="resendEmail"
                  type="email"
                  required
                  value={resendEmail || email || ''}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="you@company.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Confirmation
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center space-y-2">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Back to Sign In
                </Link>
                <p className="text-xs text-gray-500">
                  Already confirmed your email? Try signing in.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Having trouble? Contact our support team</p>
        </div>
      </div>
    </div>
  )
}