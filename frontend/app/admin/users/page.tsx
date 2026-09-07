'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface AdminUser {
  id: string
  email: string
  created_at: string
  subscription_status: string
  book_count: number
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { loadUsers() }, [search])

  async function loadUsers() {
    const data = await api.adminListUsers(search || undefined)
    setUsers(data)
  }

  async function extendTrial(userId: string) {
    await api.adminExtendTrial(userId, 7)
    loadUsers()
  }

  async function setStatus(userId: string, status: string) {
    await api.adminSetSubscriptionStatus(userId, status)
    loadUsers()
  }

  const statusColors: Record<string, string> = {
    trialing: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Books</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[u.subscription_status]}`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3">{u.book_count}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => extendTrial(u.id)} className="text-xs text-brand-600 hover:underline">
                      +7d trial
                    </button>
                    <button onClick={() => setStatus(u.id, 'active')} className="text-xs text-green-600 hover:underline">
                      Mark active
                    </button>
                    <button onClick={() => setStatus(u.id, 'expired')} className="text-xs text-red-600 hover:underline">
                      Disable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No users found</p>}
      </div>
    </div>
  )
}
