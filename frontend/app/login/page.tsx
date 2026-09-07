'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap, Mail, Lock, Chrome } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, user }         = useAuth()
  const router                  = useRouter()

  if (user) { router.push('/'); return null }

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
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-20 bg-primary shadow-primary flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-app-text tracking-tight">Welcome back</h1>
          <p className="text-app-subtext mt-1.5 text-sm text-center">
            Sign in to continue your reading journey
          </p>
        </div>

        {/* Card */}
        <div className="card space-y-4">

          {/* Error */}
          {error && <div className="alert-error">{error}</div>}

          {/* Google OAuth */}
          <button
            type="button"
            className="btn-secondary w-full flex items-center justify-center gap-2.5"
            onClick={() => { /* placeholder — wire to /auth/google */ }}
          >
            <Chrome className="w-4 h-4 text-[#4285F4]" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-app-border" />
            <span className="text-xs text-app-subtext font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-app-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtext pointer-events-none" />
              <input
                id="login-email"
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
                id="login-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pl-10 pr-10"
                autoComplete="current-password"
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
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
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign-up link */}
        <p className="text-center text-sm text-app-subtext mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:text-primary-700 transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
