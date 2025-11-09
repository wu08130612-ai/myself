import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react'

type ElectricBorderProps = {
  children: ReactNode
  color?: string
  thickness?: number
  speed?: number
  chaos?: number
  borderRadius?: number
  className?: string
  style?: CSSProperties
}

export default function ElectricBorder({
  children,
  color = '#5227FF',
  thickness = 2,
  speed = 1,
  chaos = 0.5,
  borderRadius = 20,
  className,
  style,
}: ElectricBorderProps) {
  const turbRef = useRef<SVGFEColorMatrixElement | null>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const filterId = useRef(`eb-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let raf = 0
    let t = 0
    function loop() {
      t += 0.016 * speed
      const baseFreq = 0.012 + 0.01 * (Math.sin(t) * 0.5 + 0.5)
      const dispScale = Math.max(0, Math.min(chaos, 1)) * 12
      try {
        const cm = turbRef.current
        const dm = dispRef.current
        if (cm) cm.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0`)
        if (dm) dm.setAttribute('scale', String(dispScale))
        // Animate baseFrequency by replacing attribute on <feTurbulence> via the filter element
        const filterEl = document.getElementById(filterId.current) as SVGFilterElement | null
        if (filterEl) {
          const turb = filterEl.querySelector('feTurbulence') as SVGFETurbulenceElement | null
          if (turb) turb.setAttribute('baseFrequency', String(baseFreq))
        }
      } catch {
        // no-op
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [speed, chaos])

  return (
    <div className={className} style={{ position: 'relative', borderRadius, ...style }}>
      {/* Border SVG overlay */}
      <svg aria-hidden focusable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none">
        <defs>
          <filter id={filterId.current} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="2" />
            <feColorMatrix ref={turbRef} type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" scale={Math.max(0, Math.min(chaos, 1)) * 12} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`glow-${filterId.current}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
            </feMerge>
          </filter>
        </defs>
        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx={borderRadius} ry={borderRadius} fill="none" stroke={color} strokeWidth={thickness} filter={`url(#${filterId.current})`} />
        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx={borderRadius} ry={borderRadius} fill="none" stroke={color} strokeWidth={thickness} opacity={0.35} filter={`url(#glow-${filterId.current})`} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}