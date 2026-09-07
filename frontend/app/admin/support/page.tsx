'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  admin_notes: string | null
  created_at: string
  user_email: string
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => { loadTickets() }, [filter])

  async function loadTickets() {
    const data = await api.adminListTickets(filter || undefined)
    setTickets(data)
  }

  async function updateStatus(ticket: Ticket, status: string) {
    await api.adminUpdateTicket(ticket.id, { status })
    loadTickets()
    if (selected?.id === ticket.id) setSelected({ ...ticket, status })
  }

  async function saveNotes() {
    if (!selected) return
    await api.adminUpdateTicket(selected.id, { admin_notes: notes })
    loadTickets()
  }

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets found</p>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setNotes(t.admin_notes || '') }}
                className={`card w-full text-left ${selected?.id === t.id ? 'ring-2 ring-brand-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 text-sm">{t.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-xs text-gray-500">{t.user_email}</p>
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="card space-y-4">
            <div>
              <p className="text-xs text-gray-500">{selected.user_email}</p>
              <h3 className="font-bold text-gray-900">{selected.subject}</h3>
            </div>
            <p className="text-sm text-gray-700">{selected.message}</p>

            <div className="flex gap-2">
              {['open', 'in_progress', 'resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected, s)}
                  className={`text-xs px-3 py-1.5 rounded ${
                    selected.status === s ? statusColors[s] : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Admin notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" />
              <button onClick={saveNotes} className="btn-secondary text-sm mt-2">Save notes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
