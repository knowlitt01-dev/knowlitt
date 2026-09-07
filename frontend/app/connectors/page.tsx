'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plug, HardDrive, MessageCircle, Send, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/AppShell'

export default function ConnectorsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // Statuses
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(false)
  const [kindleEnabled, setKindleEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(true) // Email is connected by default

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadStatus() {
      try {
        const tg = await api.telegramStatus()
        setTelegramEnabled(tg.enabled)
        // Others can be loaded or set defaults
      } catch (err) {
        console.warn('Failed to load connector status:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  const handleToggle = async (type: string, current: boolean) => {
    if (type === 'telegram') {
      if (!current) {
        const { deep_link } = await api.telegramLinkCode()
        window.open(deep_link, '_blank')
        setTelegramEnabled(true)
      } else {
        // Disconnect
        setTelegramEnabled(false)
      }
    } else if (type === 'whatsapp') {
      if (!current) {
        const num = prompt('Enter WhatsApp Number with country code (+91XXXXXXXXXX):')
        if (num) {
          await api.updateWhatsapp(num, true)
          setWhatsappEnabled(true)
        }
      } else {
        await api.updateWhatsapp(null, false)
        setWhatsappEnabled(false)
      }
    } else if (type === 'google_drive') {
      setGoogleDriveEnabled(!current)
    } else if (type === 'kindle') {
      setKindleEnabled(!current)
    } else if (type === 'email') {
      setEmailEnabled(!current)
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const connectors = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Import PDF files directly from your personal storage folders.',
      icon: HardDrive,
      connected: googleDriveEnabled,
      color: 'bg-blue-50 text-[#4285F4]',
    },
    {
      id: 'kindle',
      name: 'Kindle Sync',
      description: 'Synchronize highlights and push daily reading chapters to your Kindle reader.',
      icon: Plug,
      connected: kindleEnabled,
      color: 'bg-amber-50 text-[#FF9900]',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Bot',
      description: 'Receive lesson summaries, review prompt flashcards, and interact on WhatsApp.',
      icon: MessageCircle,
      connected: whatsappEnabled,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Receive high-fidelity summaries and daily reminders via Telegram.',
      icon: Send,
      connected: telegramEnabled,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'email',
      name: 'Email digest',
      description: 'Daily morning newsletters covering highlights and active books schedule.',
      icon: Mail,
      connected: emailEnabled,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-12 hover:bg-gray-100 text-app-subtext transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-app-text">Connectors</h1>
            <p className="text-xs text-app-subtext">Manage your integrations and channels</p>
          </div>
        </div>

        {/* Info card */}
        <div className="card bg-gradient-to-r from-accent/5 to-primary/5 border-primary/10 flex gap-3 p-4">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-app-text">Multi-channel learning</p>
            <p className="text-xs text-app-subtext leading-relaxed mt-0.5">
              Connect external services to automate book retrieval or deliver daily digests where you study best. Enable at least one message delivery channel to maintain your streak automatically.
            </p>
          </div>
        </div>

        {/* List of connectors */}
        <div className="space-y-3">
          {connectors.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.id} className="card flex items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-14 flex items-center justify-center flex-shrink-0 ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-app-text">{c.name}</span>
                      {c.connected && (
                        <span className="badge badge-success text-[9px] py-0.5 px-1.5 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-app-subtext mt-0.5 leading-relaxed max-w-md">{c.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div 
                  onClick={() => handleToggle(c.id, c.connected)}
                  className={`toggle-track ${c.connected ? 'toggle-track-on' : ''}`}
                >
                  <div className={`toggle-thumb ${c.connected ? 'toggle-thumb-on' : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
