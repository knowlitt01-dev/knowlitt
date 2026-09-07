'use client'

import { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import DrivePicker from './DrivePicker'

interface UploadResult {
  filename: string
  status: 'ready' | 'failed'
  book_id?: string
  error?: string
}

interface Props {
  onUploadComplete: () => void
}

export default function BookUpload({ onUploadComplete }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const [error, setError] = useState('')
  const dragRef = useRef<HTMLDivElement>(null)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    dragRef.current?.classList.add('ring-2', 'ring-brand-400', 'bg-brand-50')
  }

  function handleDragLeave() {
    dragRef.current?.classList.remove('ring-2', 'ring-brand-400', 'bg-brand-50')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleDragLeave()
    const newFiles = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf')
    if (newFiles.length === 0) {
      setError('Only PDF files are supported')
      return
    }
    setFiles((prev) => [...prev, ...newFiles])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.currentTarget.files || [])
    setFiles((prev) => [...prev, ...newFiles])
  }

  async function handleUpload() {
    if (files.length === 0) return
    setError('')
    setUploading(true)
    try {
      const res = await api.uploadBooks(files)
      setResults(res.results)
      setFiles([])
      if (res.results.some((r: UploadResult) => r.status === 'ready')) {
        setTimeout(onUploadComplete, 1000)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={dragRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="card border-2 border-dashed border-gray-300 hover:border-brand-400 transition-colors cursor-pointer"
      >
        <label className="block text-center py-8 cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Drag PDF files here or click to browse</p>
          <p className="text-sm text-gray-500 mt-1">Supported: PDF files up to 40MB</p>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <DrivePicker onImportComplete={onUploadComplete} />

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
          <button onClick={handleUpload} className="btn-primary w-full" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.filename}
              className="flex items-start gap-3 card"
            >
              {r.status === 'ready' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{r.filename}</p>
                {r.error && <p className="text-xs text-red-600 mt-1">{r.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
