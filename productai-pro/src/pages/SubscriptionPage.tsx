import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Check, Sparkles, Crown } from 'lucide-react'

const PLANS = [
  {
    type: 'free',
    name: 'Free Tier',
    price: 0,
    interval: 'forever',
    features: ['1 active project', 'Basic RICE calculations', '10 AI generations/month', 'Community support'],
    monthlyLimit: 10
  },
  {
    type: 'pro',
    name: 'Pro Plan',
    price: 299,
    interval: 'month',
    features: ['Unlimited projects', 'Full RICE framework with exports', 'Unlimited AI generations', 'Advanced visualizations', 'Priority support', 'Team collaboration (up to 5 members)'],
    monthlyLimit: -1,
    popular: true
  },
  {
    type: 'enterprise',
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: ['Everything in Pro', 'Unlimited team members', 'Custom integrations', 'Dedicated support', 'SLA guarantees', 'Advanced analytics'],
    monthlyLimit: -1
  }
]

export default function SubscriptionPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      alert('Please sign in to subscribe')
      return
    }
    setLoading(planType)
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType, customerEmail: user.email }
      })
      if (error) throw error
      if (data?.data?.checkoutUrl || data?.checkoutUrl) {
        window.location.href = data?.data?.checkoutUrl || data?.checkoutUrl
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      alert(error.message || 'Failed to create subscription')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-4 text-xl text-gray-600">Unlock the full power of AI-driven product management</p>
      </div>

      {profile && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
          <p className="text-sm text-indigo-900">Current Plan: <strong className="capitalize">{profile.subscription_tier}</strong></p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div key={plan.type} className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${plan.popular ? 'border-indigo-600 scale-105' : 'border-gray-200'}`}>
            {plan.popular && (
              <div className="bg-indigo-600 text-white text-center py-2 rounded-t-xl">
                <span className="text-sm font-semibold">Most Popular</span>
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                {plan.type === 'pro' && <Crown className="w-6 h-6 text-yellow-500" />}
                {plan.type === 'enterprise' && <Sparkles className="w-6 h-6 text-purple-500" />}
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.type)}
                disabled={loading === plan.type || profile?.subscription_tier === plan.type || plan.type === 'free'}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.type ? 'Processing...' : profile?.subscription_tier === plan.type ? 'Current Plan' : plan.type === 'free' ? 'Default Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a custom solution?</h3>
        <p className="text-gray-600 mb-4">Contact our sales team for custom pricing and features</p>
        <a href="mailto:sales@productaipro.com" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Contact Sales
        </a>
      </div>
    </div>
  )
}
