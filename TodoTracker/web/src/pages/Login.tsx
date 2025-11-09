import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BackgroundContainer from '../components/BackgroundContainer.tsx'
import GlareHover from '../components/reactbits/GlareHover.tsx'
import { setSession } from '../lib/session.ts'
import { permissionStatus, requestPermission } from '../lib/notifications.ts'
import { isEmailRegistered, verifyPassword } from '../lib/auth.ts'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState<{ score: number; feedback: { warning?: string; suggestions?: string[] } } | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function EyeOpenIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  function EyeClosedIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94" />
        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.87 5.73" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }

  useEffect(() => {
    const q = new URLSearchParams(loc.search)
    const pre = q.get('email')
    if (pre) { setEmail(pre); setStep(2) }
  }, [loc.search])

  function goNext() {
    setError(null)
    const em = email.trim().toLowerCase()
    if (!em.includes('@')) { setError('请输入有效邮箱'); return }
    if (!isEmailRegistered(em)) { setError('该邮箱未注册，请前往注册'); return }
    setStep(2)
  }

  async function evaluate(pwd: string) {
    if (!pwd) { setStrength(null); return }
    setEvaluating(true)
    try {
      const mod = await import('zxcvbn')
      const res = (mod as any).default ? (mod as any).default(pwd) : (mod as any)(pwd)
      setStrength({ score: res.score as number, feedback: res.feedback })
    } catch {
      setStrength(null)
    } finally {
      setEvaluating(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (step === 1) { goNext(); return }
    if (password.length < 8) { setError('密码长度至少 8 位'); return }
    setLoading(true)
    try {
      const ok = await verifyPassword(email.trim(), password)
      if (!ok) { setError('密码错误'); return }
      setSession(email.trim())
      if (permissionStatus() !== 'granted') {
        await requestPermission()
      }
      nav('/app', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[520px] mx-auto p-6">
        <h1 style={{ margin: 0 }}>登录 TodoTracker</h1>
        <p style={{ opacity: 0.8 }}>两步登录：邮箱 → 密码</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[1,2].map((s) => (
            <div key={s} style={{ flex: 1, height: 6, borderRadius: 4, background: s <= step ? '#60a5fa' : '#334155' }} />
          ))}
        </div>
        {error && (
          <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 16 }}>
          {step === 1 && (
            <>
              <input placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>请输入已注册邮箱</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <GlareHover>
                    <button type="button" onClick={() => nav(`/register?email=${encodeURIComponent(email.trim())}`)}>去注册</button>
                  </GlareHover>
                  <GlareHover>
                    <button type="button" onClick={goNext}>下一步</button>
                  </GlareHover>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="密码（≥8位）"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); evaluate(e.target.value) }}
                  style={{ paddingRight: 36, ...(error ? { border: '1px solid #ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}) }}
                />
                <button
                  type="button"
                  aria-label={showPwd ? '隐藏密码' : '显示密码'}
                  aria-pressed={showPwd}
                  onClick={() => setShowPwd((v) => !v)}
                  title={showPwd ? '隐藏密码' : '显示密码'}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                >
                  {showPwd ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <GlareHover>
                <button type="submit" disabled={loading}>{loading ? '登录中…' : '登录'}</button>
              </GlareHover>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2,3,4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: (strength?.score ?? -1) >= i ? '#60a5fa' : '#334155' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  强度：{strength ? ['极弱','较弱','一般','较强','很强'][strength.score] : '未评估'}{evaluating ? '（评估中…）' : ''}
                  {strength?.feedback?.warning && <span> · {strength.feedback.warning}</span>}
                </div>
                {strength?.feedback?.suggestions && strength.feedback.suggestions.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, opacity: 0.8 }}>
                    {strength.feedback.suggestions.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                忘记密码？ 目前为本地占位账号，暂不支持找回
              </div>
            </>
          )}
        </form>
      </div>
    </BackgroundContainer>
  )
}