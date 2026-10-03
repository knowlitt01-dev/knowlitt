'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, RotateCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface DueCard {
  card_id: string
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
        <div className="card text-center py-16 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-app-text mb-2">
            {done ? 'Session complete! 🎉' : 'All caught up!'}
          </h2>
          <p className="text-app-subtext text-sm mb-6">
            {done
              ? `You reviewed ${cards.length} card${cards.length !== 1 ? 's' : ''}. Great work!`
              : 'No cards due right now. Come back later!'}
          </p>
          <Link href="/" className="btn-primary inline-flex">Back to Home</Link>
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
          <Link href="/" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-app-text">{isCompanion ? 'Reflection Questions' : 'Flashcards'}</h1>
            <p className="text-xs text-app-subtext mt-0.5">{card.book_title || `Card ${current + 1} of ${cards.length}`}</p>
          </div>
          <span className={`badge ${isCompanion ? 'bg-amber-50 text-amber-700 border-amber-200' : 'badge-primary'}`}>
            {isCompanion ? '💬 Reflection' : `${Math.round((current / cards.length) * 100)}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
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
              rounded-20 p-8 min-h-[260px] flex flex-col items-center justify-center text-center
              transition-all duration-500 shadow-card
              ${flipped
                ? (isCompanion ? 'bg-amber-50/70 border border-amber-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100')
                : 'bg-white border border-app-border'
              }
            `}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${flipped ? (isCompanion ? 'text-amber-700' : 'text-green-600') : 'text-app-subtext'}`}>
              {flipped ? (isCompanion ? '💬 Reflection Guide' : '✓ Answer') : (isCompanion ? '💬 Reflection Prompt' : 'Question')}
            </p>
            <p className="text-xl font-semibold text-app-text leading-relaxed">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && (
              <p className="text-xs text-app-subtext mt-6 animate-pulse">
                {isCompanion ? 'Tap to reveal reflection thoughts' : 'Tap to reveal answer'}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6">
          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Show Answer
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                id="flashcard-again"
                onClick={() => handleResponse('again')}
                className="flex items-center justify-center gap-2 rounded-16 py-4 font-bold text-white bg-app-error hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5" />
                Again
              </button>
              <button
                id="flashcard-gotit"
                onClick={() => handleResponse('got_it')}
                className="flex items-center justify-center gap-2 rounded-16 py-4 font-bold text-white bg-app-success hover:bg-green-700 transition-colors active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                Got it!
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={() => { if (current + 1 >= cards.length) { setDone(true) } else { setCurrent(c => c + 1); setFlipped(false) } }}
          className="w-full text-center text-xs text-app-subtext mt-4 py-2 hover:text-app-text transition-colors"
        >
          Skip this card →
        </button>

      </div>
    </AppShell>
  )
}
