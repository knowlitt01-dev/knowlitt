'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function UpgradePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [billing, setBilling] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    api.billingStatus().then(setBilling).catch(() => {})
  }, [])

  async function handleSubscribe(plan: 'monthly' | 'yearly' | 'team') {
    setError('')
    setLoadingPlan(plan)
    try {
      const result = await api.createSubscription(plan === 'team' ? 'yearly' : plan)
      if (!window.Razorpay) {
        setError('Payment widget failed to load — check your connection and try again.')
        return
      }
      const rzp = new window.Razorpay({
        key: result.razorpay_key_id,
        subscription_id: result.subscription_id,
        name: 'BookTutor',
        description: `${plan.toUpperCase()} subscription`,
        handler: () => router.push('/'),
        theme: { color: '#4A36DE' },
      })
      rzp.open()
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) {
        setError("Subscriptions aren't set up yet — the app owner needs to add Razorpay credentials (see BILLING.md).")
      } else {
        setError('Something went wrong starting checkout. Please try again.')
      }
    } finally {
      setLoadingPlan(null)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const freeFeatures = [
    '1 active book limit',
    'Daily app summaries',
    'Standard roadmap delivery',
    'Email notifications support'
  ]

  const proFeatures = [
    'Unlimited book uploads',
    'AI-generated detailed insight briefs',
    'Spaced repetition flashcards bot',
    'WhatsApp & Telegram sync',
    'Google Drive & Kindle imports',
    'Priority customer support'
  ]

  const teamFeatures = [
    'Everything in Pro plan',
    'Up to 10 team seats included',
    'Shared roadmap templates',
    'Corporate workspace billing',
    'Dedicated support manager',
    'API access for summarization'
  ]

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-app-text">Upgrade plan</h1>
            <p className="text-xs text-app-subtext">Unlock premium AI reading capabilities</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {billing && !billing.razorpay_configured && (
          <div className="alert-warn flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Razorpay payment server integration isn&apos;t fully set up yet. See <code>BILLING.md</code>.</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          
          {/* Free Plan */}
          <div className="card flex flex-col justify-between border-app-border bg-white">
            <div className="space-y-4">
              <div>
                <span className="badge badge-primary text-[10px] py-0.5 px-2">BASIC</span>
                <h3 className="text-base font-bold text-app-text mt-2">Free Plan</h3>
                <p className="text-xs text-app-subtext">Perfect to get started learning.</p>
              </div>
              <div className="text-3xl font-extrabold text-app-text">
                ₹0 <span className="text-xs font-normal text-app-subtext">/ forever</span>
              </div>
              <ul className="space-y-2 pt-2 border-t border-app-border/40">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-app-subtext">
                    <Check className="w-3.5 h-3.5 text-app-success flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn-secondary w-full text-xs py-2.5 mt-6" disabled>
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card flex flex-col justify-between border-2 border-primary bg-white shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3 h-3 fill-white" /> Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <span className="badge badge-accent text-[10px] py-0.5 px-2">PRO</span>
                <h3 className="text-base font-bold text-app-text mt-2">Premium Pro</h3>
                <p className="text-xs text-app-subtext">Accelerate reading with power tools.</p>
              </div>
              <div className="text-3xl font-extrabold text-app-text">
                ₹199 <span className="text-xs font-normal text-app-subtext">/ month</span>
              </div>
              <ul className="space-y-2 pt-2 border-t border-app-border/40">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-app-text">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null}
              className="btn-primary w-full text-xs py-2.5 mt-6"
            >
              {loadingPlan === 'monthly' ? 'Processing...' : 'Subscribe Pro'}
            </button>
          </div>

          {/* Team Plan */}
          <div className="card flex flex-col justify-between border-app-border bg-white">
            <div className="space-y-4">
              <div>
                <span className="badge badge-primary text-[10px] py-0.5 px-2">ORGANIZATION</span>
                <h3 className="text-base font-bold text-app-text mt-2">Team Plan</h3>
                <p className="text-xs text-app-subtext">For corporate & reading clubs.</p>
              </div>
              <div className="text-3xl font-extrabold text-app-text">
                ₹1,899 <span className="text-xs font-normal text-app-subtext">/ year</span>
              </div>
              <ul className="space-y-2 pt-2 border-t border-app-border/40">
                {teamFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-app-subtext">
                    <Check className="w-3.5 h-3.5 text-app-success flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe('team')}
              disabled={loadingPlan !== null}
              className="btn-secondary w-full text-xs py-2.5 mt-6 hover:bg-primary hover:text-white"
            >
              {loadingPlan === 'team' ? 'Processing...' : 'Upgrade Team'}
            </button>
          </div>

        </div>

      </div>
    </AppShell>
  )
}
