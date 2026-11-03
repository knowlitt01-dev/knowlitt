'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Sparkles, FileText, Download, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

type SummaryDepth = 'quick' | 'detailed' | 'comprehensive'

export default function BookSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const bookId = params?.id as string

  const [depth, setDepth] = useState<SummaryDepth>('detailed')
  const [summaryData, setSummaryData] = useState<{
    book_id: string
    depth: string
    content: string
    generated_at: string
  } | null>(null)
  const [bookTitle, setBookTitle] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const loadSummary = async (selectedDepth: SummaryDepth) => {
    if (!bookId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.getBookSummary(bookId, selectedDepth)
      setSummaryData(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate book summary.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && bookId) {
      // Also get book info
      api.listBooks().then((books: any[]) => {
        const b = books.find(item => item.id === bookId)
        if (b) setBookTitle(b.title)
      }).catch(() => {})
      loadSummary(depth)
    }
  }, [user, bookId, depth])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/books/${bookId}/roadmap`}
              className="w-10 h-10 rounded-full border border-[#E4E4E7] hover:border-black flex items-center justify-center text-neutral-600 transition-colors bg-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">
                AI Book Synthesis
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#111111] leading-tight">
                {bookTitle || 'Book Summary'}
              </h1>
            </div>
          </div>

          <Link
            href={`/books/${bookId}/roadmap`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <span>Open Roadmap</span>
            <span className="text-[#F5A623]">➔</span>
          </Link>
        </div>

        {/* Depth Selector Pills */}
        <div className="bg-white rounded-[24px] border border-[#E4E4E7] p-2 sm:p-3 shadow-sm flex items-center gap-2">
          {[
            { key: 'quick', label: 'Quick Overview', desc: '3–5 key takeaways' },
            { key: 'detailed', label: 'Detailed Summary', desc: 'Chapter-by-chapter synthesis' },
            { key: 'comprehensive', label: 'Comprehensive Study Notes', desc: 'Full deep dive with evidence' },
          ].map(tab => {
            const active = depth === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setDepth(tab.key as SummaryDepth)}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-[18px] text-left transition-all ${
                  active
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <p className="text-xs font-semibold">{tab.label}</p>
                <p className={`text-[10px] mt-0.5 ${active ? 'text-[#F5A623]' : 'text-neutral-400'}`}>
                  {tab.desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-sm p-6 sm:p-10 min-h-[400px]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-serif text-lg font-semibold text-neutral-800">
                Generating Hierarchical Summary...
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                Distilling concepts and verifying claims against the source material.
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-serif text-lg font-semibold text-neutral-900 mb-1">
                Summary Incomplete
              </p>
              <p className="text-xs text-neutral-500">{error}</p>
            </div>
          ) : (
            <div className="prose prose-neutral max-w-none">
              <div className="whitespace-pre-wrap font-serif text-neutral-800 text-sm sm:text-base leading-relaxed space-y-4">
                {summaryData?.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

