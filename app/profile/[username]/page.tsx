'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<{ display_name: string; username: string } | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('username', username)
        .single()
      if (!data) setNotFound(true)
      else setProfile(data)
    }
    load()
  }, [username])

  async function send() {
    if (!message.trim() || !profile) return
    setSending(true)
    await supabase.from('messages').insert({
      recipient_username: profile.username,
      content: message.trim(),
      category: detectCategory(message),
    })
    setSending(false)
    setSent(true)
  }

  function detectCategory(text: string): string {
    const t = text.toLowerCase()
    if (/love|amazing|great|best|beautiful|awesome|kind|smart|talent/i.test(t)) return 'compliment'
    if (/\?/.test(t)) return 'question'
    if (/secret|never told|truth|actually|confession|admit/i.test(t)) return 'confession'
    return 'feedback'
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <p className="text-4xl mb-4">✦</p>
        <h1 className="text-xl font-medium text-text-main mb-2">Profile not found.</h1>
        <p className="text-muted text-sm mb-6">This link doesn't exist yet.</p>
        <button onClick={() => router.push('/')} className="text-purple-light text-sm hover:underline">Create yours →</button>
      </main>
    )
  }

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <p className="text-5xl mb-5">✦</p>
        <h1 className="text-xl font-medium text-text-main mb-2">Message sent.</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          They have no idea it was you.<br />Your secret stays safe.
        </p>
        <button
          onClick={() => { setSent(false); setMessage('') }}
          className="bg-purple hover:bg-purple-light text-white rounded-xl px-8 py-3 text-sm font-medium transition-colors mb-4"
        >
          Send another
        </button>
        <button onClick={() => router.push('/')} className="text-muted text-sm hover:text-text-main transition-colors">
          Create your own link
        </button>
        <footer className="absolute bottom-6 text-xs text-muted">
          Built in Nigeria 🇳🇬 by <span className="text-purple-light">Ikenna</span>
        </footer>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple border-t-transparent animate-spin" />
      </main>
    )
  }

  const initials = profile.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-purple flex items-center justify-center text-white text-xl font-medium mx-auto mb-4">
            {initials}
          </div>
          <h1 className="text-2xl font-medium text-text-main tracking-widest uppercase">{profile.display_name}</h1>
          <p className="text-muted text-sm mt-2">Send me something anonymous.</p>
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          placeholder="say something real..."
          className="w-full bg-surface border border-white/10 rounded-2xl px-4 py-4 text-text-main text-base resize-none focus:border-purple transition-colors"
        />

        <button
          onClick={send}
          disabled={sending || !message.trim()}
          className="w-full mt-3 bg-purple hover:bg-purple-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-4 text-base font-medium transition-colors"
        >
          {sending ? 'Sending...' : 'Send anonymously'}
        </button>

        <div className="flex justify-center gap-6 mt-5">
          {['Be kind.', 'Be honest.', 'Stay anonymous.'].map(t => (
            <span key={t} className="text-xs text-muted">{t}</span>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted">
        Built in Nigeria 🇳🇬 by <span className="text-purple-light">Ikenna</span>
      </footer>
    </main>
  )
}
