import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BookTutor — Learn from your books, daily',
  description: 'AI-powered daily lessons from the books you own. Spaced-repetition flashcards, reading roadmaps, and multi-channel notifications.',
  manifest: '/manifest.json',
  themeColor: '#4A36DE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#4A36DE" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-app-bg text-app-text antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
