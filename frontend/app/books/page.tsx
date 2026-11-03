'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload, HardDrive, BookOpen, Trash2, ChevronRight,
  CloudLightning, AlertCircle, CheckCircle2, Play, FileText,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api, ApiError } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface Book {
  id: string
  title: string
  status: string
  genre?: string | null
  sub_genre?: string | null
  content_mode?: 'extraction' | 'companion' | null
}

export default function BooksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks]         = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver]   = useState(false)

  useEffect(() => { if (!authLoading && !user) router.push('/login') }, [user, authLoading, router])
  useEffect(() => { loadBooks() }, [])

  async function loadBooks() {
    try { setBooks(await api.listBooks()) }
    catch { /* non-fatal */ }
    finally { setLoadingBooks(false) }
  }

  async function handleFile(file: File) {
    setUploadError('')
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.')
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadBooks([file])
      const failed = res.results?.filter((r: any) => r.status === 'failed')
      if (failed?.length) setUploadError(failed[0].error || 'Upload failed')
      await loadBooks()
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove this book?')) return
    try { await (api as any).deleteBook?.(id); await loadBooks() } catch { /* stub */ }
  }

  const inputId = 'book-file-input'

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#F5A623] mb-1">Personal Collection</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#111111]">My Books</h1>
        </div>

        {/* ── Upload card ── */}
        <section>
          <label
            htmlFor={inputId}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed
              transition-all duration-300 cursor-pointer py-10 px-6 text-center shadow-sm
              ${dragOver
                ? 'border-[#F5A623] bg-[#FFFBF5] scale-[1.01]'
                : 'border-[#E4E4E7] bg-white hover:border-[#F5A623] hover:bg-[#FFFBF5]/50'
              }
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) handleFile(f)
            }}
          >
            <input
              id={inputId}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {uploading ? (
              <>
                <svg className="animate-spin w-8 h-8 text-[#F5A623]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-[#C2720F] font-semibold text-sm">Uploading & generating reading schedule…</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#FFF5E8] flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#F5A623]" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-neutral-900">Drag & drop your book PDF here</p>
                  <p className="text-neutral-500 text-xs sm:text-sm mt-1">Automatic AI classification into Companion or Extraction reading mode</p>
                </div>
              </>
            )}
          </label>
          {uploadError && <div className="rounded-16 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs mt-3">{uploadError}</div>}
        </section>

        {/* ── Connector status cards ── */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-[#111111] mb-3">Connected Sources</h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {[
              { name: 'Google Drive', icon: HardDrive, color: 'text-[#4285F4]', bg: 'bg-blue-50', connected: false, href: '/connectors' },
              { name: 'Kindle Clippings', icon: BookOpen, color: 'text-[#FF9900]', bg: 'bg-amber-50', connected: false, href: '/connectors' },
            ].map(({ name, icon: Icon, color, bg, connected, href }) => (
              <div key={name} className="bg-white rounded-[20px] border border-[#E4E4E7] p-4 flex items-center gap-3.5 shadow-sm">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">{name}</p>
                  <p className="text-xs text-neutral-400">{connected ? 'Connected' : 'Not connected'}</p>
                </div>
                {connected
                  ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  : (
                    <Link href={href} className="text-xs font-semibold text-[#C2720F] hover:underline flex items-center gap-1">
                      Connect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )
                }
              </div>
            ))}
          </div>
        </section>

        {/* ── Library list ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl font-semibold text-[#111111]">Your Bookshelf ({books.length})</h2>
          </div>
          {loadingBooks ? (
            <div className="bg-white rounded-[24px] border border-[#E4E4E7] py-12 flex items-center justify-center shadow-sm">
              <svg className="animate-spin w-6 h-6 text-[#F5A623]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-[#E4E4E7] text-center py-12 px-4 shadow-sm">
              <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="font-serif text-lg font-semibold text-neutral-900 mb-1">Your bookshelf is empty</p>
              <p className="text-neutral-500 text-xs sm:text-sm">Upload your first book PDF above to begin learning.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((book, i) => {
                const progress = (i * 17 + 10) % 90 + 5
                const daysLeft = Math.max(1, 21 - Math.floor(progress / 5))
                const isCompanion = book.content_mode === 'companion'
                return (
                  <div key={book.id} className="bg-white rounded-[24px] border border-[#E4E4E7] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all group shadow-sm">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCompanion ? 'bg-[#FFF5E8] text-[#C2720F]' : 'bg-neutral-100 text-neutral-800'}`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-serif font-semibold text-neutral-900 text-base truncate">{book.title}</p>
                          {book.content_mode && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isCompanion ? 'bg-[#FFF5E8] text-[#C2720F] border-[#FFE9C9]' : 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                              {isCompanion ? '📖 Companion' : '🧠 Extraction'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${book.status === 'processing' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {book.status === 'processing' ? '⏳ Processing' : '✓ Ready'}
                          </span>
                          {book.genre && (
                            <span className="text-[11px] text-neutral-400 capitalize">{book.genre}{book.sub_genre ? ` (${book.sub_genre})` : ''}</span>
                          )}
                          <span className="text-[11px] text-neutral-400">{daysLeft} days remaining</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons including Start button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Start / Roadmap button */}
                      <Link
                        href={`/books/${book.id}/roadmap`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                        <span>Start</span>
                      </Link>

                      <Link
                        href={`/books/${book.id}/summary`}
                        className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
                        title="AI Summary"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/books/${book.id}/setup`}
                        className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
                        title="Book Setup"
                      >
                        <CloudLightning className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleRemove(book.id)}
                        className="p-2.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Remove book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </AppShell>
  )
}
