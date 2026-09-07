'use client'

import { useState } from 'react'

interface Props {
  front: string
  back: string
  onReview: (response: string) => Promise<void>
  disabled?: boolean
}

const RESPONSES = [
  { key: 'again', label: 'Again', color: 'bg-red-600 hover:bg-red-700' },
  { key: 'hard', label: 'Hard', color: 'bg-orange-600 hover:bg-orange-700' },
  { key: 'good', label: 'Good', color: 'bg-blue-600 hover:bg-blue-700' },
  { key: 'easy', label: 'Easy', color: 'bg-green-600 hover:bg-green-700' },
]

export default function Flashcard({ front, back, onReview, disabled }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [responding, setResponding] = useState(false)

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
          className={`w-full h-full rounded-2xl shadow-lg p-8 flex items-center justify-center text-center ${
            flipped ? 'bg-green-50' : 'bg-brand-50'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              {flipped ? 'Answer' : 'Question'}
            </p>
            <p className="text-2xl font-bold text-gray-900 leading-relaxed">
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
    </div>
  )
}
