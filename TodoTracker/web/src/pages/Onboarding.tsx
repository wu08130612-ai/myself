import React from 'react'
import BackgroundContainer from '../components/BackgroundContainer'
import { Link } from 'react-router-dom'

export default function Onboarding() {
  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4" style={{ display: 'grid', gap: 16 }}>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>Family Hub</div>
          <div style={{ opacity: 0.8 }}>让家庭协作更简单</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link to="/create-family" style={cardBtn}><span>创建我的家庭</span></Link>
          <Link to="/join-family" style={cardBtn}><span>加入已有家庭</span></Link>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12 }}>
          <Link to="/legal/terms" style={{ color: '#9aa7ff' }}>服务条款</Link> · <Link to="/legal/privacy" style={{ color: '#9aa7ff' }}>隐私政策</Link>
        </div>
      </div>
    </BackgroundContainer>
  )
}

const cardBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14,
  padding: '20px 16px', textDecoration: 'none', color: '#fff',
  background: 'rgba(255,255,255,0.06)', fontWeight: 700,
}