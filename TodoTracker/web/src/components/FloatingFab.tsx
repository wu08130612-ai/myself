import React from 'react'

type Props = { onClick?: () => void }

export default function FloatingFab({ onClick }: Props) {
  return (
    <button
      aria-label="添加"
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 'calc(96px + env(safe-area-inset-bottom))',
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: 28,
        background: '#3B82F6',
        color: '#fff',
        border: 'none',
        boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        cursor: 'pointer',
      }}
    >
      +
    </button>
  )
}