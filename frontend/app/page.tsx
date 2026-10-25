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

import OnboardingLanding from '@/components/OnboardingLanding'

interface Book {
  id: string
  title: string
  status: string
  genre?: string | null
  sub_genre?: string | null
  content_mode?: 'extraction' | 'companion' | null
}

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
    if (user) {
      Promise.all([
        api.listBooks().then(setBooks).catch(() => {}),
        api.dueCards().then(d => setDueCount(d.length)).catch(() => {}),
      ]).finally(() => setLoadingBooks(false))
    }
  }, [user])

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )

  if (!user) {
    return <OnboardingLanding />
  }

  const firstName = user.email?.split('@')[0] ?? 'there'
  const activeBook = books.find(b => b.status === 'ready' || b.status === 'processing') ?? books[0]
  const isCompanionMode = activeBook?.content_mode === 'companion'

  const sectionTitleText = isCompanionMode ? "Today's Reading Assignment" : "Today's Key Points"
  const taglineCopy = isCompanionMode
    ? "Never lose your place — you do the reading, we handle the pacing."
    : "Absorb every idea in this book, a little each day."

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Greeting header ── */}
        <section className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F5A623] mb-1">
              {getGreeting()}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#111111] capitalize">
              {firstName}.
            </h1>
          </div>
          {/* Streak counter */}
          <div className="flex items-center gap-2 bg-[#FFF5E8] border border-[#FFE9C9] rounded-full px-4 py-2 shadow-sm">
            <Flame className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" />
            <span className="font-bold text-[#C2720F] text-sm">7</span>
            <span className="text-[#C2720F] text-xs font-semibold">day streak</span>
          </div>
        </section>

        {/* ── App Tagline Banner ── */}
        <div className="rounded-[24px] bg-white border border-[#E4E4E7] p-4 text-center shadow-sm">
          <p className="font-serif italic text-sm sm:text-base text-neutral-800">
            &ldquo;{taglineCopy}&rdquo;
          </p>
        </div>

        {/* ── Due-cards CTA ── */}
        {dueCount > 0 && (
          <Link
            href="/review"
            className="flex items-center gap-4 rounded-[24px] bg-[#111111] px-6 py-5 text-white shadow-xl hover:bg-black transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base sm:text-lg font-semibold text-white">
                {isCompanionMode ? `Answer ${dueCount} reflection question${dueCount !== 1 ? 's' : ''}` : `Review ${dueCount} flashcard${dueCount !== 1 ? 's' : ''}`}
              </p>
              <p className="text-neutral-400 text-xs mt-0.5 font-sans">Retain more today with spaced repetition</p>
            </div>
            <span className="text-[#F5A623] font-bold text-lg group-hover:translate-x-1 transition-transform">➔</span>
          </Link>
        )}

        {/* ── Today's Reading hero card ── */}
        {activeBook ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-semibold text-[#111111]">{sectionTitleText}</h2>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${isCompanionMode ? 'bg-[#FFF5E8] text-[#C2720F] border-[#FFE9C9]' : 'bg-neutral-100 text-neutral-800 border-neutral-200'}`}>
                  {isCompanionMode ? '📖 Companion' : '🧠 Extraction'}
                </span>
              </div>
              <Link href="/books" className="text-xs text-[#C2720F] font-semibold hover:underline">
                All books
              </Link>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-[#111111] via-[#1A1A1E] to-[#0A0A0C] p-6 text-white shadow-xl relative overflow-hidden border border-neutral-800">
              {/* Subtle ambient accent glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#F5A623]/10 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#F5A623]" />
                  </div>
                  <div>
                    <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                      {isCompanionMode ? 'ACTIVE COMPANION' : 'READING NOW'}
                    </p>
                    <p className="font-serif text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-1">{activeBook.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <p className="text-neutral-300 text-xs mb-1 font-sans">
                      {isCompanionMode ? 'Ch. 4-5 · Est. 18 min assignment' : 'Chapter 3 · Est. 12 min summary'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" />
                      <span className="text-[#F5A623] text-xs font-semibold">
                        {isCompanionMode ? 'Spoiler-Free Pacing' : '+24 pts today'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/books/${activeBook.id}`}
                    className="flex items-center gap-2 bg-white text-black font-semibold text-xs sm:text-sm rounded-full px-5 py-2.5 hover:bg-neutral-200 transition-colors shadow-md"
                  >
                    <Play className="w-3 h-3 fill-current text-[#F5A623]" />
                    <span>{isCompanionMode ? 'Read' : 'Start'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <div className="rounded-[28px] border-2 border-dashed border-[#E4E4E7] bg-white p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#FFF5E8] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-[#F5A623]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#111111] mb-1">Your bookshelf is empty</h3>
              <p className="text-neutral-500 text-sm mb-5 max-w-sm mx-auto">Upload a book or PDF to start receiving daily micro-lessons and flashcards</p>
              <Link href="/books" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all shadow-md">
                <span>Upload your first book</span>
                <span className="text-[#F5A623]">➔</span>
              </Link>
            </div>
          </section>
        )}

        {/* ── Continue Reading shelf ── */}
        {books.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl font-semibold text-[#111111]">Continue Reading</h2>
              <Link href="/books" className="text-xs text-[#C2720F] font-semibold hover:underline flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
              {books.slice(0, 6).map(book => {
                const progress = Math.floor(Math.random() * 80) + 5
                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex-shrink-0 w-40 bg-white rounded-[20px] border border-[#E4E4E7] p-3.5 hover:shadow-lg transition-all group"
                  >
                    <div className="w-full h-24 rounded-16 bg-neutral-100 flex items-center justify-center mb-3 group-hover:bg-[#FFF5E8] transition-colors">
                      <BookOpen className="w-8 h-8 text-neutral-400 group-hover:text-[#F5A623] transition-colors" />
                    </div>
                    <p className="font-serif text-xs font-semibold text-neutral-900 line-clamp-2 leading-tight mb-2.5">
                      {book.title}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#F5A623]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 font-medium">{progress}% mastered</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-[#111111] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3.5">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3.5 p-4 rounded-[20px] bg-white border border-[#E4E4E7] hover:border-black/20 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-50 group-hover:bg-[#FFF5E8] flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-neutral-600 group-hover:text-[#F5A623] transition-colors" />
                </div>
                <span className="font-sans font-semibold text-xs sm:text-sm text-neutral-900">{label}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  )
}
