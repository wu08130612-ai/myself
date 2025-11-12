import { useEffect, useMemo, useState } from 'react'
import BackgroundContainer from '../components/BackgroundContainer'
import CreateShoppingItemForm from '../modals/CreateShoppingItemForm'

type Item = { name: string; category?: string; done?: boolean; added_by?: string }

export default function Shopping() {
  const [items, setItems] = useState<Item[]>([])
  const [shopping, setShopping] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  function reload() {
    try {
      const raw = localStorage.getItem('tt_shopping_items')
      const arr = raw ? JSON.parse(raw) : []
      setItems(Array.isArray(arr) ? arr : [])
    } catch { setItems([]) }
  }

  useEffect(() => {
    reload()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>()
    for (const it of items) {
      const key = it.category ?? '未分类'
      const arr = map.get(key) ?? []
      arr.push(it)
      map.set(key, arr)
    }
    const entries = Array.from(map.entries())
    // 分组内按完成状态排序：未完成在上，已完成在下
    return entries.map(([cat, arr]) => [cat, arr.slice().sort((a, b) => Number(!!a.done) - Number(!!b.done))] as [string, Item[]])
  }, [items])

  function toggleItem(idx: number, inKey: string) {
    const flatIndex = items.findIndex((it) => it === grouped.find(([k]) => k === inKey)?.[1][idx])
    if (flatIndex < 0) return
    const next = [...items]
    next[flatIndex] = { ...next[flatIndex], done: !next[flatIndex].done }
    setItems(next)
    localStorage.setItem('tt_shopping_items', JSON.stringify(next))
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>购物</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={shopping} onChange={(e) => setShopping(e.target.checked)} />
              我正在购物
            </label>
            <button
              onClick={() => setCreateOpen(true)}
              aria-label="新增"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.16)',
                background: '#ffffff',
                color: '#060010',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >新增</button>
          </div>
        </header>

        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          {grouped.map(([cat, arr]) => (
            <CategoryGroup key={cat} title={cat} items={arr} onToggle={(idx) => toggleItem(idx, cat)} />
          ))}
        </div>
      </div>
      <CreateShoppingItemForm
        open={createOpen}
        onClose={() => { setCreateOpen(false); reload() }}
        onCreated={() => { reload() }}
      />
    </BackgroundContainer>
  )
}

function CategoryGroup({ title, items, onToggle }: { title: string; items: Item[]; onToggle: (idx: number) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12 }}>
      <button onClick={() => setOpen((v) => !v)} style={{
        width: '100%', textAlign: 'left', padding: 10,
        background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12,
        cursor: 'pointer', fontWeight: 600
      }}>{title} {open ? '▾' : '▸'}</button>
      {open && (
        <div style={{ padding: 10, display: 'grid', gap: 8 }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={!!it.done} onChange={() => onToggle(idx)} />
              <span style={{ textDecoration: it.done ? 'line-through' as const : 'none', opacity: it.done ? 0.6 : 1 }}>{it.name}</span>
              <MemberBadge name={it.added_by} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MemberBadge({ name }: { name?: string }) {
  const initial = (() => {
    if (!name) return '?'
    const id = name.includes('@') ? name.split('@')[0] : name
    const ch = id.trim().slice(0, 1)
    return ch ? ch.toUpperCase() : '?'
  })()
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: 'rgba(255,255,255,0.92)'
    }} title={name ?? '未知成员'}>
      {initial}
    </div>
  )
}