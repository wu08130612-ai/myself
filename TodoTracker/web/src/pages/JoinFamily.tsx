import React, { useState } from 'react'
import BackgroundContainer from '../components/BackgroundContainer'
import { useNavigate } from 'react-router-dom'

export default function JoinFamily() {
  const [code, setCode] = useState('')
  const nav = useNavigate()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    const joinInfo = { invite: code.trim(), joinedAt: Date.now() }
    localStorage.setItem('tt_family_join', JSON.stringify(joinInfo))
    nav('/hub')
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
        <h1 style={{ margin: 0 }}>加入家庭</h1>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, marginTop: 12, maxWidth: 560 }}>
          <input placeholder="邀请码/链接" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: '#3B82F6', color: '#fff', fontWeight: 600 }}>加入</button>
        </form>
      </div>
    </BackgroundContainer>
  )
}