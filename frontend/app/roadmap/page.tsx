'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, BookOpen, AlertCircle, Compass } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface Book {
  id: string
  title: string
  status: string
}

interface RoadmapItem {
  id: string
  days: string
  chapter: string
  title: string
  state: 'done' | 'current' | 'upcoming'
  points: number
}

export default function RoadmapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Mock Roadmap data generated per chapter range
  const roadmapData: Record<string, RoadmapItem[]> = {
    default: [
      { id: '1', days: 'Day 1–3', chapter: 'Chapter 1', title: 'Introduction & Foundations', state: 'done', points: 15 },
      { id: '2', days: 'Day 4–7', chapter: 'Chapter 2', title: 'Core Principles of Learning', state: 'done', points: 25 },
      { id: '3', days: 'Day 8–11', chapter: 'Chapter 3', title: 'Application & Methods', state: 'current', points: 20 },
      { id: '4', days: 'Day 12–15', chapter: 'Chapter 4', title: 'Advanced Synthesis', state: 'upcoming', points: 30 },
      { id: '5', days: 'Day 16–20', chapter: 'Chapter 5', title: 'Summary & Integration', state: 'upcoming', points: 20 },
    ]
  }

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadBooks() {
      try {
        const list = await api.listBooks()
        setBooks(list)
        if (list.length > 0) {
          setSelectedBook(list[0].id)
        }
      } catch (err) {
        console.error('Failed to load books for roadmap:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [])

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeRoadmap = roadmapData[selectedBook] || roadmapData.default

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-app-text">Reading Roadmap</h1>
              <p className="text-xs text-app-subtext">Track your chapter schedule</p>
            </div>
          </div>
        </div>

        {books.length > 0 ? (
          <div className="space-y-6">
            {/* Book Selector */}
            <div className="card flex items-center justify-between py-3 px-4">
              <span className="text-xs font-semibold text-app-subtext flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" /> Select Book
              </span>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="bg-transparent text-sm font-semibold text-app-text outline-none cursor-pointer"
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>

            {/* Vertical Roadmap Timeline */}
            <div className="card space-y-8 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-app-border z-0" />

              {activeRoadmap.map((item, idx) => {
                const isDone = item.state === 'done'
                const isCurrent = item.state === 'current'
                const isUpcoming = item.state === 'upcoming'

                return (
                  <div key={item.id} className="flex gap-4 items-start relative z-10">
                    
                    {/* Status Circle indicator */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white flex-shrink-0">
                      {isDone && <CheckCircle2 className="w-6 h-6 text-app-success fill-white" />}
                      {isCurrent && <PlayCircle className="w-6 h-6 text-primary fill-white animate-pulse" />}
                      {isUpcoming && <Circle className="w-6 h-6 text-app-subtext fill-white" />}
                    </div>

                    {/* Timeline Content Card */}
                    <div className={`flex-1 p-4 rounded-16 border transition-all ${
                      isCurrent 
                        ? 'border-primary/30 bg-primary/5 shadow-sm'
                        : 'border-app-border bg-white'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDone 
                            ? 'bg-green-50 text-app-success' 
                            : isCurrent 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-gray-100 text-app-subtext'
                        }`}>
                          {item.days}
                        </span>
                        
                        <span className="text-xs font-semibold text-app-subtext">
                          +{item.points} pts
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-app-text mt-2">{item.chapter}</h3>
                      <p className="text-xs text-app-subtext mt-0.5">{item.title}</p>

                      {isCurrent && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                            Active reading block
                          </span>
                          <Link href="/review" className="text-xs font-bold text-primary hover:underline">
                            Open Flashcards
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <Compass className="w-12 h-12 text-primary-200 mx-auto mb-3" />
            <p className="font-semibold text-app-text mb-1">No roadmaps available</p>
            <p className="text-app-subtext text-sm mb-4">Please upload a book first to configure its learning roadmap.</p>
            <Link href="/books" className="btn-primary inline-flex">Upload Book</Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
