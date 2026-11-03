'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  Home, BookOpen, Layers, Map, Plug, Compass,
  CreditCard, User, LogOut, Menu, X, Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',            label: 'Home',        icon: Home },
  { href: '/books',       label: 'My Books',    icon: BookOpen },
  { href: '/review',      label: 'Flashcards',  icon: Layers },
  { href: '/roadmap',     label: 'Roadmap',     icon: Map },
  { href: '/connectors',  label: 'Connectors',  icon: Plug },
  { href: '/discover',    label: 'Discover',    icon: Compass },
  { href: '/upgrade',     label: 'Plans',       icon: CreditCard },
  { href: '/profile',     label: 'Profile',     icon: User },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-[#111111]">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E4E4E7] z-40
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#E4E4E7]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <BookOpen className="w-4 h-4 text-[#F5A623]" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs tracking-[0.2em] text-[#111111] uppercase">
                BOOKTUTOR
              </span>
              <span className="font-serif italic text-[11px] text-[#F5A623]">
                Knowledge Companion
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-black rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#F5A623]' : 'text-neutral-400'}`} />
                <span className="flex-1">{label}</span>
                {href === '/upgrade' && (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-[#F5A623] text-black' : 'bg-[#FFF5E8] text-[#C2720F]'
                  }`}>
                    PRO
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="p-4 border-t border-[#E4E4E7]">
            <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F5A623] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                {(user.email?.[0] ?? 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 truncate">{user.email}</p>
                <p className="text-[10px] text-neutral-400">Personal Scholar</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50/70 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E4E4E7] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#F5A623]" />
              </div>
              <span className="font-bold text-xs tracking-wider uppercase text-[#111111]">BOOKTUTOR</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
