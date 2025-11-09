import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BackgroundContainer from '../components/BackgroundContainer.tsx'
import GlareHover from '../components/reactbits/GlareHover.tsx'
import Modal from '../components/Modal.tsx'
import { isEmailRegistered, register } from '../lib/auth.ts'

type Strength = { score: number; feedback?: { suggestions?: string[]; warning?: string } }

export default function Register() {
  const nav = useNavigate()
  const loc = useLocation()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState<Strength | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    if (pre) setEmail(pre)
  }, [loc.search])

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

  const scoreText = useMemo(() => {
    const s = strength?.score ?? -1
    if (s < 0) return ''
    return ['非常弱', '较弱', '一般', '较强', '很强'][s]
  }, [strength])

  function nextStep() {
    setError(null)
    if (step === 1) {
      const em = email.trim().toLowerCase()
      if (!em.includes('@')) { setError('请输入有效邮箱'); return }
      if (isEmailRegistered(em)) { setError('该邮箱已注册，请直接登录'); return }
      setStep(2)
      return
    }
    if (step === 2) {
      if (password.length < 8) { setError('密码长度至少 8 位'); return }
      if (password !== confirm) { setError('两次输入的密码不一致'); return }
      const sc = strength?.score ?? 0
      if (sc < 3) { setError('密码强度不足，请提高复杂度'); return }
      setStep(3)
      return
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!agree) { setError('请先勾选同意隐私政策与用户协议'); return }
    setLoading(true)
    try {
      await register(email.trim(), password, agree)
      nav(`/login?email=${encodeURIComponent(email.trim())}`, { replace: true })
    } catch (err: any) {
      setError(err?.message ?? '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[520px] mx-auto p-6">
        <h1 style={{ margin: 0 }}>注册 TodoTracker</h1>
        <p style={{ opacity: 0.8 }}>分步完成邮箱、密码与协议确认</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[1,2,3].map((s) => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>请输入未注册的邮箱</div>
                <GlareHover>
                  <button type="button" onClick={nextStep}>下一步</button>
                </GlareHover>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="设置密码（≥8位）"
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="确认密码"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  style={{ paddingRight: 36, ...(error ? { border: '1px solid #ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}) }}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? '隐藏确认密码' : '显示确认密码'}
                  aria-pressed={showConfirm}
                  onClick={() => setShowConfirm((v) => !v)}
                  title={showConfirm ? '隐藏确认密码' : '显示确认密码'}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                >
                  {showConfirm ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: (strength?.score ?? -1) >= i ? '#60a5fa' : '#334155' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    强度：{scoreText}{evaluating ? '（评估中…）' : ''}
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
                <GlareHover>
                  <button type="button" onClick={nextStep}>下一步</button>
                </GlareHover>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, opacity: 0.8 }}>
                <li>至少 8 位</li>
                <li>包含大小写字母、数字和符号的组合</li>
                <li>避免常见词、键盘序列、重复模式</li>
              </ul>
            </>
          )}

          {step === 3 && (
            <>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  我已阅读并同意
                  <a href="/legal/privacy" style={{ margin: '0 4px' }}>隐私政策</a>
                  和
                  <a href="/legal/terms" style={{ margin: '0 4px' }}>用户协议</a>
                  （或
                  <button type="button" onClick={() => setShowPrivacy(true)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>弹窗查看隐私</button>
                  、
                  <button type="button" onClick={() => setShowTerms(true)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>弹窗查看协议</button>
                  ）
                </span>
              </label>
              <GlareHover>
                <button type="submit" disabled={loading}>{loading ? '注册中…' : '完成注册'}</button>
              </GlareHover>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                已有账号？ <a href="/login">前往登录</a>
              </div>
              <Modal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="隐私政策（摘要）">
                <p style={{ opacity: 0.9 }}>为提供待办提醒服务，我们可能在设备上存储必要数据。未经你同意不会共享或出售个人信息。你可随时要求删除数据。</p>
                <ul style={{ paddingLeft: 16 }}>
                  <li>收集：邮箱、待办数据、通知设置等</li>
                  <li>用途：任务管理与到期提醒</li>
                  <li>安全：本地存储与传输加密（正式版）</li>
                </ul>
              </Modal>
              <Modal open={showTerms} onClose={() => setShowTerms(false)} title="用户协议（摘要）">
                <p style={{ opacity: 0.9 }}>你承诺合法使用本应用，不上传违法内容。本应用按“现状”提供，不保证所有情况下的可用性。</p>
                <ul style={{ paddingLeft: 16 }}>
                  <li>服务：任务记录、提醒与相关功能</li>
                  <li>责任：自行管理账户安全</li>
                  <li>变更：我们可能更新条款并提前通知</li>
                </ul>
              </Modal>
            </>
          )}
        </form>
      </div>
    </BackgroundContainer>
  )
}