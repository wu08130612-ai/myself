import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

type NavItem = { label: string; href: string; ariaLabel?: string }

export default function NavBar() {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  // 基础导航项，可根据登录状态做动态调整
  const items: NavItem[] = useMemo(() => [
    { label: '主页', href: '/app' },
    { label: '设置', href: '/settings' },
    { label: '登录', href: '/login' },
    { label: '注册', href: '/register' },
  ], [])

  const activeHref = useMemo(() => {
    // 根据当前路径匹配最前缀的导航项
    const pathname = location.pathname
    const matched = items.find((i) => pathname.startsWith(i.href))?.href
    return matched ?? items[0].href
  }, [location.pathname, items])

  // 计算胶囊位置与宽度，实现拟真的滑动动画（transform + width 过渡）
  function updatePill() {
    const container = containerRef.current
    const el = itemRefs.current[activeHref]
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
  }, [activeHref])

  return (
    <div className="sticky top-0 z-20"
         style={{ backdropFilter: 'saturate(180%) blur(8px)', background: 'rgba(2,6,23,0.35)' }}>
      <nav ref={containerRef}
           role="navigation"
           aria-label="主导航"
           className="mx-auto max-w-[960px] px-3 py-10"
           style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="relative"
             style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.06)' }}>
          {/* 活动胶囊 */}
          <div aria-hidden
               style={{
                 position: 'absolute',
                 inset: 6,
                 left: pill ? pill.x + 6 : 6,
                 width: pill ? pill.w - 12 : 0,
                 height: 'calc(100% - 12px)',
                 borderRadius: 9999,
                 background: '#ffffff',
                 transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                 transform: `translateX(${pill ? 0 : 0}px)`,
               }}
          />

          {/* 导航项 */}
          {items.map((i) => {
            const active = i.href === activeHref
            return (
              <Link
                key={i.href}
                ref={(el) => { itemRefs.current[i.href] = el }}
                to={i.href}
                aria-label={i.ariaLabel ?? i.label}
                aria-current={active ? 'page' : undefined}
                className="relative z-10"
                style={{
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  color: active ? '#0b102d' : 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'color 180ms ease',
                }}
              >
                {i.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}