'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ygqqwmjhhdgnhvjtnfjk.supabase.co',
  'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'
)

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState('landing')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createProfile() {
    if (!username.trim() || !displayName.trim()) return
    setLoading(true)
    setError('')
    const slug = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const { error: err } = await supabase.from('profiles').insert({ username: slug, display_name: displayName.trim() })
    if (err) {
      setError(err.code === '23505' ? 'that username is taken. try another.' : `error: ${err.message}`)
      setLoading(false)
      return
    }
    router.push(`/inbox?username=${slug}`)
  }

  if (step === 'signup') return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <style>{`input:focus{border-color:rgba(109,40,217,0.6)!important;box-shadow:0 0 0 3px rgba(109,40,217,0.1)!important;outline:none}`}</style>
      <div style={{width:'100%',maxWidth:'380px'}}>
        <button onClick={() => setStep('landing')} style={{background:'none',border:'none',color:'#64748B',cursor:'pointer',fontSize:'14px',marginBottom:'32px',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',gap:'6px'}}>← back</button>
        <p style={{fontSize:'11px',color:'#8B5CF6',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>create your profile</p>
        <h1 style={{fontSize:'26px',fontWeight:700,marginBottom:'32px',lineHeight:1.2}}>pick your username.</h1>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'12px',color:'#64748B',marginBottom:'8px',display:'block'}}>your name</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ikenna"
            style={{width:'100%',background:'#0F172A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'13px 16px',fontSize:'15px',color:'#F1F5F9',fontFamily:'Inter,sans-serif',boxSizing:'border-box',transition:'all 0.2s'}}/>
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'12px',color:'#64748B',marginBottom:'8px',display:'block'}}>username</label>
          <div style={{display:'flex',alignItems:'center',background:'#0F172A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'13px 16px',transition:'all 0.2s'}}>
            <span style={{color:'#475569',fontSize:'14px',marginRight:'4px',whiteSpace:'nowrap'}}>unsaid.app/</span>
            <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
              placeholder="ikenna"
              style={{flex:1,background:'transparent',border:'none',color:'#F1F5F9',fontSize:'15px',fontFamily:'Inter,sans-serif',outline:'none'}}/>
          </div>
        </div>
        {error && <p style={{color:'#F87171',fontSize:'13px',marginBottom:'12px',background:'rgba(239,68,68,0.1)',padding:'10px 14px',borderRadius:'10px'}}>{error}</p>}
        <button onClick={createProfile} disabled={loading||!username||!displayName}
          style={{width:'100%',padding:'15px',background:loading||!username||!displayName?'#1E293B':'linear-gradient(135deg,#6D28D9,#A855F7)',color:loading||!username||!displayName?'#475569':'#fff',border:'none',borderRadius:'14px',fontSize:'15px',fontWeight:600,cursor:loading||!username||!displayName?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',marginTop:'8px',transition:'all 0.2s'}}>
          {loading ? 'creating...' : 'create my link →'}
        </button>
        <p style={{fontSize:'11px',color:'#334155',textAlign:'center',marginTop:'24px'}}>made in nigeria 🇳🇬 · crafted by ikenna ugwulor</p>
      </div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}
      `}</style>

      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <span style={{fontSize:'16px',fontWeight:700,letterSpacing:'0.15em'}}>UNS<span style={{opacity:0.2}}>A</span>ID</span>
        <button onClick={() => setStep('signup')}
          style={{background:'transparent',color:'#94A3B8',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'8px 18px',fontSize:'13px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
          sign up
        </button>
      </nav>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>
        <div style={{marginBottom:'20px',animation:'glow 3s ease-in-out infinite'}}>
          <span style={{fontSize:'12px',color:'#8B5CF6',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',background:'rgba(109,40,217,0.1)',border:'1px solid rgba(109,40,217,0.2)',padding:'6px 16px',borderRadius:'20px'}}>
            anonymous messaging
          </span>
        </div>

        <h1 style={{fontSize:'clamp(36px,8vw,56px)',fontWeight:800,lineHeight:1.1,marginBottom:'20px',maxWidth:'400px',animation:'slideUp 0.5s ease',background:'linear-gradient(135deg,#F1F5F9 0%,#94A3B8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          say what was left unsaid.
        </h1>

        <p style={{color:'#64748B',fontSize:'16px',lineHeight:1.7,maxWidth:'300px',marginBottom:'40px',animation:'slideUp 0.6s ease'}}>
          receive anonymous messages, honest confessions and real opinions from people around you.
        </p>

        <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%',maxWidth:'300px',animation:'slideUp 0.7s ease'}}>
          <button onClick={() => setStep('signup')}
            style={{padding:'16px',background:'linear-gradient(135deg,#6D28D9,#A855F7)',color:'#fff',border:'none',borderRadius:'16px',fontSize:'16px',fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif',boxShadow:'0 8px 32px rgba(109,40,217,0.4)'}}>
            create my link — it's free ✦
          </button>
          <p style={{fontSize:'12px',color:'#334155'}}>no account needed to send messages</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginTop:'60px',width:'100%',maxWidth:'380px',animation:'slideUp 0.8s ease'}}>
          {[{n:'01',t:'create your profile',s:'pick a username, get your link'},{n:'02',t:'share your link',s:'post on whatsapp, ig, or x'},{n:'03',t:'receive messages',s:'anonymous, honest, unfiltered'},{n:'04',t:'decide what stays unsaid',s:'your inbox, your rules'}].map(({n,t,s}) => (
            <div key={n} style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'16px',padding:'16px',textAlign:'left'}}>
              <p style={{fontSize:'11px',color:'#6D28D9',fontWeight:700,marginBottom:'8px'}}>{n}</p>
              <p style={{fontSize:'13px',fontWeight:600,marginBottom:'4px'}}>{t}</p>
              <p style={{fontSize:'12px',color:'#475569',lineHeight:1.4}}>{s}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:'20px',marginTop:'40px',flexWrap:'wrap',justifyContent:'center'}}>
          {['100% anonymous','free forever','no login to send','built in 🇳🇬'].map(f => (
            <span key={f} style={{fontSize:'12px',color:'#334155',display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#6D28D9',display:'inline-block'}}/>
              {f}
            </span>
          ))}
        </div>
      </div>

      <footer style={{padding:'20px',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
        <p style={{fontSize:'12px',color:'#1E293B'}}>made in nigeria 🇳🇬 · crafted by <span style={{color:'#6D28D9'}}>ikenna ugwulor</span></p>
      </footer>
    </main>
  )
}
