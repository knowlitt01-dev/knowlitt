'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import ShareCard from './ShareCard'

interface Insight {
  id: string
  text: string
  type: string
  book_id: string
}

interface DailyDigestData {
  insights: Insight[]
  count: number
}

export default function DailyDigest() {
  const [data, setData] = useState<DailyDigestData | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDaily()
  }, [])

  async function loadDaily() {
    try {
      const result = await api.dailyToday()
      setData(result)
    } catch (err) {
      console.error('Failed to load daily digest:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!data || data.insights.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600">No insights for today. Upload a book to get started!</p>
      </div>
    )
  }

  const typeColors: Record<string, string> = {
    concept: 'bg-blue-100 text-blue-800',
    example: 'bg-green-100 text-green-800',
    quote: 'bg-purple-100 text-purple-800',
    framework: 'bg-amber-100 text-amber-800',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Today's Lesson</h2>
        <span className="text-xs font-medium text-gray-600">{data.insights.length} insights</span>
      </div>

      <div className="space-y-2">
        {data.insights.map((insight, idx) => (
          <div key={insight.id} className="card">
            <button
              onClick={() => setExpanded((e) => ({ ...e, [insight.id]: !e[insight.id] }))}
              className="w-full text-left flex items-start gap-3"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${
                  expanded[insight.id] ? 'rotate-180' : ''
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">
                  {idx + 1} of {data.insights.length}
                </p>
                <p className="font-medium text-gray-900 line-clamp-2">{insight.text}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                  typeColors[insight.type] || typeColors.concept
                }`}
              >
                {insight.type}
              </span>
            </button>
            {expanded[insight.id] && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <p className="text-sm text-gray-700">{insight.text}</p>
                <ShareCard insightText={insight.text} bookTitle="BookTutor" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
