'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATS = ['all', 'compliment', 'question', 'confession', 'feedback'] as const
const CAT_LABELS: Record<string, string> = { all: 'All', compliment: '💌 Compliments', question: '🤔 Questions', confession: '🔥 Confessions', feedback: '💭 Feedback' }
const CAT_COLORS: Record<string, string> = { compliment: '#22D3EE', question: '#8B5CF6', confession: '#6D28D9', feedback: '#5DCAA5' }

type Msg = { id: string; content: string; category: string; created_at: string; is_favorite: boolean }

function UnsaidLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE"/><stop offset="100%" stopColor="#6D28D9"/>
          </linearGradient>
        </defs>
        <path d="M8 6C5.8 6 4 7.8 4 10V22C4 24.2 5.8 26 8 26H12L16 32L20 26H32C34.2 26 36 24.2 36 22V10C36 7.8 34.2 6 32 6H8Z" fill="url(#bg2)" opacity="0.9"/>
        <rect x="2" y="8" width="2" height="2" fill="url(#bg2)" opacity="0.6"/>
        <rect x="0" y="12" width="2" height="2" fill="url(#bg2)" opacity="0.35"/>
        <rect x="1" y="17" width="1.5" height="1.5" fill="url(#bg2)" opacity="0.2"/>
      </svg>
      <span className="text-base font-medium tracking-widest uppercase text-text-main">UNS<span className="opacity-20">A</span>ID</span>
    </div>
  )
}

