'use client'

import { useState } from 'react'
import {
  CheckCircle2, Lock, Play, BookOpen, Sparkles, Award, FileText, ChevronRight, X, ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'
import PageViewerModal from '@/components/PageViewerModal'

export interface LevelItem {
  id: string
  level_index: number
  title: string
  description?: string
  level_type: 'reading' | 'summary' | 'review' | 'quiz'
  xp_points: number
  state: 'completed' | 'available' | 'locked' | 'in_progress'
}

interface Props {
  bookId: string
  bookTitle: string
  levels: LevelItem[]
  onLevelCompleted: () => void
}

export default function CandyCrushRoadmap({ bookId, bookTitle, levels, onLevelCompleted }: Props) {
  const [activeLevel, setActiveLevel] = useState<LevelItem | null>(null)
  const [levelContent, setLevelContent] = useState<any | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [viewerPage, setViewerPage] = useState<number | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleOpenLevel = async (level: LevelItem) => {
    if (level.state === 'locked') return
    setActiveLevel(level)
    setLoadingContent(true)
    try {
      const data = await api.getLevelContent(bookId, level.id)
      setLevelContent(data)
    } catch (err) {
      console.error('Failed to load level content:', err)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleComplete = async () => {
    if (!activeLevel) return
    setCompleting(true)
    try {
      await api.completeLevel(bookId, activeLevel.id)
      onLevelCompleted()
      setActiveLevel(null)
      setLevelContent(null)
    } catch (err) {
      console.error('Failed to mark level complete:', err)
    } finally {
      setCompleting(false)
    }
  }

  // Calculate winding X-offsets for the Candy Crush zigzag path
  const getOffsetClass = (index: number) => {
    const cycle = index % 4
    if (cycle === 0) return 'translate-x-0'
    if (cycle === 1) return 'translate-x-12 sm:translate-x-20'
    if (cycle === 2) return 'translate-x-0'
    return '-translate-x-12 sm:-translate-x-20'
  }

  return (
    <div className="relative py-8 flex flex-col items-center">
      {/* Visual vertical winding SVG connector line behind nodes */}
      <div className="absolute top-12 bottom-12 w-2 rounded-full bg-gradient-to-b from-[#FFE9C9] via-[#F5A623]/30 to-neutral-200 z-0" />

      {/* Nodes list */}
      <div className="space-y-12 relative z-10 w-full max-w-md flex flex-col items-center">
        {levels.map((level, idx) => {
          const isDone = level.state === 'completed'
          const isCurrent = level.state === 'available' || level.state === 'in_progress'
          const isLocked = level.state === 'locked'

          return (
            <div
              key={level.id}
              className={`flex flex-col items-center transition-all duration-300 ${getOffsetClass(idx)}`}
            >
              {/* Level Circle Button */}
              <button
                disabled={isLocked}
                onClick={() => handleOpenLevel(level)}
                className={`
                  relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center
                  border-4 transition-all duration-300 shadow-lg active:scale-95
                  ${isDone
                    ? 'bg-[#111111] border-[#F5A623] text-white shadow-amber-900/10 hover:scale-105'
                    : isCurrent
                      ? 'bg-gradient-to-br from-[#F5A623] to-[#E08A00] border-white text-white shadow-amber-500/30 scale-110 animate-bounce'
                      : 'bg-white border-neutral-300 text-neutral-400 cursor-not-allowed opacity-80'
                  }
                `}
                style={{ animationDuration: '3s' }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#F5A623]" />
                ) : isCurrent ? (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-1" />
                ) : (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                )}

                {/* Level Index Pill */}
                <span
                  className={`
                    absolute -bottom-2 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm
                    ${isCurrent ? 'bg-[#111111] text-white border-white' : 'bg-white text-neutral-700 border-neutral-200'}
                  `}
                >
                  {idx + 1}
                </span>
              </button>

              {/* Title label underneath node */}
              <div className="mt-3 text-center max-w-[160px]">
                <p className={`text-xs font-semibold leading-tight line-clamp-2 ${isCurrent ? 'text-neutral-900 font-bold' : isDone ? 'text-neutral-800' : 'text-neutral-400'}`}>
                  {level.title}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-[#C2720F] uppercase tracking-wider">
                    +{level.xp_points} XP
                  </span>
                  <span className="text-[10px] text-neutral-400 capitalize">• {level.level_type}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Level Content Drawer / Modal */}
      {activeLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E4E7] bg-[#FAFAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F5A623] flex items-center justify-center font-bold text-sm">
                  {activeLevel.level_index + 1}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-neutral-900">
                    {activeLevel.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {bookTitle} • <span className="text-[#C2720F] font-bold">+{activeLevel.xp_points} XP</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setActiveLevel(null); setLevelContent(null) }}
                className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingContent ? (
                <div className="py-16 text-center text-neutral-400">
                  <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs">Unlocking milestone content...</p>
                </div>
              ) : levelContent?.insights?.length ? (
                <div className="space-y-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Key Ideas in this Milestone ({levelContent.insights.length})
                  </p>
                  {levelContent.insights.map((ins: any, i: number) => (
                    <div
                      key={ins.id || i}
                      className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-2 relative group hover:border-[#F5A623]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600">
                          {ins.type || 'Concept'}
                        </span>
                        {/* View Source Page button */}
                        <button
                          type="button"
                          onClick={() => {
                            setViewerPage(ins.page_number || 1)
                            setViewerOpen(true)
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#C2720F] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{ins.page_number ? `Page ${ins.page_number}` : 'See in Book'}</span>
                        </button>
                      </div>
                      <p className="font-serif text-sm text-neutral-900 leading-relaxed">
                        {ins.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                  <p className="text-sm font-semibold text-neutral-800">Milestone Overview</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activeLevel.description || 'Read through your book or review concepts to complete this milestone.'}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#E4E4E7] bg-[#FAFAFC] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                Reward: <span className="font-bold text-neutral-900">+{activeLevel.xp_points} XP</span>
              </span>
              <button
                disabled={completing}
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {completing ? (
                  <span>Saving progress...</span>
                ) : (
                  <>
                    <span>Mark Complete & Unlock Next</span>
                    <span className="text-[#F5A623]">➔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Viewer Modal */}
      <PageViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        bookId={bookId}
        pageNumber={viewerPage}
      />
    </div>
  )
}

