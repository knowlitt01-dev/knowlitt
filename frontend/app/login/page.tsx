'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Chrome, Sparkles } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'
import { googleOAuthUrl } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, user, loading: authLoading } = useAuth()
  const router                  = useRouter()
  const searchParams            = useSearchParams()

  // Show OAuth error if redirected back from failed Google login
  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError === 'google_denied') setError('Google sign-in was cancelled.')
    else if (oauthError) setError('Google sign-in failed. Please try again or use email.')
  }, [searchParams])

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
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
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
          href="/signup"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-neutral-300 hover:border-black text-neutral-800 hover:text-black transition-all"
        >
          Create account
        </Link>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          
          {/* Editorial Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFE9C9] text-[#C2720F] mb-3">
              <Sparkles className="w-3 h-3 text-[#F5A623]" />
              <span>Literary Companion</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#111111] tracking-tight">
              Welcome back.
            </h1>
            <p className="font-serif italic text-xl sm:text-2xl text-[#F5A623] mt-1">
              Your reading queue awaits.
            </p>
          </div>

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
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E4E4E7]" />
              <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-400">or sign in with email</span>
              <div className="flex-1 h-px bg-[#E4E4E7]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-[#E4E4E7] bg-neutral-50/50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                    autoCapitalize="none"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#C2720F] hover:text-[#9A5700] font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-11 rounded-full border border-[#E4E4E7] bg-neutral-50/50 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                    autoComplete="current-password"
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

              {/* Submit Button */}
              <button
                id="login-submit"
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
                    Signing in…
                  </span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <span className="text-[#F5A623] font-bold">➔</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom link */}
          <p className="text-center text-xs text-neutral-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-neutral-900 font-semibold underline hover:text-[#C2720F] transition-colors">
              Create one free
            </Link>
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
