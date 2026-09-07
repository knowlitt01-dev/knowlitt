'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Check, Bell, BookOpen, Clock, Send } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface Book {
  id: string
  title: string
  status: string
}

export default function BookSetupPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [days, setDays] = useState<number>(14)
  const [customDays, setCustomDays] = useState<string>('')
  const [isCustomDaysActive, setIsCustomDaysActive] = useState(false)
  const [notificationsPerDay, setNotificationsPerDay] = useState<number>(2)
  const [contentPerSession, setContentPerSession] = useState<'pages' | 'chapter'>('chapter')
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00', '18:00'])
  const [channel, setChannel] = useState<'app' | 'whatsapp' | 'telegram'>('app')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const timeOptions = [
    '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '21:00', '22:00'
  ]

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadBook() {
      try {
        const list = await api.listBooks()
        const found = list.find((b: any) => b.id === id)
        if (found) {
          setBook(found)
        } else {
          setError('Book not found')
        }
      } catch (err) {
        console.error('Failed to load book:', err)
        setError('Failed to load book information')
      } finally {
        setLoading(false)
      }
    }
    if (id) loadBook()
  }, [id])

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time))
    } else {
      setSelectedTimes([...selectedTimes, time])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const finalDays = isCustomDaysActive ? parseInt(customDays) || 14 : days
      // Wire up configuration save logic
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulation
      router.push('/books')
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center gap-3">
          <Link href="/books" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-app-text">Book setup</h1>
            <p className="text-xs text-app-subtext">Configure your study plan</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {book && (
          <div className="card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-16 bg-white rounded-10 shadow-sm border border-app-border flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="badge badge-primary mb-1">Set study plan</span>
                <h2 className="text-base font-bold text-app-text leading-snug line-clamp-1">{book.title}</h2>
                <p className="text-xs text-app-subtext mt-0.5 capitalize">Status: {book.status}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card space-y-6">
          {/* Days to Finish */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-app-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> How many days to finish?
            </label>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDays(d)
                    setIsCustomDaysActive(false)
                  }}
                  className={`chip ${!isCustomDaysActive && days === d ? 'chip-active' : ''}`}
                >
                  {d} days
                </button>
              ))}
              <button
                onClick={() => setIsCustomDaysActive(true)}
                className={`chip ${isCustomDaysActive ? 'chip-active' : ''}`}
              >
                Custom
              </button>
            </div>
            
            {isCustomDaysActive && (
              <div className="flex items-center gap-2 mt-2 max-w-[200px]">
                <input
                  type="number"
                  placeholder="Enter days"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="input py-2 px-3"
                  min="1"
                />
                <span className="text-sm text-app-subtext">days</span>
              </div>
            )}
          </div>

          <hr className="border-app-border" />

          {/* Notifications Per Day */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-app-text flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Daily lesson reminders
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setNotificationsPerDay(num)}
                  className={`chip ${notificationsPerDay === num ? 'chip-active' : ''}`}
                >
                  {num} per day
                </button>
              ))}
            </div>
          </div>

          <hr className="border-app-border" />

          {/* Content Per Session */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-app-text flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Pace per session
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setContentPerSession('chapter')}
                className={`flex-1 p-4 rounded-16 border text-left transition-all ${
                  contentPerSession === 'chapter'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-app-border bg-white hover:bg-app-bg'
                }`}
              >
                <div className="font-semibold text-sm">Full Chapter</div>
                <div className="text-xs text-app-subtext mt-1">Receive digests by chapter breaks (Recommended)</div>
              </button>
              <button
                onClick={() => setContentPerSession('pages')}
                className={`flex-1 p-4 rounded-16 border text-left transition-all ${
                  contentPerSession === 'pages'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-app-border bg-white hover:bg-app-bg'
                }`}
              >
                <div className="font-semibold text-sm">Fixed Pages</div>
                <div className="text-xs text-app-subtext mt-1">Receive digests every 10–15 pages sequentially</div>
              </button>
            </div>
          </div>

          <hr className="border-app-border" />

          {/* Preferred Times */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-app-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Preferred delivery times
            </label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((time) => {
                const isSelected = selectedTimes.includes(time)
                return (
                  <button
                    key={time}
                    onClick={() => toggleTime(time)}
                    className={`chip ${isSelected ? 'chip-active' : ''}`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-app-subtext">reminders will fire at these times matching your timezone.</p>
          </div>

          <hr className="border-app-border" />

          {/* Delivery Channel */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-app-text flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" /> Delivery channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'app', label: 'App / PWA' },
                { key: 'whatsapp', label: 'WhatsApp' },
                { key: 'telegram', label: 'Telegram' }
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setChannel(c.key as any)}
                  className={`p-3 rounded-12 border text-center transition-all text-xs font-semibold ${
                    channel === c.key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-app-border bg-white hover:bg-app-bg'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-end gap-3">
          <Link href="/books" className="btn-secondary">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? 'Saving settings...' : 'Activate study plan'}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  )
}
