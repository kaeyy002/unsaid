'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ygqqwmjhhdgnhvjtnfjk.supabase.co',
  'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'
)

function detectCategory(text) {
  if (/love|amazing|great|best|beautiful|awesome|kind|smart|talent|cute|funny/i.test(text)) return 'compliment'
  if (/\?/.test(text)) return 'question'
  if (/secret|never told|truth|actually|confession|admit|always|crush/i.test(text)) return 'confession'
  return 'feedback'
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username, profile_views')
        .eq('username', username)
        .single()

      if (!data) {
        setNotFound(true)
        return
      }

      setProfile(data)

      // increment view count — only count if not the owner viewing their own page
      const stored = localStorage.getItem('unsaid_user')
      const loggedInUser = stored ? JSON.parse(stored).username : null
      if (loggedInUser !== username) {
        await supabase.rpc('increment_views', { username_input: username })
      }
    }
    load()
  }, [username])

  async function send() {
    if (!message.trim() || !profile) return
    setSending(true)
    await supabase.from('messages').insert({
      recipient_username: profile.username,
      content: message.trim(),
      category: detectCategory(message)
    })
    setSending(false)
    setSent(true)
  }

  function handleChange(e) {
    setMessage(e.target.value)
    setCharCount(e.target.value.length)
  }

  if (notFound) return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px',textAlign:'center'}}>
      <p style={{fontSize:'48px',marginBottom:'16px'}}>👻</p>
      <h1 style={{fontSize:'20px',fontWeight:600,marginBottom:'8px'}}>this page doesn't exist</h1>
      <p style={{color:'#64748B',fontSize:'14px',marginBottom:'24px'}}>maybe they haven't signed up yet?</p>
      <button onClick={() => router.push('/')} style={{background:'#6D28D9',color:'#fff',border:'none',borderRadius:'12px',padding:'10px 24px',fontSize:'14px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>create your own →</button>
    </main>
  )

  if (sent) return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px',textAlign:'center'}}>
      <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{fontSize:'64px',marginBottom:'20px',animation:'pop 0.5s ease'}}>✦</div>
      <h1 style={{fontSize:'22px',fontWeight:600,marginBottom:'10px'}}>sent. 👀</h1>
      <p style={{color:'#64748B',fontSize:'15px',lineHeight:1.7,marginBottom:'32px',maxWidth:'260px'}}>they have no idea it was you.<br/>your secret is safe.</p>
      <button onClick={() => { setSent(false); setMessage(''); setCharCount(0) }}
        style={{background:'linear-gradient(135deg,#6D28D9,#A855F7)',color:'#fff',border:'none',borderRadius:'14px',padding:'14px 32px',fontSize:'15px',cursor:'pointer',fontWeight:600,fontFamily:'Inter,sans-serif',marginBottom:'12px',width:'100%',maxWidth:'300px'}}>
        send another 🔁
      </button>
      <button onClick={() => router.push('/')}
        style={{background:'transparent',color:'#64748B',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'12px 32px',fontSize:'14px',cursor:'pointer',fontFamily:'Inter,sans-serif',width:'100%',maxWidth:'300px'}}>
        create my own link
      </button>
    </main>
  )

  if (!profile) return (
    <main style={{minHeight:'100vh',background:'#080B14',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:'32px',animation:'pulse 1.5s ease-in-out infinite'}}>✦</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </main>
  )

  const initials = profile.display_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(109,40,217,0.2)}50%{box-shadow:0 0 60px rgba(109,40,217,0.5)}}
        textarea:focus{border-color:rgba(109,40,217,0.6)!important;box-shadow:0 0 0 3px rgba(109,40,217,0.1)!important}
        textarea{outline:none}
      `}</style>

      <div style={{width:'100%',maxWidth:'400px',animation:'slideUp 0.4s ease'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#6D28D9,#22D3EE)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'24px',fontWeight:700,margin:'0 auto 16px',animation:'glow 3s ease-in-out infinite'}}>
            {initials}
          </div>
          <h1 style={{fontSize:'24px',fontWeight:700,marginBottom:'6px'}}>{profile.display_name}</h1>
          <p style={{color:'#64748B',fontSize:'14px',marginBottom:'8px'}}>send something anonymous 👀</p>

          {/* subtle view count — only shows if views exist */}
          {profile.profile_views > 0 && (
            <p style={{fontSize:'11px',color:'#334155'}}>
              👁 {profile.profile_views} {profile.profile_views === 1 ? 'person has' : 'people have'} visited this page
            </p>
          )}
        </div>

        <div style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'4px',marginBottom:'12px'}}>
          <textarea
            value={message}
            onChange={handleChange}
            maxLength={500}
            rows={5}
            placeholder="say something real... or don't 😈"
            style={{width:'100%',background:'transparent',border:'none',padding:'16px',fontSize:'15px',color:'#F1F5F9',fontFamily:'Inter,sans-serif',resize:'none',lineHeight:1.6,boxSizing:'border-box'}}
          />
          <div style={{display:'flex',justifyContent:'flex-end',padding:'0 12px 10px'}}>
            <span style={{fontSize:'11px',color:charCount>400?'#F87171':'#475569'}}>{charCount}/500</span>
          </div>
        </div>

        <button onClick={send} disabled={sending || !message.trim()}
          style={{width:'100%',padding:'16px',background:sending||!message.trim()?'#1E293B':'linear-gradient(135deg,#6D28D9,#A855F7)',color:sending||!message.trim()?'#475569':'#fff',border:'none',borderRadius:'16px',fontSize:'16px',fontWeight:600,cursor:sending||!message.trim()?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s',marginBottom:'20px'}}>
          {sending ? 'sending...' : 'send anonymously ✦'}
        </button>

        <div style={{display:'flex',justifyContent:'center',gap:'20px'}}>
          {['be kind.','be honest.','stay anonymous.'].map(t => (
            <span key={t} style={{fontSize:'12px',color:'#334155'}}>{t}</span>
          ))}
        </div>
      </div>

      <p style={{position:'fixed',bottom:'20px',fontSize:'11px',color:'#1E293B'}}>
        made in nigeria 🇳🇬 · unsaid
      </p>
    </main>
  )
}
