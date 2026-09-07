'use client'

import { useRef, useState } from 'react'
import { Share2, Download } from 'lucide-react'

interface Props {
  insightText: string
  bookTitle: string
}

const THEMES = [
  { bg: 'from-brand-500 to-brand-700', text: 'text-white' },
  { bg: 'from-amber-400 to-orange-600', text: 'text-white' },
  { bg: 'from-emerald-400 to-teal-600', text: 'text-white' },
  { bg: 'from-purple-500 to-pink-600', text: 'text-white' },
]

function themeForInsight(text: string) {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash + text.charCodeAt(i)) % THEMES.length
  return THEMES[hash]
}

export default function ShareCard({ insightText, bookTitle }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const theme = themeForInsight(insightText)

  async function handleShare() {
    if (!cardRef.current) return
    setError('')
    setGenerating(true)
    try {
      // Dynamic import: html-to-image is only needed on this interaction,
      // no reason to ship it in the main bundle.
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'booktutor-insight.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'BookTutor Insight' })
      } else {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'booktutor-insight.png'
        link.click()
      }
    } catch (err) {
      setError('Could not generate the share image. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Off-screen render target sized for Instagram Story ratio */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div
          ref={cardRef}
          className={`w-[540px] h-[960px] bg-gradient-to-br ${theme.bg} flex flex-col justify-between p-12`}
        >
          <div />
          <p className={`text-4xl font-bold leading-snug ${theme.text}`}>{insightText}</p>
          <div>
            <p className={`text-lg font-medium ${theme.text} opacity-90`}>{bookTitle}</p>
            <p className={`text-sm ${theme.text} opacity-70 mt-1`}>via BookTutor</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        disabled={generating}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-brand-600 transition-colors disabled:opacity-50"
      >
        {generating ? <Download className="w-4 h-4 animate-pulse" /> : <Share2 className="w-4 h-4" />}
        {generating ? 'Generating...' : 'Share'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
