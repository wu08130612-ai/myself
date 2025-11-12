import React, { useEffect, useRef, useState } from 'react'
import { getSession } from '../lib/session'

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const PRESET_CATEGORIES = ['水果蔬菜', '肉蛋奶', '日用品', '零食饮料', '清洁用品', '其他']

export default function CreateShoppingItemForm({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [customCat, setCustomCat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [continuous, setContinuous] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function saveItem() {
    const sess = getSession()
    const item = {
      name: name.trim(),
      category: customCat.trim() || category || undefined,
      done: false,
      added_by: sess?.email ?? 'guest@local'
    }
    let list: any[] = []
    try {
      const raw = localStorage.getItem('tt_shopping_items')
      list = raw ? JSON.parse(raw) : []
      if (!Array.isArray(list)) list = []
    } catch {
      list = []
    }
    list.push(item)
    localStorage.setItem('tt_shopping_items', JSON.stringify(list))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      saveItem()
      onCreated?.()
      if (continuous) {
        setName('')
        setCustomCat('')
        setTimeout(() => inputRef.current?.focus(), 50)
      } else {
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>添加购物项</h3>
          <button onClick={onClose} style={linkBtn}>关闭</button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input ref={inputRef} placeholder="名称" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">分类预设</option>
              {PRESET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="自定义分类(可选)" value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} />
            连续添加
          </label>
          <button type="submit" disabled={submitting} style={primaryBtn}>{submitting ? '提交中...' : '添加'}</button>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 60,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
}

const sheetStyle: React.CSSProperties = {
  width: '100%', maxWidth: 560,
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  padding: 16,
}

const linkBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: '#3B82F6',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
}