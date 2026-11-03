'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import PageViewerModal from '@/components/PageViewerModal'

interface Props {
  front: string
  back: string
  onReview: (response: string) => Promise<void>
  disabled?: boolean
  bookId?: string
  pageNumber?: number | null
}

const RESPONSES = [
  { key: 'again', label: 'Again', color: 'bg-red-600 hover:bg-red-700' },
  { key: 'hard', label: 'Hard', color: 'bg-orange-600 hover:bg-orange-700' },
  { key: 'good', label: 'Good', color: 'bg-blue-600 hover:bg-blue-700' },
  { key: 'easy', label: 'Easy', color: 'bg-green-600 hover:bg-green-700' },
]

export default function Flashcard({ front, back, onReview, disabled, bookId, pageNumber }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [responding, setResponding] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  async function handleResponse(key: string) {
    setResponding(true)
    try {
      await onReview(key)
    } finally {
      setResponding(false)
      setFlipped(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        onClick={() => !disabled && setFlipped(!flipped)}
        className={`h-80 rounded-2xl shadow-lg cursor-pointer transition-all transform ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s',
        }}
      >
        <div
          className={`w-full h-full rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center relative ${
            flipped ? 'bg-amber-50/60 border border-amber-200' : 'bg-white border border-neutral-200'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Source button */}
          {bookId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setViewerOpen(true)
              }}
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-all shadow-sm"
              title="View original book page"
            >
              <FileText className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>{pageNumber ? `Page ${pageNumber}` : 'See in Book'}</span>
            </button>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">
              {flipped ? 'Answer' : 'Question'}
            </p>
            <p className="text-xl sm:text-2xl font-serif font-medium text-gray-900 leading-relaxed px-4">
              {flipped ? back : front}
            </p>
          </div>
        </div>
      </div>

      {!flipped ? (
        <button
          onClick={() => setFlipped(true)}
          className="btn-secondary w-full"
          disabled={disabled}
        >
          Show Answer
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {RESPONSES.map((r) => (
            <button
              key={r.key}
              onClick={() => handleResponse(r.key)}
              className={`text-white font-medium py-3 rounded-xl transition-colors ${r.color} disabled:opacity-50`}
              disabled={responding || disabled}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Page viewer modal */}
      {bookId && (
        <PageViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          bookId={bookId}
          pageNumber={pageNumber}
        />
      )}
    </div>
  )
}
