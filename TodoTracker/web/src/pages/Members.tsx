import React, { useState } from 'react'
import BackgroundContainer from '../components/BackgroundContainer'

export default function Members() {
  const [tab, setTab] = useState<'rank' | 'store'>('rank')
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>成员</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setTab('rank')} style={tabBtn(tab === 'rank')}>排行榜</button>
            <button onClick={() => setTab('store')} style={tabBtn(tab === 'store')}>奖励商店</button>
          </div>
        </header>

        {tab === 'rank' ? <RankView /> : <StoreView />}
      </div>
    </BackgroundContainer>
  )
}

function RankView() {
  const list = [
    { name: 'Leo', points: 120 },
    { name: 'Sarah', points: 110 },
    { name: 'Mia', points: 80 },
  ]
  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
      {list.map((m, i) => (
        <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: 10, background: 'rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 18 }}>{i === 0 ? '👑' : i + 1}</span>
          <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ fontWeight: 600 }}>{m.name}</div>
          <div style={{ marginLeft: 'auto' }}>{m.points} 分</div>
        </div>
      ))}
    </div>
  )
}

function StoreView() {
  const rewards = [
    { name: '看电影', cost: 500 },
    { name: '吃零食', cost: 200 },
    { name: '增加零花钱', cost: 800 },
  ]
  return (
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {rewards.map((r) => (
        <div key={r.name} style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: 80, borderRadius: 10, background: 'rgba(255,255,255,0.12)', marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>{r.name}</div>
          <button style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: '#3B82F6', color: '#fff', fontWeight: 600 }}>兑换 · {r.cost} 分</button>
        </div>
      ))}
    </div>
  )
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: '8px 12px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.16)',
    background: active ? '#3B82F6' : 'rgba(255,255,255,0.06)',
    color: '#fff', fontWeight: 600, cursor: 'pointer'
  }
}