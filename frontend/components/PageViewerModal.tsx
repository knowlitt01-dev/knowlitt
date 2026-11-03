'use client'

import { useState } from 'react'
import { FileText, X, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface PageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  bookId?: string
  pageNumber?: number | null
}

export default function PageViewerModal({
  isOpen,
  onClose,
  bookId,
  pageNumber,
}: PageViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(pageNumber || 1)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageData, setPageData] = useState<{
    image_b64?: string
    text?: string
    type?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = async (page: number) => {
    if (!bookId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.getBookPage(bookId, page)
      setPageData(res)
      setCurrentPage(res.page_number)
      setTotalPages(res.total_pages)
    } catch (err: any) {
      setError(err?.message || 'Could not load original page from book PDF.')
    } finally {
      setLoading(false)
    }
  }

  // Trigger fetch when modal opens
  useState(() => {
    if (isOpen && pageNumber) {
      setCurrentPage(pageNumber)
      fetchPage(pageNumber)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[28px] border border-[#E4E4E7] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] bg-[#FAFAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF5E8] flex items-center justify-center text-[#C2720F]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-neutral-900 text-sm">
                Original Book Page
              </h3>
              <p className="text-[11px] text-neutral-500">
                {totalPages ? `Page ${currentPage} of ${totalPages}` : `Page ${currentPage}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[350px] bg-neutral-50/50">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#F5A623]" />
              <p className="text-xs font-medium">Extracting source document...</p>
            </div>
          ) : error ? (
            <div className="text-center max-w-md p-6 bg-white rounded-2xl border border-neutral-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-semibold text-sm text-neutral-800">Original Page Unavailable</p>
              <p className="text-xs text-neutral-500 mt-1">{error}</p>
            </div>
          ) : pageData?.image_b64 ? (
            <img
              src={`data:image/png;base64,${pageData.image_b64}`}
              alt={`Page ${currentPage}`}
              className="max-h-[65vh] w-auto rounded-lg shadow-md border border-neutral-200 object-contain"
            />
          ) : pageData?.text ? (
            <div className="w-full max-w-xl bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm font-serif text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {pageData.text}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">No content found for this page.</p>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E4E4E7] bg-white">
          <button
            disabled={currentPage <= 1 || loading}
            onClick={() => fetchPage(currentPage - 1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous Page
          </button>
          <span className="text-xs font-medium text-neutral-500">
            Page {currentPage} {totalPages ? `/ ${totalPages}` : ''}
          </span>
          <button
            disabled={(totalPages ? currentPage >= totalPages : false) || loading}
            onClick={() => fetchPage(currentPage + 1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
          >
            Next Page <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

