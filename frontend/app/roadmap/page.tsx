'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Compass, ChevronRight, Play } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface Book {
  id: string
  title: string
  status: string
  content_mode?: string
}

export default function GlobalRoadmapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadBooks() {
      try {
        const list = await api.listBooks()
        setBooks(list)
      } catch (err) {
        console.error('Failed to load books:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadBooks()
  }, [user])

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#F5A623] mb-1">
            Learning Paths
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#111111]">
            Reading Roadmaps
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Select a book to continue your gamified learning milestones
          </p>
        </div>

        {books.length > 0 ? (
          <div className="space-y-3">
            {books.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-[24px] border border-[#E4E4E7] p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#FFF5E8] text-[#C2720F] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#F5A623]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-semibold text-neutral-900 text-base truncate">
                      {b.title}
                    </p>
                    <span className="text-[11px] text-neutral-400 capitalize">
                      {b.content_mode || 'Reading Journey'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/books/${b.id}/roadmap`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex-shrink-0 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                  <span>Open Roadmap</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[28px] border border-[#E4E4E7] text-center py-16 px-4 shadow-sm">
            <Compass className="w-12 h-12 text-[#F5A623]/60 mx-auto mb-3" />
            <h2 className="font-serif text-lg font-semibold text-neutral-900 mb-1">
              No roadmaps available
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mb-6">
              Upload a book PDF first to auto-generate its interactive learning roadmap.
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>Upload Book</span>
              <span className="text-[#F5A623]">➔</span>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
