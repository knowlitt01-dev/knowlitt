'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, LifeBuoy, BarChart3 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    // The real enforcement is server-side (every /admin/* call 403s for
    // non-admins) — this check is just to avoid flashing admin UI at
    // someone who isn't one.
    api.adminAnalyticsOverview()
      .then(() => setIsAdmin(true))
      .catch(() => router.push('/'))
      .finally(() => setChecked(true))
  }, [user, authLoading, router])

  if (authLoading || !checked || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-6">
          <span className="font-bold">BookTutor Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/analytics" className="flex items-center gap-1.5 hover:text-brand-400">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Link>
            <Link href="/admin/support" className="flex items-center gap-1.5 hover:text-brand-400">
              <LifeBuoy className="w-4 h-4" /> Support
            </Link>
            <Link href="/admin/users" className="flex items-center gap-1.5 hover:text-brand-400">
              <Users className="w-4 h-4" /> Users
            </Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-gray-400 hover:text-white">
            Back to app
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
