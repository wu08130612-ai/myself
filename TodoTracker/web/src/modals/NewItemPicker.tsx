import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (type: 'chore' | 'shopping') => void
}

export default function NewItemPicker({ open, onClose, onPick }: Props) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 16 }}>创建</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <button onClick={() => onPick('chore')} style={btnStyle}>+ 新家务</button>
          <button onClick={() => onPick('shopping')} style={btnStyle}>+ 购物项</button>
        </div>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.92)',
  fontWeight: 600,
  cursor: 'pointer',
}