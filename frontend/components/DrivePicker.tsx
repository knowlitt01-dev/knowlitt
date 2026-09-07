'use client'

import { useState } from 'react'
import { Cloud } from 'lucide-react'
import { api, ApiError } from '@/lib/api'

// Requires a Google Cloud OAuth client ID + API key (see GOOGLE_DRIVE.md for
// setup). Without them set, this button shows a clear "not configured"
// message instead of failing silently.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

interface Props {
  onImportComplete: () => void
}

export default function DrivePicker({ onImportComplete }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.body.appendChild(script)
    })
  }

  async function handleOpenPicker() {
    setError('')
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      setError('Google Drive import needs setup — see GOOGLE_DRIVE.md for the 10-minute Cloud Console steps.')
      return
    }

    setLoading(true)
    try {
      await loadScript('https://accounts.google.com/gsi/client')
      await loadScript('https://apis.google.com/js/api.js')

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: async (tokenResponse: any) => {
          const accessToken = tokenResponse.access_token
          await new Promise<void>((resolve) => window.gapi.load('picker', resolve))

          const picker = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCS)
            .setOAuthToken(accessToken)
            .setDeveloperKey(GOOGLE_API_KEY)
            .setCallback(async (data: any) => {
              if (data.action === window.google.picker.Action.PICKED) {
                const fileIds = data.docs.map((d: any) => d.id)
                setLoading(true)
                try {
                  await api.importFromDrive(fileIds, accessToken)
                  onImportComplete()
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Import failed')
                } finally {
                  setLoading(false)
                }
              }
            })
            .build()
          picker.setVisible(true)
        },
      })
      tokenClient.requestAccessToken()
    } catch (err) {
      setError('Could not open Google Drive picker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleOpenPicker} className="btn-secondary w-full flex items-center justify-center gap-2" disabled={loading}>
        <Cloud className="w-4 h-4" />
        {loading ? 'Opening...' : 'Import from Google Drive'}
      </button>
      {error && <p className="text-xs text-amber-600 mt-2">{error}</p>}
    </div>
  )
}