export default function InboxPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get('username') || ''
  const [profile, setProfile] = useState<{ display_name: string } | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [filter, setFilter] = useState('all')
  const [showFavs, setShowFavs] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${username}`
    : `https://unsaid.vercel.app/profile/${username}`

  useEffect(() => {
    if (!username) { router.push('/'); return }
    async function load() {
      const { data: p } = await supabase.from('profiles').select('display_name').eq('username', username).single()
      if (!p) { router.push('/'); return }
      setProfile(p)
      const { data: m } = await supabase.from('messages').select('*').eq('recipient_username', username).order('created_at', { ascending: false })
      setMessages(m || [])
      setLoading(false)
    }
    load()
  }, [username, router])

  async function toggleFav(id: string, current: boolean) {
    await supabase.from('messages').update({ is_favorite: !current }).eq('id', id)
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, is_favorite: !current } : m))
  }

  async function deleteMsg(id: string) {
    await supabase.from('messages').delete().eq('id', id)
    setMessages(msgs => msgs.filter(m => m.id !== id))
  }

  function copyLink() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent('Send me an anonymous message 👀\n' + profileUrl)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent("send me something you've never said out loud 👀")}&url=${encodeURIComponent(profileUrl)}`,
  }

  let displayed = messages
  if (showFavs) displayed = messages.filter(m => m.is_favorite)
  else if (filter !== 'all') displayed = messages.filter(m => m.category === filter)

  const positivePct = messages.length ? Math.round((messages.filter(m => m.category === 'compliment').length / messages.length) * 100) : 0
  const neutralPct = messages.length ? Math.round((messages.filter(m => ['question','feedback'].includes(m.category)).length / messages.length) * 100) : 0
  const criticalPct = Math.max(0, 100 - positivePct - neutralPct)
  const todayCount = messages.filter(m => Date.now() - new Date(m.created_at).getTime() < 86400000).length

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple border-t-transparent animate-spin"/>
    </main>
  )

  const initials = (profile?.display_name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <UnsaidLogo/>
        <div className="relative">
          <button onClick={() => setShareOpen(!shareOpen)}
            className="bg-purple hover:bg-purple-light text-white text-sm rounded-xl px-4 py-2 transition-colors font-medium">
            Share link
          </button>
          {shareOpen && (
            <div className="absolute right-0 top-11 bg-surface border border-white/10 rounded-2xl p-3 w-52 z-10 shadow-xl">
              <button onClick={copyLink} className="w-full text-left px-3 py-2 text-sm text-text-main hover:bg-surface2 rounded-xl transition-colors">
                {copied ? '✓ Copied!' : '🔗 Copy link'}
              </button>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                className="block px-3 py-2 text-sm text-text-main hover:bg-surface2 rounded-xl transition-colors">
                💬 Share on WhatsApp
              </a>
              <a href={shareLinks.x} target="_blank" rel="noopener noreferrer"
                className="block px-3 py-2 text-sm text-text-main hover:bg-surface2 rounded-xl transition-colors">
                𝕏 Share on X
              </a>
              <button onClick={() => { copyLink(); setShareOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-text-main hover:bg-surface2 rounded-xl transition-colors">
                📸 Copy for Instagram
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-surface border border-white/8 rounded-2xl p-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-main font-medium tracking-wide uppercase text-sm">{profile?.display_name}</p>
          <p className="text-muted text-xs truncate">unsaid.app/{username}</p>
        </div>
        <a href={`/profile/${username}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-purple-light border border-purple/30 rounded-lg px-3 py-1.5 hover:bg-purple/10 transition-colors">
          View →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[{n: messages.length, l:'total'},{n:`${positivePct}%`,l:'positive'},{n:todayCount,l:'today'}].map(({n,l}) => (
          <div key={l} className="bg-surface border border-white/8 rounded-xl p-3 text-center">
            <p className="text-2xl font-medium text-text-main">{n}</p>
            <p className="text-xs text-muted mt-1">{l}</p>
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="bg-surface border border-white/8 rounded-xl p-4 mb-4">
          <p className="text-xs text-muted mb-3 font-medium uppercase tracking-widest">Mood this week</p>
          {[['Positive', positivePct, '#6D28D9'],['Neutral', neutralPct, '#22D3EE'],['Critical', criticalPct, '#8B5CF6']].map(([label, pct, color]) => (
            <div key={label as string} className="flex items-center gap-3 mb-2 last:mb-0">
              <span className="text-xs text-text-main w-14">{label}</span>
              <div className="flex-1 bg-surface2 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{width:`${pct}%`,background:color as string}}/>
              </div>
              <span className="text-xs text-muted w-8 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => {setShowFavs(true); setFilter('all')}}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${showFavs ? 'bg-surface2 text-text-main border-white/15' : 'text-muted border-white/8 hover:border-white/15'}`}>
          ★ Favorites
        </button>
        {CATS.map(cat => (
          <button key={cat} onClick={() => {setFilter(cat); setShowFavs(false)}}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${!showFavs && filter===cat ? 'bg-surface2 text-text-main border-white/15' : 'text-muted border-white/8 hover:border-white/15'}`}>
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">✦</p>
          <p className="text-text-main font-medium mb-2">{messages.length === 0 ? 'No messages yet.' : 'Nothing here.'}</p>
          <p className="text-muted text-sm">{messages.length === 0 ? 'Share your link to start receiving.' : 'Try a different filter.'}</p>
          {messages.length === 0 && <button onClick={copyLink} className="mt-4 text-purple-light text-sm hover:underline">Copy your link →</button>}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(msg => (
            <div key={msg.id} className="bg-surface border border-white/8 rounded-2xl p-4 hover:border-white/12 transition-colors group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-medium" style={{color: CAT_COLORS[msg.category]||'#94A3B8'}}>{msg.category}</p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleFav(msg.id, msg.is_favorite)}
                    className={`text-sm transition-colors ${msg.is_favorite ? 'text-yellow-400' : 'text-muted hover:text-yellow-400'}`}>
                    {msg.is_favorite ? '★' : '☆'}
                  </button>
                  <button onClick={() => deleteMsg(msg.id)} className="text-muted hover:text-red-400 text-sm transition-colors">✕</button>
                </div>
              </div>
              <p className="text-text-main text-base leading-relaxed mb-3">{msg.content}</p>
              <p className="text-muted text-xs">anonymous · {timeAgo(msg.created_at)}</p>
            </div>
          ))}
        </div>
      )}
      <footer className="mt-12 text-center text-xs text-muted">
        Made in Nigeria 🇳🇬 · Crafted by <span className="text-purple-light">Ikenna Ugwulor</span>
      </footer>
    </main>
  )
}
