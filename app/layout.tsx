import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UNSAID — things people never say out loud.',
  description: 'Receive anonymous messages, honest feedback, confessions and compliments.',
  openGraph: {
    title: 'UNSAID',
    description: 'Say what was left unsaid.',
    siteName: 'UNSAID',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
