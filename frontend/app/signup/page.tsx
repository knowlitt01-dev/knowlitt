'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap, Mail, Lock, User, Chrome, MapPin } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [locationDismissed, setLocationDismissed] = useState(false)
  const { signup, user }        = useAuth()
  const router                  = useRouter()

  if (user) { router.push('/'); return null }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signup(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  function handleLocationPermission() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => setLocationDismissed(true), () => setLocationDismissed(true))
    } else {
      setLocationDismissed(true)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-20 bg-primary shadow-primary flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-app-text tracking-tight">Create your account</h1>
          <p className="text-app-subtext mt-1.5 text-sm text-center">
            Your daily lessons from the books you own
          </p>
        </div>

        {/* Location permission card */}
        {!locationDismissed && (
          <div className="mb-4 rounded-16 border border-primary-100 bg-primary-50 p-4 flex gap-3">
            <div className="w-9 h-9 rounded-12 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-app-text mb-0.5">Set your timezone</p>
              <p className="text-xs text-app-subtext leading-relaxed">
                We use your location to schedule daily reminders at the right time — no data is stored or shared.
              </p>
              <div className="flex gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleLocationPermission}
                  className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
                >
                  Allow location
                </button>
                <span className="text-app-border">·</span>
                <button
                  type="button"
                  onClick={() => setLocationDismissed(true)}
                  className="text-xs text-app-subtext hover:text-app-text transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="card space-y-4">

          {/* Error */}
          {error && <div className="alert-error">{error}</div>}

          {/* Google OAuth */}
          <button
            type="button"
            className="btn-secondary w-full flex items-center justify-center gap-2.5"
            onClick={() => { /* placeholder */ }}
          >
            <Chrome className="w-4 h-4 text-[#4285F4]" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-app-border" />
            <span className="text-xs text-app-subtext font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-app-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtext pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input pl-10"
                autoComplete="name"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtext pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input pl-10"
                autoCapitalize="none"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtext pointer-events-none" />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pl-10 pr-10"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-subtext hover:text-app-text transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-app-subtext mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-app-subtext mt-4 leading-relaxed">
          By creating an account you agree to our{' '}
          <a href="#" className="underline hover:text-app-text">Terms</a> and{' '}
          <a href="#" className="underline hover:text-app-text">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
