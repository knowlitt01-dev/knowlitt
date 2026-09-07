'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function AdminAnalytics() {
  const [overview, setOverview] = useState<any>(null)
  const [signups, setSignups] = useState<{ date: string; signups: number }[]>([])

  useEffect(() => {
    api.adminAnalyticsOverview().then(setOverview)
    api.adminSignupsOverTime(30).then(setSignups)
  }, [])

  if (!overview) return <p className="text-gray-500">Loading...</p>

  const metrics = [
    { label: 'Total Users', value: overview.total_users },
    { label: 'Active Subscriptions', value: overview.active_subscriptions },
    { label: 'Trialing', value: overview.trialing_users },
    { label: 'Churned', value: overview.churned_users },
    { label: 'Trial → Paid Rate', value: `${(overview.trial_to_paid_rate * 100).toFixed(1)}%` },
    { label: 'Books Uploaded', value: overview.total_books_uploaded },
    { label: 'Processing Failure Rate', value: `${(overview.book_processing_failure_rate * 100).toFixed(1)}%` },
    { label: 'Open Tickets', value: overview.open_support_tickets },
  ]

  const maxSignups = Math.max(1, ...signups.map((s) => s.signups))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Signups (last 30 days)</h2>
        {signups.length === 0 ? (
          <p className="text-sm text-gray-500">No signups yet</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {signups.map((s) => (
              <div key={s.date} className="flex-1 flex flex-col items-center justify-end" title={`${s.date}: ${s.signups}`}>
                <div
                  className="w-full bg-brand-500 rounded-t"
                  style={{ height: `${(s.signups / maxSignups) * 100}%`, minHeight: s.signups > 0 ? '4px' : '0' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
