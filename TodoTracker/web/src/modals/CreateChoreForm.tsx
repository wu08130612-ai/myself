import React, { useEffect, useState } from 'react'
import { createTask, getCategories } from '../lib/api_hybrid'

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export default function CreateChoreForm({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [customCat, setCustomCat] = useState('')
  const [due, setDue] = useState<string | ''>('')
  const [cats, setCats] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    getCategories().then(setCats).catch(() => setCats([]))
  }, [open])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const finalCategory = customCat.trim() || category || undefined
      await createTask({ title: title.trim(), description: description.trim() || undefined, category: finalCategory, due_date: due || null })
      setTitle(''); setDescription(''); setCategory(''); setCustomCat(''); setDue('')
      onCreated?.()
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>创建家务</h3>
          <button onClick={onClose} style={linkBtn}>关闭</button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input placeholder="名称" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="描述(可选)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">类别预设</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="自定义类别(可选)" value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
          </div>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <button type="submit" disabled={submitting} style={primaryBtn}>{submitting ? '提交中...' : '创建'}</button>
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