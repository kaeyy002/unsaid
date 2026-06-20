'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ygqqwmjhhdgnhvjtnfjk.supabase.co',
  'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'
)

const CAT_COLORS = { compliment: '#22D3EE', question: '#A78BFA', confession: '#F472B6', feedback: '#34D399' }
const CAT_EMOJI = { compliment: '💌', question: '🤔', confession: '🔥', feedback: '💭' }

function InboxContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get('username') || ''
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const [activeMsg, setActiveMsg] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Auth check
    const stored = localStorage.getItem('unsaid_user')
    if (!stored) { router.push('/login'); return }
    const user = JSON.parse(stored)
    if (user.username !== username) { router.push('/login'); return }
  }, [username])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileUrl(`${window.location.origin}/profile/${username}`)
    }
  }, [username])

  useEffect(() => {
    if (!username) { router.push('/'); return }
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [username])

  async function load() {
    const { data: p } = await supabase.from('profiles').select('display_name').eq('username', username).single()
    if (!p && loading) { router.push('/'); return }
    if (p) setProfile(p)
    const { data: m } = await supabase.from('messages').select('*').eq('recipient_username', username).order('created_at', { ascending: false })
    setMessages(m || [])
    setLoading(false)
  }

  async function deleteMsg(id) {
    await supabase.from('messages').delete().eq('id', id)
    setMessages(msgs => msgs.filter(m => m.id !== id))
    setActiveMsg(null)
  }

  async function toggleFav(id, current) {
    await supabase.from('messages').update({ is_favorite: !current }).eq('id', id)
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, is_favorite: !current } : m))
  }

  function handleLogout() {
    localStorage.removeItem('unsaid_user')
    router.push('/login')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    await supabase.from('messages').delete().eq('recipient_username', username)
    await supabase.from('profiles').delete().eq('username', username)
    localStorage.removeItem('unsaid_user')
    router.push('/')
  }

  function copyLink() {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true); setTimeout(() => setCopied(false), 3000)
  }

  function shareWhatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent("send me something you've never said out loud 👀\n" + profileUrl)}`, '_blank')
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

  const displayed = filter === 'all' ? messages : messages.filter(m => m.category === filter)
  const initials = ((profile?.display_name) || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  if (loading) return (
    <main style={{minHeight:'100vh',background:'#080B14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'32px',animation:'pulse 1.5s ease-in-out infinite'}}>✦</div>
      <p style={{color:'#94A3B8',fontSize:'14px',fontFamily:'Inter,sans-serif'}}>loading your inbox...</p>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </main>
  )

  // Delete account confirmation modal
  if (showDeleteConfirm) return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'340px',textAlign:'center'}}>
        <p style={{fontSize:'48px',marginBottom:'16px'}}>⚠️</p>
        <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'10px'}}>delete account?</h2>
        <p style={{color:'#64748B',fontSize:'14px',lineHeight:1.7,marginBottom:'28px'}}>
          this will permanently delete your profile and all {messages.length} messages. there's no going back.
        </p>
        <button onClick={handleDeleteAccount} disabled={deleting}
          style={{width:'100%',padding:'14px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',color:'#F87171',borderRadius:'14px',fontSize:'15px',fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif',marginBottom:'10px'}}>
          {deleting ? 'deleting...' : 'yes, delete everything'}
        </button>
        <button onClick={() => setShowDeleteConfirm(false)}
          style={{width:'100%',padding:'14px',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'#94A3B8',borderRadius:'14px',fontSize:'15px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
          cancel
        </button>
      </div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,system-ui,sans-serif',padding:'0 0 80px'}}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(109,40,217,0.3)}50%{box-shadow:0 0 40px rgba(109,40,217,0.6)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .msg-card:hover{border-color:rgba(255,255,255,0.15)!important;transform:translateY(-2px)}
        .msg-card{transition:all 0.2s ease}
      `}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(180deg,#0F0A2E 0%,#080B14 100%)',padding:'32px 20px 24px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{maxWidth:'480px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
            <span style={{fontSize:'18px',fontWeight:600,letterSpacing:'0.15em',color:'#F1F5F9'}}>UNS<span style={{opacity:0.2}}>A</span>ID</span>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <a href={`/profile/${username}`} target="_blank" rel="noopener noreferrer"
                style={{fontSize:'12px',color:'#8B5CF6',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'20px',padding:'6px 14px',textDecoration:'none',background:'rgba(139,92,246,0.08)'}}>
                my page ↗
              </a>
              <button onClick={handleLogout}
                style={{fontSize:'12px',color:'#64748B',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'6px 14px',background:'transparent',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                log out
              </button>
            </div>
          </div>

          {/* Profile */}
          <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px',animation:'slideUp 0.4s ease'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#6D28D9,#22D3EE)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'18px',fontWeight:600,flexShrink:0,boxShadow:'0 0 20px rgba(109,40,217,0.4)'}}>
              {initials}
            </div>
            <div>
              <p style={{fontSize:'20px',fontWeight:600}}>{profile?.display_name}</p>
              <p style={{fontSize:'13px',color:'#64748B',marginTop:'2px'}}>@{username}</p>
            </div>
          </div>

          {/* Share box */}
          <div style={{background:'rgba(109,40,217,0.12)',border:'1px solid rgba(109,40,217,0.35)',borderRadius:'20px',padding:'16px',animation:'glow 3s ease-in-out infinite'}}>
            <p style={{fontSize:'11px',color:'#8B5CF6',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'10px'}}>✦ your anonymous link</p>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
              <p style={{fontSize:'12px',color:'#C4B5FD',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',background:'rgba(0,0,0,0.3)',padding:'8px 12px',borderRadius:'10px'}}>
                {profileUrl}
              </p>
              <button onClick={copyLink}
                style={{background:'#6D28D9',color:'#fff',border:'none',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',cursor:'pointer',fontWeight:600,whiteSpace:'nowrap',fontFamily:'Inter,sans-serif'}}>
                {copied ? '✓ done!' : 'copy'}
              </button>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={shareWhatsapp}
                style={{flex:1,background:'rgba(37,211,102,0.15)',border:'1px solid rgba(37,211,102,0.3)',color:'#4ADE80',borderRadius:'10px',padding:'8px',fontSize:'12px',cursor:'pointer',fontWeight:500,fontFamily:'Inter,sans-serif'}}>
                💬 WhatsApp
              </button>
              <button onClick={copyLink}
                style={{flex:1,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'#A78BFA',borderRadius:'10px',padding:'8px',fontSize:'12px',cursor:'pointer',fontWeight:500,fontFamily:'Inter,sans-serif'}}>
                📸 Instagram
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("send me something anonymous 👀")}&url=${encodeURIComponent(profileUrl)}`,'_blank')}
                style={{flex:1,background:'rgba(29,161,242,0.15)',border:'1px solid rgba(29,161,242,0.3)',color:'#38BDF8',borderRadius:'10px',padding:'8px',fontSize:'12px',cursor:'pointer',fontWeight:500,fontFamily:'Inter,sans-serif'}}>
                𝕏 Twitter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'480px',margin:'0 auto',padding:'20px 20px 0'}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'24px'}}>
          {[
            {n:messages.length,l:'total',c:'#8B5CF6'},
            {n:messages.filter(m=>m.category==='compliment').length,l:'💌',c:'#22D3EE'},
            {n:messages.filter(m=>m.category==='confession').length,l:'🔥',c:'#F472B6'},
            {n:messages.filter(m=>Date.now()-new Date(m.created_at).getTime()<86400000).length,l:'today',c:'#34D399'},
          ].map(({n,l,c}) => (
            <div key={l} style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'12px 8px',textAlign:'center'}}>
              <p style={{fontSize:'22px',fontWeight:700,color:c}}>{n}</p>
              <p style={{fontSize:'11px',color:'#64748B',marginTop:'3px'}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'8px',marginBottom:'20px',flexWrap:'wrap'}}>
          {['all','compliment','question','confession','feedback'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{padding:'7px 14px',borderRadius:'20px',fontSize:'12px',border:'1px solid',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s',fontWeight:filter===cat?600:400,
                background:filter===cat?'#6D28D9':'transparent',
                color:filter===cat?'#fff':'#94A3B8',
                borderColor:filter===cat?'#6D28D9':'rgba(255,255,255,0.08)'}}>
              {cat==='all'?'all':`${CAT_EMOJI[cat]} ${cat}`}
            </button>
          ))}
        </div>

        {/* Messages */}
        {displayed.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>👀</p>
            <p style={{fontSize:'18px',fontWeight:600,marginBottom:'8px'}}>{messages.length===0?'nothing yet...':'nothing here'}</p>
            <p style={{color:'#64748B',fontSize:'14px',marginBottom:'24px',lineHeight:1.6}}>
              {messages.length===0?'share your link and wait for the honest ones to slide in 😏':'try a different filter'}
            </p>
            {messages.length===0&&(
              <button onClick={copyLink}
                style={{background:'linear-gradient(135deg,#6D28D9,#22D3EE)',color:'#fff',border:'none',borderRadius:'14px',padding:'12px 28px',fontSize:'14px',cursor:'pointer',fontWeight:600,fontFamily:'Inter,sans-serif'}}>
                {copied?'✓ link copied!':'copy my link 🔗'}
              </button>
            )}
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {displayed.map((msg,i) => (
              <div key={msg.id} className="msg-card"
                style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'18px',cursor:'pointer',animation:`slideUp ${0.3+i*0.05}s ease`,borderLeft:`3px solid ${CAT_COLORS[msg.category]||'#6D28D9'}`}}
                onClick={() => setActiveMsg(activeMsg===msg.id?null:msg.id)}>
                <p style={{fontSize:'15px',lineHeight:1.65,color:'#E2E8F0',marginBottom:'12px'}}>{msg.content}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'11px',color:CAT_COLORS[msg.category]||'#94A3B8',background:`${CAT_COLORS[msg.category]}18`,padding:'3px 8px',borderRadius:'20px'}}>
                      {CAT_EMOJI[msg.category]} {msg.category}
                    </span>
                    <span style={{fontSize:'11px',color:'#475569'}}>· {timeAgo(msg.created_at)}</span>
                  </div>
                  {activeMsg===msg.id&&(
                    <div style={{display:'flex',gap:'6px',animation:'fadeIn 0.2s ease'}}>
                      <button onClick={e=>{e.stopPropagation();toggleFav(msg.id,msg.is_favorite)}}
                        style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:msg.is_favorite?'#FBBF24':'#475569'}}>
                        {msg.is_favorite?'★':'☆'}
                      </button>
                      <button onClick={e=>{e.stopPropagation();deleteMsg(msg.id)}}
                        style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#F87171',borderRadius:'8px',padding:'4px 10px',fontSize:'11px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete account */}
        <div style={{marginTop:'48px',textAlign:'center'}}>
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{background:'transparent',border:'none',color:'#334155',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif',textDecoration:'underline'}}>
            delete account
          </button>
        </div>
      </div>

      <footer style={{textAlign:'center',padding:'24px 20px 0',fontSize:'12px',color:'#334155'}}>
        made in nigeria 🇳🇬 · crafted by <span style={{color:'#6D28D9'}}>ikenna ugwulor</span>
      </footer>
    </main>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#080B14',display:'flex',alignItems:'center',justifyContent:'center',color:'#94A3B8',fontFamily:'Inter,sans-serif'}}>loading...</div>}>
      <InboxContent/>
    </Suspense>
  )
}
