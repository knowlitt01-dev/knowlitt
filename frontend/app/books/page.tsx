'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload, HardDrive, BookOpen, Trash2, ChevronRight,
  CloudLightning, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api, ApiError } from '@/lib/api'
import AppShell from '@/components/AppShell'

interface Book { id: string; title: string; status: string }

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-app-text">My Books</h1>

        {/* ── Upload card ── */}
        <section>
          <label
            htmlFor={inputId}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-20 border-2 border-dashed
              transition-all duration-200 cursor-pointer py-10 px-6 text-center
              ${dragOver
                ? 'border-primary bg-primary-50 scale-[1.01]'
                : 'border-app-border bg-white hover:border-primary-200 hover:bg-primary-50/30'
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
                <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-primary font-semibold">Uploading…</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-20 bg-primary-50 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-app-text text-base">Drag & drop your PDF here</p>
                  <p className="text-app-subtext text-sm mt-1">or click to browse · up to 40 MB</p>
                </div>
              </>
            )}
          </label>
          {uploadError && <div className="alert-error mt-3">{uploadError}</div>}
        </section>

        {/* ── Connector status cards ── */}
        <section>
          <h2 className="section-title">Connected Sources</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'Google Drive', icon: HardDrive, color: 'text-[#4285F4]', bg: 'bg-blue-50', connected: false, href: '/connectors' },
              { name: 'Kindle', icon: BookOpen, color: 'text-[#FF9900]', bg: 'bg-amber-50', connected: false, href: '/connectors' },
            ].map(({ name, icon: Icon, color, bg, connected, href }) => (
              <div key={name} className="card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-12 ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-app-text text-sm">{name}</p>
                  <p className="text-xs text-app-subtext">{connected ? 'Connected' : 'Not connected'}</p>
                </div>
                {connected
                  ? <CheckCircle2 className="w-4 h-4 text-app-success flex-shrink-0" />
                  : (
                    <Link href={href} className="text-xs font-semibold text-primary hover:text-primary-700 transition-colors flex items-center gap-1">
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
            <h2 className="section-title mb-0">Your Library ({books.length})</h2>
          </div>
          {loadingBooks ? (
            <div className="card py-12 flex items-center justify-center">
              <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          ) : books.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="w-10 h-10 text-primary-200 mx-auto mb-3" />
              <p className="font-semibold text-app-text mb-1">No books yet</p>
              <p className="text-app-subtext text-sm">Upload your first PDF above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {books.map((book, i) => {
                const progress = (i * 17 + 10) % 90 + 5 // mock
                const daysLeft = Math.max(1, 21 - Math.floor(progress / 5))
                return (
                  <div key={book.id} className="card flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-12 bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-app-text text-sm truncate">{book.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[11px] text-app-subtext font-medium w-12 text-right flex-shrink-0">
                          {progress}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`badge ${book.status === 'processing' ? 'badge-accent' : 'badge-success'}`}>
                          {book.status === 'processing' ? '⏳ Processing' : '✓ Ready'}
                        </span>
                        <span className="text-[11px] text-app-subtext">{daysLeft} days left</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/books/${book.id}/setup`} className="p-2 rounded-10 hover:bg-primary-50 text-app-subtext hover:text-primary transition-colors">
                        <CloudLightning className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleRemove(book.id)}
                        className="p-2 rounded-10 hover:bg-red-50 text-app-subtext hover:text-app-error transition-colors"
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
