'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api, setToken, clearToken, ApiError } from '@/lib/api'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    refreshUser()
  }, [])

  async function refreshUser() {
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const { access_token } = await api.login(email, password)
    setToken(access_token)
    await refreshUser()
  }

  async function signup(email: string, password: string) {
    const { access_token } = await api.signup(email, password)
    setToken(access_token)
    await refreshUser()
  }

  function logout() {
    clearToken()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
