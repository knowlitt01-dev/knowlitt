'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Flame, BookOpen, Upload, HardDrive, Layers, Map,
  ChevronRight, Play, Star,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'

interface Book { id: string; title: string; status: string }

const QUICK_ACTIONS = [
  { label: 'Upload Book',     icon: Upload,    href: '/books',         color: 'bg-primary-50 text-primary' },
  { label: 'Connect Drive',   icon: HardDrive, href: '/connectors',    color: 'bg-accent-50 text-accent-600' },
  { label: 'Flashcards',      icon: Layers,    href: '/review',        color: 'bg-green-50 text-green-700' },
  { label: 'Roadmap',         icon: Map,       href: '/roadmap',       color: 'bg-purple-50 text-purple-700' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks]           = useState<Book[]>([])
  const [dueCount, setDueCount]     = useState(0)
  const [loadingBooks, setLoadingBooks] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    Promise.all([
      api.listBooks().then(setBooks).catch(() => {}),
      api.dueCards().then(d => setDueCount(d.length)).catch(() => {}),
    ]).finally(() => setLoadingBooks(false))
  }, [])

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )

  const firstName = user.email?.split('@')[0] ?? 'there'
  const activeBook = books.find(b => b.status === 'ready' || b.status === 'processing') ?? books[0]

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Greeting header ── */}
        <section className="flex items-start justify-between">
          <div>
            <p className="text-app-subtext text-sm font-medium mb-0.5">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-app-text capitalize">{firstName} 👋</h1>
          </div>
          {/* Streak counter */}
          <div className="flex items-center gap-1.5 bg-accent-50 border border-accent-100 rounded-16 px-3 py-2">
            <Flame className="w-4 h-4 text-accent" />
            <span className="font-bold text-accent text-sm">7</span>
            <span className="text-accent-700 text-xs font-medium">day streak</span>
          </div>
        </section>

        {/* ── Due-cards CTA ── */}
        {dueCount > 0 && (
          <Link
            href="/review"
            className="flex items-center gap-3 rounded-16 bg-primary px-5 py-4 shadow-primary group transition-transform hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-12 bg-white/20 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base">Review {dueCount} flashcard{dueCount !== 1 ? 's' : ''}</p>
              <p className="text-white/70 text-xs mt-0.5">Stay on top of your learning streak</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* ── Today's Reading hero card ── */}
        {activeBook ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0">Today&apos;s Reading</h2>
              <Link href="/books" className="text-xs text-primary font-medium hover:text-primary-700 transition-colors">
                All books
              </Link>
            </div>
            <div className="rounded-20 bg-gradient-to-br from-primary to-primary-800 p-5 text-white shadow-primary relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-12 bg-white/15 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium">READING NOW</p>
                    <p className="font-bold text-white text-base leading-tight line-clamp-1">{activeBook.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-0.5">Chapter 3 · Est. 12 min</p>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span className="text-white text-xs font-semibold">+24 pts today</span>
                    </div>
                  </div>
                  <Link
                    href={`/books/${activeBook.id}`}
                    className="flex items-center gap-2 bg-white text-primary font-bold text-sm rounded-12 px-4 py-2 hover:bg-primary-50 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="rounded-20 border-2 border-dashed border-app-border bg-white p-8 text-center">
              <div className="w-12 h-12 rounded-20 bg-primary-50 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <p className="font-bold text-app-text mb-1">No books yet</p>
              <p className="text-app-subtext text-sm mb-4">Upload your first book to get started</p>
              <Link href="/books" className="btn-primary inline-flex">Upload a book</Link>
            </div>
          </section>
        )}

        {/* ── Continue Reading shelf ── */}
        {books.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0">Continue Reading</h2>
              <Link href="/books" className="text-xs text-primary font-medium hover:text-primary-700 transition-colors flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
              {books.slice(0, 6).map(book => {
                const progress = Math.floor(Math.random() * 80) + 5 // mock
                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex-shrink-0 w-36 bg-white rounded-16 border border-app-border p-3 hover:shadow-card-hover transition-shadow group"
                  >
                    <div className="w-full h-20 rounded-12 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-2.5 group-hover:from-primary-200 group-hover:to-primary-300 transition-colors">
                      <BookOpen className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-app-text line-clamp-2 leading-tight mb-2">
                      {book.title}
                    </p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-app-subtext mt-1">{progress}% done</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
              <Link
                key={href}
                href={href}
                className="card-hover flex items-center gap-3 p-4 rounded-16"
              >
                <div className={`w-9 h-9 rounded-12 flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <span className="font-semibold text-sm text-app-text">{label}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  )
}
