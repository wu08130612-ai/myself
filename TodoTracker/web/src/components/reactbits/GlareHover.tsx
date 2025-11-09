import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

type GlareHoverProps = {
  children: ReactNode
  width?: string
  height?: string
  background?: string
  borderRadius?: string
  borderColor?: string
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number // percentage, e.g., 250 => 250%
  transitionDuration?: number // ms
  playOnce?: boolean
  className?: string
  style?: CSSProperties
}

// 参考 React Bits - Glare Hover 参数默认值
export default function GlareHover({
  children,
  width,
  height,
  background,
  borderRadius = '10px',
  borderColor,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style,
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onEnter = () => {
      if (playOnce && playedRef.current) return
      setHovered(true)
    }
    const onLeave = () => {
      if (playOnce) {
        playedRef.current = true
      }
      setHovered(false)
    }
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width)
      const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height)
      pendingRef.current = { x: x / Math.max(1, rect.width), y: y / Math.max(1, rect.height) }
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(() => {
          if (pendingRef.current) setPos(pendingRef.current)
          rafRef.current = null
        })
      }
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointermove', onMove)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [playOnce])

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width,
    height,
    borderRadius,
    background,
    borderColor,
    // 让外层容器允许子元素绝对定位
    overflow: 'hidden',
    ...style,
  }

  // 计算光晕层样式：使用 radial-gradient + 线性叠加，遵循文档默认参数
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius,
    pointerEvents: 'none',
    transition: `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`,
    opacity: hovered ? 1 : 0,
    // 使用 mix-blend-mode: screen 以实现边框内侧柔和增亮
    mixBlendMode: 'screen',
    // 为避免过强，可加入轻微模糊
    filter: 'blur(12px)',
    // 组合背景：大面积角度渐变 + 当前位置的径向高光
    background: `
      linear-gradient(${glareAngle}deg, rgba(255,255,255,${glareOpacity * 0.15}) 0%, rgba(255,255,255,0) 60%),
      radial-gradient(
        ${glareSize}% ${glareSize}% at calc(${(pos.x * 100).toFixed(2)}%) calc(${(pos.y * 100).toFixed(2)}%),
        ${glareColor} ${Math.max(0, Math.min(100, 18))}%,
        rgba(255,255,255,${glareOpacity}) 35%,
        rgba(255,255,255,0) 70%
      )
    `,
  }

  return (
    <div ref={ref} className={className} style={containerStyle}>
      {children}
      <div aria-hidden className="glare-overlay" style={overlayStyle} />
    </div>
  )
}