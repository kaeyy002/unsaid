'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function UnsaidLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path d="M8 6C5.8 6 4 7.8 4 10V22C4 24.2 5.8 26 8 26H12L16 32L20 26H32C34.2 26 36 24.2 36 22V10C36 7.8 34.2 6 32 6H8Z" fill="url(#bubbleGrad)" opacity="0.9"/>
        <rect x="2" y="8" width="2" height="2" fill="url(#bubbleGrad)" opacity="0.6"/>
        <rect x="0" y="12" width="2" height="2" fill="url(#bubbleGrad)" opacity="0.35"/>
        <rect x="1" y="17" width="1.5" height="1.5" fill="url(#bubbleGrad)" opacity="0.2"/>
        <rect x="3" y="22" width="1.5" height="1.5" fill="url(#bubbleGrad)" opacity="0.12"/>
        <rect x="2" y="4" width="1.5" height="1.5" fill="url(#bubbleGrad)" opacity="0.4"/>
        <rect x="5" y="2" width="1.5" height="1.5" fill="url(#bubbleGrad)" opacity="0.25"/>
      </svg>
      <span style={{ fontSize: size * 0.7, fontWeight: 500, letterSpacing: '0.12em', color: '#F1F5F9', textTransform: 'uppercase' as const }}>
        UNS<span style={{ opacity: 0.2 }}>A</span>ID
      </span>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<'landing' | 'signup'>('landing')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createProfile() {
    if (!username.trim() || !displayName.trim()) return
    setLoading(true)
    setError('')
    const slug = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const { error: err } = await supabase
      .from('profiles')
      .insert({ username: slug, display_name: displayName.trim() })
    if (err) {
      setError(err.code === '23505' ? 'That username is taken. Try another.' : 'Something went wrong.')
      setLoading(false)
      return
    }
    router.push(`/inbox?username=${slug}`)
  }

  if (step === 'signup') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="mb-8"><UnsaidLogo size={28} /></div>
          <button onClick={() => setStep('landing')} className="text-muted text-sm mb-6 flex items-center gap-2 hover:text-text-main transition-colors">
            ← back
          </button>
          <p className="text-xs tracking-widest text-cyan uppercase mb-2">Create your profile</p>
          <h1 className="text-2xl font-medium text-text-main mb-8">Pick your username.</h1>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-2 block">Display name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ikenna"
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-main text-base focus:border-purple transition-colors" />
            </div>
            <div>
              <label className="text-xs text-muted mb-2 block">Username</label>
              <div className="flex items-center bg-surface border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple transition-colors">
                <span className="text-muted text-sm mr-1">unsaid.app/</span>
                <input type="text" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="ikenna" className="flex-1 bg-transparent text-text-main text-base" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={createProfile} disabled={loading || !username || !displayName}
              className="w-full bg-purple hover:bg-purple-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3.5 text-base font-medium transition-colors">
              {loading ? 'Creating...' : 'Create my link →'}
            </button>
          </div>
          <p className="text-xs text-muted text-center mt-8">Made in Nigeria 🇳🇬 · Crafted by <span className="text-purple-light">Ikenna Ugwulor</span></p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <UnsaidLogo size={28} />
        <button onClick={() => setStep('signup')}
          className="text-sm text-muted hover:text-text-main transition-colors border border-white/10 rounded-xl px-4 py-2 hover:border-white/20">
          Sign up
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center py-16">
        <div className="inline-block bg-surface border border-white/8 rounded-full px-4 py-1.5 mb-8">
          <span className="text-xs text-cyan tracking-widest uppercase">Anonymous messaging</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium text-text-main leading-tight mb-5 max-w-sm">
          Say what was<br />left unsaid.
        </h1>
        <p className="text-muted text-base leading-relaxed max-w-xs mb-10">
          Receive anonymous messages, honest feedback, confessions and compliments from the people around you.
        </p>
        <button onClick={() => setStep('signup')}
          className="bg-purple hover:bg-purple-light text-white rounded-2xl px-10 py-4 text-base font-medium transition-colors mb-4">
          Create my link — it&apos;s free
        </button>
        <p className="text-xs text-muted">No account needed to send messages.</p>

        <div className="mt-20 w-full max-w-sm text-left">
          <p className="text-xs tracking-widest text-cyan uppercase mb-5 text-center">How it works</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: '01', t: 'Create your profile', s: 'Pick a username and get your link.' },
              { n: '02', t: 'Share your link', s: 'Post it on WhatsApp, IG, or X.' },
              { n: '03', t: 'Receive messages', s: 'Anonymous, honest, real.' },
              { n: '04', t: 'Decide what stays unsaid', s: 'Your inbox, your rules.' },
            ].map(({ n, t, s }) => (
              <div key={n} className="bg-surface border border-white/8 rounded-2xl p-4">
                <div className="text-xs text-purple-light font-medium mb-2">{n}</div>
                <div className="text-sm text-text-main font-medium leading-snug mb-1">{t}</div>
                <div className="text-xs text-muted leading-snug">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center gap-6 flex-wrap justify-center">
          {['Anonymous', 'Free forever', 'No login to send', 'Built in 🇳🇬'].map(f => (
            <span key={f} className="text-xs text-muted flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-purple-light inline-block" />{f}
            </span>
          ))}
        </div>
      </div>

      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-xs text-muted">Made in Nigeria 🇳🇬 · Crafted by <span className="text-purple-light">Ikenna Ugwulor</span></p>
      </footer>
    </main>
  )
}
