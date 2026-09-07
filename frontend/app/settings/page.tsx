'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Send, CreditCard, LifeBuoy } from 'lucide-react'
import { useAuth, ApiError } from '@/components/AuthProvider'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [telegramLink, setTelegramLink] = useState('')
  const [telegramConfigured, setTelegramConfigured] = useState(true)

  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappConfigured, setWhatsappConfigured] = useState(true)
  const [whatsappSaving, setWhatsappSaving] = useState(false)
  const [whatsappError, setWhatsappError] = useState('')

  const [billing, setBilling] = useState<any>(null)

  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketSubmitted, setTicketSubmitted] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    loadTelegramStatus()
    loadBilling()
  }, [])

  async function loadTelegramStatus() {
    try {
      const status = await api.telegramStatus()
      setTelegramEnabled(status.enabled)
    } catch { /* not fatal */ }
  }

  async function loadBilling() {
    try {
      const status = await api.billingStatus()
      setBilling(status)
    } catch { /* not fatal */ }
  }

  async function handleConnectTelegram() {
    const { deep_link, configured } = await api.telegramLinkCode()
    setTelegramConfigured(configured)
    setTelegramLink(deep_link)
    if (configured) window.open(deep_link, '_blank')
  }

  async function handleWhatsappSave() {
    setWhatsappError('')
    setWhatsappSaving(true)
    try {
      const result = await api.updateWhatsapp(whatsappNumber, true)
      setWhatsappConfigured(result.configured)
      setWhatsappEnabled(result.whatsapp_enabled)
    } catch (err) {
      setWhatsappError(err instanceof ApiError ? err.message : 'Failed to save')
    } finally {
      setWhatsappSaving(false)
    }
  }

  async function handleWhatsappDisconnect() {
    await api.updateWhatsapp(null, false)
    setWhatsappEnabled(false)
  }

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault()
    await api.createTicket(ticketSubject, ticketMessage)
    setTicketSubmitted(true)
    setTicketSubject('')
    setTicketMessage('')
  }

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Subscription */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Subscription
          </h2>
          <div className="card">
            {billing ? (
              <>
                <p className="font-medium text-gray-900 capitalize">{billing.subscription_status}</p>
                {billing.subscription_status === 'trialing' && (
                  <p className="text-sm text-gray-600 mt-1">
                    {billing.trial_days_remaining} day{billing.trial_days_remaining !== 1 ? 's' : ''} left in your free trial
                  </p>
                )}
                {!billing.razorpay_configured && (
                  <p className="text-xs text-amber-600 mt-2">
                    Billing isn't configured yet — add Razorpay keys to enable subscriptions (see BILLING.md).
                  </p>
                )}
                <Link href="/upgrade" className="btn-secondary inline-block mt-3">
                  {billing.subscription_status === 'active' ? 'Manage subscription' : 'Upgrade'}
                </Link>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Loading...</p>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            {/* Telegram */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="font-medium text-gray-900">Telegram</p>
                    <p className="text-xs text-gray-500">{telegramEnabled ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>
                {!telegramEnabled && (
                  <button onClick={handleConnectTelegram} className="btn-secondary text-sm px-4 py-2">
                    Connect
                  </button>
                )}
              </div>
              {!telegramConfigured && telegramLink && (
                <p className="text-xs text-amber-600 mt-3">
                  Telegram isn't configured on the server yet (missing bot token) — see NOTIFICATIONS.md.
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-500">{whatsappEnabled ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
              {!whatsappEnabled ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    placeholder="+91XXXXXXXXXX"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="input"
                  />
                  {whatsappError && <p className="text-xs text-red-600">{whatsappError}</p>}
                  <button onClick={handleWhatsappSave} className="btn-secondary text-sm" disabled={whatsappSaving}>
                    {whatsappSaving ? 'Saving...' : 'Connect WhatsApp'}
                  </button>
                  {!whatsappConfigured && (
                    <p className="text-xs text-amber-600">
                      WhatsApp isn't configured on the server yet (missing Meta credentials) — see NOTIFICATIONS.md.
                    </p>
                  )}
                </div>
              ) : (
                <button onClick={handleWhatsappDisconnect} className="text-sm text-red-600 hover:text-red-700">
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5" /> Contact Support
          </h2>
          <div className="card">
            {ticketSubmitted ? (
              <p className="text-sm text-green-700">
                Thanks — we've got your message and will follow up soon.
              </p>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="input"
                  required
                />
                <textarea
                  placeholder="Describe the issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="input min-h-24"
                  required
                />
                <button type="submit" className="btn-primary">Submit</button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
