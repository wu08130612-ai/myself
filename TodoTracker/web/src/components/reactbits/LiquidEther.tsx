import { useEffect, useRef, type CSSProperties } from 'react'

type LiquidEtherProps = {
  colors?: string[]
  mouseForce?: number
  cursorSize?: number
  resolution?: number
  autoDemo?: boolean
  autoSpeed?: number
  autoIntensity?: number
  takeoverDuration?: number
  autoResumeDelay?: number
  className?: string
  style?: CSSProperties
}

type Blob = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

function hexToRgb(hex: string): [number, number, number] {
  const s = hex.replace('#', '')
  const bigint = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  mouseForce = 20,
  cursorSize = 120,
  resolution = 0.5,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.0,
  takeoverDuration = 0.25,
  autoResumeDelay = 1000,
  className = '',
  style,
}: LiquidEtherProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastMoveAtRef = useRef<number>(Date.now())
  const takeoverRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const c = canvas as HTMLCanvasElement
    const context = ctx as CanvasRenderingContext2D

    let width = 0
    let height = 0
    let scale = Math.max(0.25, Math.min(1, resolution))

    const blobs: Blob[] = []
    const blobCount = 12

    const pickColor = (i: number) => colors[i % colors.length]

    function resize() {
      // 覆盖整个视口，固定为全屏尺寸
      width = window.innerWidth
      height = window.innerHeight
      const w = Math.max(1, Math.floor(width * scale))
      const h = Math.max(1, Math.floor(height * scale))
      c.width = w
      c.height = h
      c.style.width = `${width}px`
      c.style.height = `${height}px`
    }

    function seedBlobs() {
      blobs.length = 0
      for (let i = 0; i < blobCount; i++) {
        const r = Math.random() * 60 + 80 // radius in CSS px
        blobs.push({
          x: Math.random() * (c.width - r) + r,
          y: Math.random() * (c.height - r) + r,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: r * scale,
          color: pickColor(i),
        })
      }
    }

    resize()
    seedBlobs()

    let t = 0
    let px = c.width * 0.5
    let py = c.height * 0.5

    function pointerInfluence(b: Blob, intensity: number) {
      const dx = b.x - px
      const dy = b.y - py
      const dist = Math.max(1, Math.hypot(dx, dy))
      const reach = cursorSize * scale
      if (dist < reach) {
        const f = (1 - dist / reach) * (mouseForce * intensity)
        // Slightly tangential push to create a swirling feel
        const angle = Math.atan2(dy, dx) + Math.PI / 2
        b.vx += Math.cos(angle) * (f * 0.02)
        b.vy += Math.sin(angle) * (f * 0.02)
      }
    }

    function step() {
      t += 0.016

      // autopilot if idle
      const idle = Date.now() - lastMoveAtRef.current
      const takeover = Math.min(1, takeoverRef.current)
      const ease = takeover < 1 ? Math.min(1, takeover + 0.016 / Math.max(0.001, takeoverDuration)) : 1
      takeoverRef.current = ease

      if (autoDemo && idle > autoResumeDelay) {
        const ampX = c.width * 0.22
        const ampY = c.height * 0.18
        const speed = Math.max(0.1, autoSpeed)
        px = c.width * 0.5 + Math.cos(t * speed) * ampX
        py = c.height * 0.5 + Math.sin(t * speed * 0.7) * ampY
      }

      // fade frame slightly for trailing effect
      context.save()
      context.globalAlpha = 0.14
      context.globalCompositeOperation = 'source-over'
      context.fillStyle = 'transparent'
      context.clearRect(0, 0, c.width, c.height)
      context.restore()

      context.globalCompositeOperation = 'screen'
      context.filter = 'blur(10px)'

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i]
        // influence by pointer
        pointerInfluence(b, autoDemo ? autoIntensity : 1)

        // motion
        b.x += b.vx
        b.y += b.vy
        b.vx *= 0.96
        b.vy *= 0.96

        // soft boundary bounce
        const pad = b.r * 0.8
        if (b.x < pad) { b.x = pad; b.vx *= -0.8 }
        if (b.y < pad) { b.y = pad; b.vy *= -0.8 }
        if (b.x > c.width - pad) { b.x = c.width - pad; b.vx *= -0.8 }
        if (b.y > c.height - pad) { b.y = c.height - pad; b.vy *= -0.8 }

        // subtle drifting to keep energy
        b.vx += (Math.random() - 0.5) * 0.02
        b.vy += (Math.random() - 0.5) * 0.02

        // draw metaball-like radial
        const [r, g, bgr] = hexToRgb(b.color)
        const grad = context.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(32, b.r))
        grad.addColorStop(0, `rgba(${r}, ${g}, ${bgr}, 0.9)`)
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${bgr}, 0.28)`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${bgr}, 0)`)
        context.fillStyle = grad
        context.beginPath()
        context.arc(b.x, b.y, Math.max(24, b.r), 0, Math.PI * 2)
        context.fill()
      }

      context.filter = 'none'
      rafRef.current = window.requestAnimationFrame(step)
    }

    const onPointerMove = (e: PointerEvent) => {
      lastMoveAtRef.current = Date.now()
      takeoverRef.current = 0
      const rect = c.getBoundingClientRect()
      px = (e.clientX - rect.left) * (c.width / rect.width)
      py = (e.clientY - rect.top) * (c.height / rect.height)
    }

    const onResize = () => {
      resize()
      // rescale blob sizes to new resolution
      blobs.forEach((b) => { b.r = Math.max(32, b.r) })
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)
    rafRef.current = window.requestAnimationFrame(step)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [colors, mouseForce, cursorSize, resolution, autoDemo, autoSpeed, autoIntensity, takeoverDuration, autoResumeDelay])

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none ${className}`} style={style}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}