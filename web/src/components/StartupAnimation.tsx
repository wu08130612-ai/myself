import { useEffect, useMemo, useState } from 'react'
import Lottie from 'react-lottie-player'

const ANIM_URL = 'https://assets7.lottiefiles.com/packages/lf20_touohxv0.json'
const STORAGE_KEY = 'fh_first_run_seen'

export default function StartupAnimation() {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const alreadySeen = useMemo(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  }, [])

  const [visible, setVisible] = useState(() => !prefersReducedMotion && !alreadySeen)
  const [animationData, setAnimationData] = useState<any | null>(null)

  useEffect(() => {
    if (!visible) return
    let timer: number | undefined
    fetch(ANIM_URL)
      .then((res) => res.json())
      .then((json) => setAnimationData(json))
      .catch(() => setAnimationData(null))
    timer = window.setTimeout(() => finish(), 1400)
    return () => {
      if (timer) window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="品牌启动动画"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {animationData ? (
          <Lottie animationData={animationData} play loop={false} style={{ width: 160, height: 160 }} />
        ) : (
          <div style={{ width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.25)' }} />
        )}
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>Family Hub</div>
        <button
          onClick={finish}
          style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
        >
          跳过
        </button>
      </div>
    </div>
  )
}