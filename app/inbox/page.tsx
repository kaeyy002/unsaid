'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATS = ['all', 'compliment', 'question', 'confession', 'feedback']
const CAT_LABELS = { all: 'All', compliment: '💌 Compliments', question: '🤔 Questions', confession: '🔥 Confessions', feedback: '💭 Feedback' }
const CAT_COLORS = { compliment: '#22D3EE', question: '#8B5CF6', confession: '#6D28D9', feedback: '#5DCAA5' }

function UnsaidLogo() {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE"/><stop offset="100%" stopColor="#6D28D9"/>
          </linearGradient>
        </defs>
        <path d="M8 6C5.8 6 4 7.8 4 10V22C4 24.2 5.8 26 8 26H12L16 32L20 26H32C34.2 26 36 24.2 36 22V10C36 7.8 34.2 6 32 6H8Z" fill="url(#bg2)" opacity="0.9"/>
        <rect x="2" y="8" width="2" height="2" fill="url(#bg2)" opacity="0.6"/>
        <rect x="0" y="12" width="2" height="2" fill="url(#bg2)" opacity="0.35"/>
      </svg>
      <span style={{fontSize:'16px',fontWeight:500,letterSpacing:'0.12em',color:'#F1F5F9',textTransform:'uppercase'}}>UNS<span style={{opacity:0.2}}>A</span>ID</span>
    </div>
  )
}

function InboxContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get('username') || ''
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
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

  async function toggleFav(id, current) {
    await supabase.from('messages').update({ is_favorite: !current }).eq('id', id)
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, is_favorite: !current } : m))
  }

  async function deleteMsg(id) {
    await supabase.from('messages').delete().eq('id', id)
    setMessages(msgs => msgs.filter(m => m.id !== id))
  }

  function copyLink() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function timeAgo(ts) {
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
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F172A'}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:'2px solid #6D28D9',borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const initials = ((profile?.display_name) || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  const st = {
    main: {minHeight:'100vh',background:'#0F172A',color:'#F1F5F9',fontFamily:'Inter,system-ui,sans-serif',padding:'24px 16px 64px',maxWidth:'512px',margin:'0 auto'},
    surface: {background:'#1E293B',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px'},
    muted: {color:'#94A3B8'},
    row: {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'},
    shareBtn: {background:'#6D28D9',color:'#fff',border:'none',borderRadius:'12px',padding:'8px 16px',fontSize:'14px',cursor:'pointer',fontWeight:500},
    grid3: {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'},
    statBox: {background:'#1E293B',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px',textAlign:'center'},
    tag: {display:'inline-block',padding:'6px 12px',borderRadius:'20px',fontSize:'12px',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',color:'#94A3B8',background:'transparent',marginRight:'8px',marginBottom:'8px'},
    tagActive: {background:'#263347',color:'#F1F5F9',border:'1px solid rgba(255,255,255,0.15)'},
    msgCard: {background:'#1E293B',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',marginBottom:'12px'},
    shareDropdown: {position:'absolute',right:0,top:'44px',background:'#1E293B',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'8px',width:'208px',zIndex:10},
    dropItem: {display:'block',width:'100%',textAlign:'left',padding:'8px 12px',fontSize:'14px',color:'#F1F5F9',background:'none',border:'none',cursor:'pointer',borderRadius:'8px'},
  }

  return (
    <main style={st.main}>
      <div style={st.row}>
        <UnsaidLogo/>
        <div style={{position:'relative'}}>
          <button style={st.shareBtn} onClick={() => setShareOpen(!shareOpen)}>Share link</button>
          {shareOpen && (
            <div style={st.shareDropdown}>
              <button style={st.dropItem} onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Copy link'}</button>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{...st.dropItem,textDecoration:'none',display:'block'}}>💬 WhatsApp</a>
              <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" style={{...st.dropItem,textDecoration:'none',display:'block'}}>𝕏 Share on X</a>
              <button style={st.dropItem} onClick={() => { copyLink(); setShareOpen(false) }}>📸 Copy for Instagram</button>
            </div>
          )}
        </div>
      </div>

      <div style={{...st.surface,display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:'#6D28D9',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'14px',fontWeight:500,flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:'14px',fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase'}}>{profile?.display_name}</p>
          <p style={{fontSize:'12px',...st.muted}}>unsaid.vercel.app/{username}</p>
        </div>
        <a href={`/profile/${username}`} target="_blank" rel="noopener noreferrer"
          style={{fontSize:'12px',color:'#8B5CF6',border:'1px solid rgba(109,40,217,0.3)',borderRadius:'8px',padding:'6px 12px',textDecoration:'none'}}>
          View →
        </a>
      </div>

      <div style={st.grid3}>
        {[{n:messages.length,l:'total'},{n:`${positivePct}%`,l:'positive'},{n:todayCount,l:'today'}].map(({n,l}) => (
          <div key={l} style={st.statBox}>
            <p style={{fontSize:'24px',fontWeight:500}}>{n}</p>
            <p style={{fontSize:'12px',...st.muted,marginTop:'4px'}}>{l}</p>
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <div style={{...st.surface,marginBottom:'16px'}}>
          <p style={{fontSize:'12px',...st.muted,marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.1em'}}>Mood this week</p>
          {[['Positive',positivePct,'#6D28D9'],['Neutral',neutralPct,'#22D3EE'],['Critical',criticalPct,'#8B5CF6']].map(([label,pct,color]) => (
            <div key={label} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
              <span style={{fontSize:'12px',width:'56px'}}>{label}</span>
              <div style={{flex:1,background:'#263347',borderRadius:'4px',height:'6px'}}>
                <div style={{width:`${pct}%`,height:'6px',borderRadius:'4px',background:color}}/>
              </div>
              <span style={{fontSize:'12px',...st.muted,width:'32px',textAlign:'right'}}>{pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div style={{marginBottom:'16px'}}>
        <button onClick={() => {setShowFavs(true);setFilter('all')}} style={{...st.tag,...(showFavs?st.tagActive:{})}}>★ Favorites</button>
        {CATS.map(cat => (
          <button key={cat} onClick={() => {setFilter(cat);setShowFavs(false)}} style={{...st.tag,...(!showFavs&&filter===cat?st.tagActive:{})}}>
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{textAlign:'center',padding:'64px 16px'}}>
          <p style={{fontSize:'40px',marginBottom:'16px'}}>✦</p>
          <p style={{fontWeight:500,marginBottom:'8px'}}>{messages.length === 0 ? 'No messages yet.' : 'Nothing here.'}</p>
          <p style={st.muted}>{messages.length === 0 ? 'Share your link to start receiving.' : 'Try a different filter.'}</p>
          {messages.length === 0 && <button onClick={copyLink} style={{marginTop:'16px',color:'#8B5CF6',background:'none',border:'none',cursor:'pointer',fontSize:'14px'}}>Copy your link →</button>}
        </div>
      ) : displayed.map(msg => (
        <div key={msg.id} style={st.msgCard}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
            <p style={{fontSize:'12px',fontWeight:500,color:CAT_COLORS[msg.category]||'#94A3B8'}}>{msg.category}</p>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => toggleFav(msg.id, msg.is_favorite)}
                style={{background:'none',border:'none',cursor:'pointer',color:msg.is_favorite?'#FBBF24':'#94A3B8',fontSize:'16px'}}>
                {msg.is_favorite ? '★' : '☆'}
              </button>
              <button onClick={() => deleteMsg(msg.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#94A3B8',fontSize:'14px'}}>✕</button>
            </div>
          </div>
          <p style={{fontSize:'15px',lineHeight:1.6,marginBottom:'12px'}}>{msg.content}</p>
          <p style={{fontSize:'12px',...st.muted}}>anonymous · {timeAgo(msg.created_at)}</p>
        </div>
      ))}

      <footer style={{marginTop:'48px',textAlign:'center',fontSize:'12px',...st.muted}}>
        Made in Nigeria 🇳🇬 · Crafted by <span style={{color:'#8B5CF6'}}>Ikenna Ugwulor</span>
      </footer>
    </main>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0F172A',display:'flex',alignItems:'center',justifyContent:'center',color:'#94A3B8'}}>Loading...</div>}>
      <InboxContent/>
    </Suspense>
  )
}
