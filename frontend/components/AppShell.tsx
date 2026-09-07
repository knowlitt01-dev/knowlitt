'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  Home, BookOpen, Layers, Map, Plug, Compass,
  CreditCard, User, LogOut, Menu, X, Zap,
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
    <div className="flex min-h-screen bg-app-bg">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-app-border z-40
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-app-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-10 bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-app-text text-lg">BookTutor</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-app-subtext hover:text-app-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={active ? 'nav-item-active' : 'nav-item'}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{label}</span>
                {href === '/upgrade' && (
                  <span className="ml-auto badge badge-accent text-[10px] py-0.5 px-1.5">PRO</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="p-3 border-t border-app-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {(user.email?.[0] ?? 'U').toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-app-text truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="nav-item w-full text-app-error hover:bg-red-50 hover:text-app-error"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-app-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-10 hover:bg-gray-100 text-app-subtext transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-10 bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-app-text">BookTutor</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
