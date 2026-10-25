'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Chrome, MapPin, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'
import { googleOAuthUrl } from '@/lib/api'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [locationDismissed, setLocationDismissed] = useState(false)
  const { signup, user, loading: authLoading } = useAuth()
  const router                  = useRouter()

  useEffect(() => {
    if (!authLoading && user) router.push('/')
  }, [user, authLoading, router])

  if (authLoading || user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
      <svg className="animate-spin w-8 h-8 text-[#F5A623]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )

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
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col justify-between selection:bg-[#F5A623]/30">
      {/* ── Top Bar ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-700 group-hover:text-black transition-colors font-sans">
            BOOKTUTOR
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-neutral-300 hover:border-black text-neutral-800 hover:text-black transition-all"
        >
          Sign in
        </Link>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">
          
          {/* Editorial Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFE9C9] text-[#C2720F] mb-3">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              <span>7-Day Free Trial</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#111111] tracking-tight">
              Begin your journey.
            </h1>
            <p className="font-serif italic text-xl sm:text-2xl text-[#F5A623] mt-1">
              Turn books into lifelong wisdom.
            </p>
          </div>

          {/* Timezone hint card */}
          {!locationDismissed && (
            <div className="mb-4 rounded-[20px] border border-[#E4E4E7] bg-white p-4 flex gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FFF5E8] flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#F5A623]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-800 mb-0.5">Sync reading reminders</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  We schedule daily card reviews at your optimal morning hour.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleLocationPermission}
                    className="text-[11px] font-semibold text-[#C2720F] hover:underline"
                  >
                    Set timezone
                  </button>
                  <span className="text-neutral-300">·</span>
                  <button
                    type="button"
                    onClick={() => setLocationDismissed(true)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-600"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-xl shadow-neutral-200/50 p-6 sm:p-8 space-y-5">
            {error && (
              <div className="rounded-16 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Google OAuth */}
            <button
              type="button"
              className="w-full h-12 rounded-full border border-[#E4E4E7] bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm"
              onClick={() => { window.location.href = googleOAuthUrl() }}
            >
              <Chrome className="w-4 h-4 text-[#4285F4]" />
              <span>Sign up with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E4E4E7]" />
              <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-400">or with email</span>
              <div className="flex-1 h-px bg-[#E4E4E7]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E4E4E7] bg-neutral-50/50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-full border border-[#E4E4E7] bg-neutral-50/50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                    autoCapitalize="none"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1 ml-1">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Choose a secure password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-11 rounded-full border border-[#E4E4E7] bg-neutral-50/50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Features bullet list */}
              <div className="pt-2 pb-1 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#29A666] flex-shrink-0" />
                  <span>Unlimited book imports & SM-2 review sessions</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#29A666] flex-shrink-0" />
                  <span>No credit card required for trial</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="signup-submit"
                type="submit"
                className="w-full h-12 rounded-full bg-[#111111] hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md transform active:scale-[0.99] disabled:opacity-50 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="text-[#F5A623] font-bold">➔</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom link */}
          <p className="text-center text-xs text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-900 font-semibold underline hover:text-[#C2720F] transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-neutral-400 mt-3 leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-neutral-700">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-neutral-700">Privacy Policy</a>.
          </p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-neutral-400">
        <p>BookTutor • AI-powered daily insights & spaced repetition</p>
      </footer>
    </div>
  )
}
