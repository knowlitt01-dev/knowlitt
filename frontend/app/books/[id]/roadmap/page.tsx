'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Award, Sparkles, Compass, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'
import CandyCrushRoadmap, { LevelItem } from '@/components/CandyCrushRoadmap'

export default function BookRoadmapPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const bookId = params?.id as string

  const [roadmap, setRoadmap] = useState<{
    book_id: string
    book_title: string
    book_author?: string
    total_levels: number
    completed_levels: number
    total_xp: number
    earned_xp: number
    progress_percent: number
    levels: LevelItem[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const loadRoadmap = async () => {
    if (!bookId) return
    try {
      const data = await api.getRoadmap(bookId)
      setRoadmap(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load reading roadmap for this book.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && bookId) {
      loadRoadmap()
    }
  }, [user, bookId])

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-neutral-500">Mapping your reading journey...</p>
        </div>
      </AppShell>
    )
  }

  if (error || !roadmap) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">Roadmap In Progress</h2>
          <p className="text-neutral-500 text-sm mb-6">{error || 'This book is still preparing its learning path.'}</p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Books</span>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/books"
              className="w-10 h-10 rounded-full border border-[#E4E4E7] hover:border-black flex items-center justify-center text-neutral-600 transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">
                Reading Roadmap
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111111] leading-tight">
                {roadmap.book_title}
              </h1>
            </div>
          </div>

          {/* AI Summary Link */}
          <Link
            href={`/books/${bookId}/summary`}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:border-black text-neutral-800 text-xs font-semibold bg-white transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>AI Summary</span>
          </Link>
        </div>

        {/* Progress & Gamification Stats Banner */}
        <div className="bg-white rounded-[24px] border border-[#E4E4E7] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF5E8] flex items-center justify-center text-[#C2720F] flex-shrink-0">
              <Award className="w-7 h-7 text-[#F5A623]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Mastery Points</p>
              <p className="font-serif text-2xl font-semibold text-neutral-900">
                {roadmap.earned_xp} <span className="text-sm font-sans font-normal text-neutral-400">/ {roadmap.total_xp} XP</span>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-500">
                Level {roadmap.completed_levels} of {roadmap.total_levels}
              </span>
              <span className="text-[#C2720F]">{roadmap.progress_percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#F5A623] transition-all duration-500"
                style={{ width: `${roadmap.progress_percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Candy Crush Style Roadmap */}
        <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-sm p-6 sm:p-10">
          <CandyCrushRoadmap
            bookId={bookId}
            bookTitle={roadmap.book_title}
            levels={roadmap.levels}
            onLevelCompleted={loadRoadmap}
          />
        </div>
      </div>
    </AppShell>
  )
}

