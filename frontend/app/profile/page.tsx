'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Shield, Bell, Link2, CreditCard,
  MapPin, HelpCircle, LogOut, ChevronRight, BookOpen, Flame, Layers
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  
  const [booksCount, setBooksCount] = useState(0)
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      api.listBooks().then(l => setBooksCount(l.length)).catch(() => {})
      api.dueCards().then(d => setDueCount(d.length)).catch(() => {})
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const initial = (user.email?.[0] ?? 'U').toUpperCase()

  const menuItems = [
    { label: 'Account Settings', desc: 'Manage your password and details', icon: Shield, href: '/settings' },
    { label: 'Notification Preferences', desc: 'Configure channels & delivery times', icon: Bell, href: '/settings' },
    { label: 'Connected Apps', desc: 'Google Drive, Kindle & messengers', icon: Link2, href: '/connectors' },
    { label: 'Subscription & Billing', desc: 'Upgrade, view history & invoices', icon: CreditCard, href: '/upgrade' },
    { label: 'Location & Timezone', desc: 'Synchronize daily notifications', icon: MapPin, href: '/settings' },
    { label: 'Help & Support', desc: 'Submit tickets to our helpers', icon: HelpCircle, href: '/settings' }
  ]

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-app-text">Profile</h1>
            <p className="text-xs text-app-subtext">Manage your personal tutor account</p>
          </div>
        </div>

        {/* User Card */}
        <div className="card flex items-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-2xl">{initial}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-app-text">{user.email}</h2>
            <p className="text-xs text-app-subtext">User ID: {user.email?.split('@')[0]}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center space-y-1">
            <div className="w-8 h-8 rounded-10 bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-app-text mt-1">{booksCount}</p>
            <p className="text-[10px] font-semibold text-app-subtext uppercase tracking-wider">Books</p>
          </div>

          <div className="card p-4 text-center space-y-1">
            <div className="w-8 h-8 rounded-10 bg-accent/10 flex items-center justify-center mx-auto text-accent">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-app-text mt-1">7</p>
            <p className="text-[10px] font-semibold text-app-subtext uppercase tracking-wider">Streak</p>
          </div>

          <div className="card p-4 text-center space-y-1">
            <div className="w-8 h-8 rounded-10 bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-app-text mt-1">{dueCount}</p>
            <p className="text-[10px] font-semibold text-app-subtext uppercase tracking-wider">Flashcards</p>
          </div>
        </div>

        {/* Menu list */}
        <div className="card p-0 overflow-hidden divide-y divide-app-border">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link 
                key={idx}
                href={item.href}
                className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-10 bg-gray-100 group-hover:bg-primary/15 text-app-subtext group-hover:text-primary flex items-center justify-center transition-colors">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app-text group-hover:text-primary transition-colors">{item.label}</h3>
                    <p className="text-xs text-app-subtext">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-app-subtext group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )
          })}
          
          {/* Logout option */}
          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-10 bg-red-100/50 text-app-error flex items-center justify-center">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-error">Log Out</h3>
                <p className="text-xs text-app-error/70">Sign out of this session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-app-error" />
          </button>
        </div>

      </div>
    </AppShell>
  )
}
