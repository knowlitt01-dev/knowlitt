'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, RotateCcw, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'
import PageViewerModal from '@/components/PageViewerModal'

interface DueCard {
  card_id: string
  book_id?: string
  page_number?: number | null
  front: string
  back: string
  card_type?: string
  content_mode?: 'extraction' | 'companion'
  book_title?: string
}

export default function ReviewPage() {
  const [cards, setCards]       = useState<DueCard[]>([])
  const [current, setCurrent]   = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [done, setDone]         = useState(false)
  const [loading, setLoading]   = useState(true)
  const [animating, setAnimating] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const { user }                = useAuth()
  const router                  = useRouter()

  useEffect(() => { if (user) loadCards() }, [user])

  async function loadCards() {
    try { setCards(await api.dueCards()) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleResponse(response: 'again' | 'got_it') {
    const card = cards[current]
    try { await api.submitReview(card.card_id, response === 'got_it' ? 'good' : 'again') }
    catch (err) { console.error(err) }
    setAnimating(true)
    setTimeout(() => {
      setAnimating(false)
      if (current + 1 >= cards.length) { setDone(true) }
      else { setCurrent(c => c + 1); setFlipped(false) }
    }, 300)
  }

  const progress = cards.length > 0 ? ((current) / cards.length) * 100 : 0

  if (loading) return (
    <AppShell>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-app-subtext text-sm">Loading your review session…</p>
        </div>
      </div>
    </AppShell>
  )

  if (done || (cards.length === 0 && !loading)) return (
    <AppShell>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-xl text-center py-14 px-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[#FFF5E8] flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-[#F5A623]" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#111111] mb-2">
            {done ? 'Session complete!' : 'All caught up!'}
          </h2>
          <p className="text-neutral-500 text-sm mb-6 font-sans">
            {done
              ? `You reviewed ${cards.length} concept card${cards.length !== 1 ? 's' : ''}. Your mastery intervals have been updated.`
              : 'No cards are due for review right now. Come back for tomorrow’s session!'}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md">
            <span>Return to Bookshelf</span>
            <span className="text-[#F5A623]">➔</span>
          </Link>
        </div>
      </div>
    </AppShell>
  )

  const card = cards[current]
  const isCompanion = card.content_mode === 'companion' || card.card_type === 'reflection'

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="w-10 h-10 rounded-full border border-[#E4E4E7] hover:border-black flex items-center justify-center text-neutral-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#111111]">
              {isCompanion ? 'Reflection Prompts' : 'Concept Recall'}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">{card.book_title || `Card ${current + 1} of ${cards.length}`}</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF5E8] text-[#C2720F] border border-[#FFE9C9]">
            {isCompanion ? '💬 Reflection' : `${Math.round((current / cards.length) * 100)}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden mb-8">
          <div className="h-full rounded-full bg-[#F5A623] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div
          className={`
            relative cursor-pointer select-none
            transition-all duration-300
            ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
          onClick={() => !flipped && setFlipped(true)}
          style={{ perspective: '1000px' }}
        >
          <div
            className={`
              rounded-[28px] p-8 sm:p-10 min-h-[300px] flex flex-col items-center justify-center text-center relative
              transition-all duration-500 shadow-xl border
              ${flipped
                ? (isCompanion ? 'bg-[#FFFBF5] border-[#FFE9C9]' : 'bg-[#FAFAF8] border-[#E4E4E7]')
                : 'bg-white border-[#E4E4E7]'
              }
            `}
          >
            {/* View Original Page Action Button */}
            {card.book_id && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewerOpen(true)
                }}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200 shadow-sm transition-all z-10"
              >
                <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>{card.page_number ? `See Page ${card.page_number}` : 'See in Book'}</span>
              </button>
            )}

            <p className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#F5A623]">
              {flipped ? (isCompanion ? '💬 Reflection Guide' : 'Key Insight') : (isCompanion ? 'Prompt' : 'Concept Question')}
            </p>
            <p className="font-serif text-xl sm:text-2xl font-medium text-[#111111] leading-relaxed px-4">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && (
              <p className="text-xs text-neutral-400 mt-6 font-sans">
                {isCompanion ? 'Tap card to reveal reflections' : 'Tap card to reveal insight'}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6">
          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="w-full h-12 rounded-full border border-[#E4E4E7] bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#F5A623]" />
              <span>Reveal Card</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                id="flashcard-again"
                onClick={() => handleResponse('again')}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-xs sm:text-sm text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-all active:scale-[0.98]"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Need Review</span>
              </button>
              <button
                id="flashcard-gotit"
                onClick={() => handleResponse('got_it')}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-xs sm:text-sm text-white bg-[#111111] hover:bg-black transition-all active:scale-[0.98] shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F5A623]" />
                <span>Mastered</span>
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={() => { if (current + 1 >= cards.length) { setDone(true) } else { setCurrent(c => c + 1); setFlipped(false) } }}
          className="w-full text-center text-xs text-neutral-400 mt-4 py-2 hover:text-black transition-colors"
        >
          Skip this card →
        </button>

      </div>

      {/* Page Viewer Modal */}
      {card?.book_id && (
        <PageViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          bookId={card.book_id}
          pageNumber={card.page_number}
        />
      )}
    </AppShell>
  )
}
