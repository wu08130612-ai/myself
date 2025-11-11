import { useEffect, useMemo, useRef, useState } from 'react'
import lottie from 'lottie-web'

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
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!visible) return
    let timer: number | undefined
    try {
      if (containerRef.current) {
        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: ANIM_URL,
        })
        anim.addEventListener('complete', () => finish())
      }
    } catch {
      // 回退到定时关闭
      timer = window.setTimeout(() => finish(), 1400)
    }
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
        <div ref={containerRef} style={{ width: 160, height: 160 }} />
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