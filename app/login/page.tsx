'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ygqqwmjhhdgnhvjtnfjk.supabase.co',
  'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'
)

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('profiles')
      .select('username, display_name, password')
      .eq('username', username.trim().toLowerCase())
      .single()

    if (err || !data) {
      setError("username not found")
      setLoading(false)
      return
    }
    if (data.password !== password) {
      setError("wrong password")
      setLoading(false)
      return
    }
    localStorage.setItem('unsaid_user', JSON.stringify({ username: data.username, display_name: data.display_name }))
    router.push(`/inbox?username=${data.username}`)
  }

  return (
    <main style={{minHeight:'100vh',background:'#080B14',color:'#F1F5F9',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <style>{`input{outline:none;transition:all 0.2s}input:focus{border-color:rgba(109,40,217,0.6)!important;box-shadow:0 0 0 3px rgba(109,40,217,0.1)!important}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:'100%',maxWidth:'360px',animation:'slideUp 0.4s ease'}}>
        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{fontSize:'36px',marginBottom:'14px'}}>✦</div>
          <h1 style={{fontSize:'24px',fontWeight:700,marginBottom:'6px'}}>welcome back</h1>
          <p style={{color:'#64748B',fontSize:'14px'}}>sign in to see your messages</p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'16px'}}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'14px 16px',fontSize:'15px',color:'#F1F5F9',fontFamily:'Inter,sans-serif'}}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{background:'#0F172A',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'14px 16px',fontSize:'15px',color:'#F1F5F9',fontFamily:'Inter,sans-serif'}}
          />
        </div>

        {error && (
          <p style={{color:'#F87171',fontSize:'13px',marginBottom:'14px',textAlign:'center'}}>{error}</p>
        )}

        <button onClick={handleLogin} disabled={loading || !username.trim() || !password.trim()}
          style={{width:'100%',padding:'16px',background:loading||!username.trim()||!password.trim()?'#1E293B':'linear-gradient(135deg,#6D28D9,#A855F7)',color:loading||!username.trim()||!password.trim()?'#475569':'#fff',border:'none',borderRadius:'16px',fontSize:'16px',fontWeight:600,cursor:loading||!username.trim()||!password.trim()?'not-allowed':'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s',marginBottom:'16px'}}>
          {loading ? 'signing in...' : 'sign in ✦'}
        </button>

        <p style={{textAlign:'center',fontSize:'13px',color:'#475569'}}>
          no account?{' '}
          <span onClick={() => router.push('/')} style={{color:'#8B5CF6',cursor:'pointer'}}>sign up →</span>
        </p>
      </div>

      <p style={{position:'fixed',bottom:'20px',fontSize:'11px',color:'#1E293B'}}>made in nigeria 🇳🇬 · unsaid</p>
    </main>
  )
}
