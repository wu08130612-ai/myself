import React, { useState } from 'react'
import BackgroundContainer from '../components/BackgroundContainer'
import { useNavigate } from 'react-router-dom'

export default function CreateFamily() {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6b8bff')
  const nav = useNavigate()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const family = { name: name.trim(), color, createdAt: Date.now() }
    localStorage.setItem('tt_family', JSON.stringify(family))
    nav('/hub')
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
        <h1 style={{ margin: 0 }}>创建家庭</h1>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12, maxWidth: 560 }}>
          <input placeholder="家庭名称" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>代表色</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <button type="submit" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: '#3B82F6', color: '#fff', fontWeight: 600 }}>创建</button>
        </form>
      </div>
    </BackgroundContainer>
  )
}