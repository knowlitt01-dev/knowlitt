'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Flame, Radio, Plus, Compass, Sparkles, BookOpen } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'

export default function DiscoverPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [domainMode, setDomainMode] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('Tech & AI')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const domainTags = [
    'Tech & AI', 'Business', 'History', 'Philosophy', 'Science', 'Self Help', 'Finance', 'Psychology'
  ]

  const trendingBooks = [
    { id: 't1', title: 'Atomic Habits', author: 'James Clear', reads: '14.2k reads', category: 'Self Help' },
    { id: 't2', title: 'Zero to One', author: 'Peter Thiel', reads: '9.8k reads', category: 'Business' },
    { id: 't3', title: 'Sapiens', author: 'Yuval Noah Harari', reads: '18.5k reads', category: 'History' },
    { id: 't4', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', reads: '12.1k reads', category: 'Psychology' }
  ]

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-app-text">Search & Discover</h1>
            <p className="text-xs text-app-subtext">Find topics, books, or follow article streams</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-subtext" />
          <input
            type="text"
            placeholder="Search books, authors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 py-3.5 text-base"
          />
        </div>

        {/* Domain News Mode Toggle Card */}
        <div className="card space-y-4 border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-12 bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Radio className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-text">No book right now?</h3>
                <p className="text-xs text-app-subtext mt-0.5 leading-relaxed">
                  Turn on your favorite topic domain to receive daily news summaries & reminders in notification mode.
                </p>
              </div>
            </div>
            
            {/* Toggle switch */}
            <div 
              onClick={() => setDomainMode(!domainMode)}
              className={`toggle-track flex-shrink-0 ${domainMode ? 'toggle-track-on' : ''}`}
            >
              <div className={`toggle-thumb ${domainMode ? 'toggle-thumb-on' : ''}`} />
            </div>
          </div>

          {domainMode && (
            <div className="space-y-2 pt-2 border-t border-app-border/40">
              <p className="text-[11px] font-semibold text-app-subtext uppercase tracking-wider">Choose your active domain</p>
              <div className="flex flex-wrap gap-1.5">
                {domainTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedDomain(tag)}
                    className={`chip text-xs px-3 py-1 ${selectedDomain === tag ? 'chip-active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="bg-white/80 p-3 rounded-12 border border-app-border/50 text-xs text-app-subtext flex items-center gap-2 mt-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Active: Delivering <b>{selectedDomain}</b> daily brief notifications.</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested tags */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-app-subtext uppercase tracking-wider">Suggested topics</h2>
          <div className="flex flex-wrap gap-2">
            {domainTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag)
                  setDomainMode(true)
                  setSelectedDomain(tag)
                }}
                className="chip text-xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Trending books row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-app-subtext uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" /> Trending Books
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {trendingBooks.map((book) => (
              <div key={book.id} className="card-hover flex flex-col justify-between p-4 space-y-4">
                <div>
                  <span className="badge badge-primary text-[9px] py-0.5 px-1.5">{book.category}</span>
                  <h4 className="text-sm font-bold text-app-text mt-2 leading-tight line-clamp-1">{book.title}</h4>
                  <p className="text-xs text-app-subtext mt-0.5">{book.author}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-app-border/40">
                  <span className="text-[10px] text-app-subtext font-medium">{book.reads}</span>
                  <button className="p-1.5 rounded-8 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
