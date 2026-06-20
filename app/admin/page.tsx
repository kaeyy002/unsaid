'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ygqqwmjhhdgnhvjtnfjk.supabase.co',
  'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'
)

// 🔒 Change this to your own username
const ADMIN_USERNAME = 'ikenna'

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    newToday: 0,
    newThisWeek: 0,
    totalMessages: 0,
    messagesToday: 0,
    totalViews: 0,
    categories: { compliment: 0, question: 0, confession: 0, feedback: 0 },
    topProfiles: [],
    recentMessages: [],
    dailyMessages: [],
    dailyUsers: [],
  })

  useEffect(() => {
    const stored = localStorage.getItem('unsaid_user')
    if (!stored) { router.push('/login'); return }
    const user = JSON.parse(stored)
    if (user.username !== ADMIN_USERNAME) { router.push('/'); return }
    setAuthed(true)
    loadStats()
  }, [])

  async function loadStats() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalUsers },
      { count: newToday },
      { count: newThisWeek },
      { count: totalMessages },
      { count: messagesToday },
      { data: profiles },
      { data: messages },
      { data: allMessages },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('username, display_name, profile_views').order('profile_views', { ascending: false }).limit(5),
      supabase.from('messages').select('content, category, created_at, recipient_username').order('created_at', { ascending: false }).limit(8),
      supabase.from('messages').select('category, created_at').gte('created_at', weekStart),
    ])

    // category breakdown
    const categories = { compliment: 0, question: 0, confession: 0, feedback: 0 }
    allMessages?.forEach(m => { if (categories[m.category] !== undefined) categories[m.category]++ })

    // daily messages for last 7 days
    const dailyMessages = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const label = d.toLocaleDateString('en', { weekday: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
      const count = allMessages?.filter(m => m.created_at >= dayStart && m.created_at < dayEnd).length || 0
      dailyMessages.push({ label, count })
    }

    setStats({
      totalUsers: totalUsers || 0,
      newToday: newToday || 0,
      newThisWeek: newThisWeek || 0,
      totalMessages: totalMessages || 0,
      messagesToday: messagesToday || 0,
      totalViews: profiles?.reduce((sum, p) => sum + (p.profile_views || 0), 0) || 0,
      categories,
      topProfiles: profiles || [],
      recentMessages: messages || [],
      dailyMessages,
      dailyUsers: [],
    })
    setLoading(false)
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

  const CAT_COLOR = { compliment: '#22D3EE', question: '#A78BFA', confession: '#F472B6', feedback: '#34D399' }
  const CAT_EMOJI = { compliment: '💌', question: '🤔', confession: '🔥', feedback: '💭' }
  const totalCat = Object.values(stats.categories).reduce((a, b) => a + b, 0)
  const maxBar = Math.max(...stats.dailyMessages.map(d => d.count), 1)

  if (!authed || loading) return (
    <main style={{minHeight:'100vh',background:'#080B14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'32px',animation:'pulse 1.5s ease-in-out infinite'}}>✦</div>
      <p style={{color:'#94A3B8',fontSize:'14px',fontFamily:'Inter,sans-serif'}}>loading dashboard...</p>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </main>
  )

  return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',padding:'0 0 60px'}}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(180deg,#0F0A2E 0%,#080B14 100%)',padding:'28px 24px',borderBottom:'1px solid rgba(255,255,255,0.05)',marginBottom:'28px'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <span style={{fontSize:'18px',fontWeight:700,letterSpacing:'0.15em'}}>UNS<span style={{opacity:0.2}}>A</span>ID</span>
            <span style={{marginLeft:'12px',fontSize:'12px',color:'#8B5CF6',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'20px',padding:'3px 10px'}}>admin</span>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={loadStats}
              style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'#94A3B8',borderRadius:'10px',padding:'7px 14px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              refresh ↻
            </button>
            <button onClick={() => router.push(`/inbox?username=${ADMIN_USERNAME}`)}
              style={{background:'transparent',border:'1px solid rgba(139,92,246,0.3)',color:'#8B5CF6',borderRadius:'10px',padding:'7px 14px',fontSize:'12px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              inbox ↗
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'600px',margin:'0 auto',padding:'0 20px'}}>

        {/* Top stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px',animation:'slideUp 0.3s ease'}}>
          {[
            { n: stats.totalUsers, l: 'total users', c: '#8B5CF6', e: '👥' },
            { n: stats.totalMessages, l: 'total messages', c: '#22D3EE', e: '📨' },
            { n: stats.totalViews, l: 'profile views', c: '#F472B6', e: '👁' },
          ].map(({ n, l, c, e }) => (
            <div key={l} style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
              <p style={{fontSize:'11px',marginBottom:'8px'}}>{e}</p>
              <p style={{fontSize:'28px',fontWeight:700,color:c,marginBottom:'4px'}}>{n.toLocaleString()}</p>
              <p style={{fontSize:'11px',color:'#64748B'}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Today stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'28px',animation:'slideUp 0.4s ease'}}>
          {[
            { n: stats.newToday, l: 'new users today', c: '#34D399' },
            { n: stats.messagesToday, l: 'messages today', c: '#34D399' },
            { n: stats.newThisWeek, l: 'users this week', c: '#34D399' },
          ].map(({ n, l, c }) => (
            <div key={l} style={{background:'rgba(52,211,153,0.05)',border:'1px solid rgba(52,211,153,0.15)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
              <p style={{fontSize:'24px',fontWeight:700,color:c,marginBottom:'4px'}}>{n}</p>
              <p style={{fontSize:'11px',color:'#64748B'}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Messages chart - last 7 days */}
        <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'20px',padding:'20px',marginBottom:'20px',animation:'slideUp 0.5s ease'}}>
          <p style={{fontSize:'13px',fontWeight:600,color:'#94A3B8',marginBottom:'20px'}}>📈 messages — last 7 days</p>
          <div style={{display:'flex',alignItems:'flex-end',gap:'8px',height:'80px'}}>
            {stats.dailyMessages.map(({ label, count }) => (
              <div key={label} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',height:'100%',justifyContent:'flex-end'}}>
                <span style={{fontSize:'10px',color:'#475569'}}>{count > 0 ? count : ''}</span>
                <div style={{
                  width:'100%',
                  height: count === 0 ? '4px' : `${Math.max((count / maxBar) * 64, 4)}px`,
                  background: count === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg,#A855F7,#6D28D9)',
                  borderRadius:'6px 6px 0 0',
                  transition:'height 0.5s ease'
                }}/>
                <span style={{fontSize:'10px',color:'#475569'}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'20px',padding:'20px',marginBottom:'20px',animation:'slideUp 0.6s ease'}}>
          <p style={{fontSize:'13px',fontWeight:600,color:'#94A3B8',marginBottom:'16px'}}>📊 message categories</p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {Object.entries(stats.categories).map(([cat, count]) => {
              const pct = totalCat > 0 ? Math.round((count / totalCat) * 100) : 0
              return (
                <div key={cat}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                    <span style={{fontSize:'12px',color:CAT_COLOR[cat]}}>{CAT_EMOJI[cat]} {cat}</span>
                    <span style={{fontSize:'12px',color:'#64748B'}}>{count} · {pct}%</span>
                  </div>
                  <div style={{height:'6px',background:'rgba(255,255,255,0.05)',borderRadius:'99px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:CAT_COLOR[cat],borderRadius:'99px',transition:'width 0.8s ease'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top profiles by views */}
        <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'20px',padding:'20px',marginBottom:'20px',animation:'slideUp 0.7s ease'}}>
          <p style={{fontSize:'13px',fontWeight:600,color:'#94A3B8',marginBottom:'16px'}}>👁 top profiles by views</p>
          {stats.topProfiles.length === 0 ? (
            <p style={{fontSize:'13px',color:'#475569',textAlign:'center',padding:'12px'}}>no data yet</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {stats.topProfiles.map((p, i) => (
                <div key={p.username} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'rgba(255,255,255,0.02)',borderRadius:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'13px',color:'#475569',width:'16px'}}>#{i + 1}</span>
                    <div>
                      <p style={{fontSize:'13px',fontWeight:600}}>{p.display_name}</p>
                      <p style={{fontSize:'11px',color:'#475569'}}>@{p.username}</p>
                    </div>
                  </div>
                  <span style={{fontSize:'13px',color:'#8B5CF6',fontWeight:600}}>{(p.profile_views || 0).toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'20px',padding:'20px',animation:'slideUp 0.8s ease'}}>
          <p style={{fontSize:'13px',fontWeight:600,color:'#94A3B8',marginBottom:'16px'}}>🕐 recent messages</p>
          {stats.recentMessages.length === 0 ? (
            <p style={{fontSize:'13px',color:'#475569',textAlign:'center',padding:'12px'}}>no messages yet</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {stats.recentMessages.map((m, i) => (
                <div key={i} style={{padding:'12px',background:'rgba(255,255,255,0.02)',borderRadius:'12px',borderLeft:`3px solid ${CAT_COLOR[m.category]||'#6D28D9'}`}}>
                  <p style={{fontSize:'13px',color:'#E2E8F0',lineHeight:1.5,marginBottom:'6px'}}>{m.content.length > 80 ? m.content.slice(0, 80) + '...' : m.content}</p>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <span style={{fontSize:'11px',color:CAT_COLOR[m.category]}}>{CAT_EMOJI[m.category]} {m.category}</span>
                    <span style={{fontSize:'11px',color:'#334155'}}>· to @{m.recipient_username}</span>
                    <span style={{fontSize:'11px',color:'#334155'}}>· {timeAgo(m.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
