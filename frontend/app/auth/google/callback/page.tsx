'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api'

/**
 * Google OAuth callback handler.
 *
 * After the user signs in with Google, the backend redirects here with:
 *   /auth/google/callback?token=<jwt>&drive=<0|1>
 *
 * This page:
 *   1. Reads the token from the query string
 *   2. Persists it to localStorage (same slot as email/password login)
 *   3. Redirects to the dashboard
 *
 * The page is intentionally minimal — it should be invisible to the user
 * (just a brief spinner) because the redirect happens immediately.
 */
export default function GoogleCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      // OAuth failed or was denied — go back to login with an error message
      const reason = error || 'google_failed'
      router.replace(`/login?error=${reason}`)
      return
    }

    // Store the JWT exactly like the email/password flow does
    setToken(token)

    // Redirect to dashboard — AuthProvider will pick up the token on next mount
    router.replace('/')
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
      <div className="text-center space-y-4">
        <svg className="animate-spin w-10 h-10 text-[#F5A623] mx-auto" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-neutral-500 font-sans">Signing you in with Google…</p>
      </div>
    </div>
  )
}
