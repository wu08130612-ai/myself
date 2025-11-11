import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ElectricBorder from './ElectricBorder'

type PillNavItem = { label: string; href: string; ariaLabel?: string; icon?: ReactNode }

type PillNavProps = {
  items: PillNavItem[]
  activeHref?: string
  className?: string
  ease?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
  onMobileMenuClick?: () => void
  showActivePill?: boolean
  electricColor?: string
  electricThickness?: number
  electricChaos?: number
  electricSpeed?: number
}

function easeToBezier(ease?: string): string {
  switch (ease) {
    case 'power2.easeOut':
    case 'power3.easeOut':
    case 'power4.easeOut':
      return 'cubic-bezier(0.22, 1, 0.36, 1)'
    case 'linear':
      return 'linear'
    default:
      return 'cubic-bezier(0.22, 1, 0.36, 1)'
  }
}

export default function PillNav({
  items,
  activeHref,
  className,
  ease = 'power2.easeOut',
  baseColor = 'rgba(255,255,255,0.06)',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#060010',
  pillTextColor = '#060010',
  showActivePill = false,
  electricColor = '#5227FF',
  electricThickness = 2,
  electricChaos = 0.5,
  electricSpeed = 1,
}: PillNavProps) {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  const active = useMemo(() => {
    if (activeHref) return activeHref
    const pathname = location.pathname
    const matched = items.find((i) => pathname.startsWith(i.href))?.href
    return matched ?? items[0]?.href ?? '/'
  }, [activeHref, location.pathname, items])

  function updatePill() {
    const container = containerRef.current
    const el = itemRefs.current[active]
    if (!container || !el) { setPill(null); return }
    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    const x = er.left - cr.left
    const w = er.width
    setPill({ x, w })
  }

  useEffect(() => {
    updatePill()
    const onResize = () => updatePill()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const transition = useMemo(() => `transform 320ms ${easeToBezier(ease)}, width 320ms ${easeToBezier(ease)}`,[ease])

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backdropFilter: 'saturate(180%) blur(8px)',
        background: 'rgba(2,6,23,0.35)',
        // 关键：为底部加入安全区，避免与 Home 指示器重叠
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <nav
        ref={containerRef}
        role="navigation"
        aria-label="主导航"
        className="mx-auto max-w-[960px] px-3 py-4"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ElectricBorder color={electricColor} thickness={electricThickness} chaos={electricChaos} speed={electricSpeed} borderRadius={9999}>
          <div className="relative" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 9999, background: baseColor }}>
            {/* 活动胶囊（按需显示） */}
            {showActivePill && (
              <div aria-hidden style={{ position: 'absolute', inset: 8, left: pill ? pill.x + 8 : 8, width: pill ? Math.max(0, pill.w - 16) : 0, height: 'calc(100% - 16px)', borderRadius: 9999, background: pillColor, transition }} />
            )}
            {/* 导航项（图标在上，文字在下） */}
            {items.map((i) => {
              const isActive = i.href === active
              return (
                <Link
                  key={i.href}
                  ref={(el) => { itemRefs.current[i.href] = el }}
                  to={i.href}
                  aria-label={i.ariaLabel ?? i.label}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative z-10"
                  style={{
                    textDecoration: 'none',
                    padding: '10px 18px',
                    borderRadius: 20,
                    color: isActive ? pillTextColor : 'rgba(255,255,255,0.85)',
                    fontWeight: 600,
                    fontSize: 12,
                    transition: `color 180ms ease`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget.style.color = hoveredPillTextColor) }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget.style.color = 'rgba(255,255,255,0.85)') }}
                >
                  <span style={{ width: 36, height: 36, borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i.icon}
                  </span>
                  <span>{i.label}</span>
                </Link>
              )
            })}
          </div>
        </ElectricBorder>
      </nav>
    </div>
  )
}