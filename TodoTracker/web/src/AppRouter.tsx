import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import Settings from './pages/Settings.tsx'
import Register from './pages/Register.tsx'
import Privacy from './pages/legal/Privacy.tsx'
import Terms from './pages/legal/Terms.tsx'
import { isLoggedIn } from './lib/session.ts'
import PillNav from './components/PillNav.tsx'
import Archive from './pages/Archive'
import Me from './pages/Me'

// 简单线性图标（与底部导航搭配）
const IconHome = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 10v9h14v-9" />
  </svg>
)
const IconBox = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="7" width="16" height="12" rx="2" />
    <path d="M4 11h16" />
    <path d="M9 3h6l1 4H8l1-4z" />
  </svg>
)
const IconUser = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
  </svg>
)
const IconGear = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
)

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  if (isLoggedIn()) {
    return <Navigate to="/app" replace />
  }
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <PillNav
        items={isLoggedIn()
          ? [
              { label: '主页', href: '/app', icon: IconHome },
              { label: '归档', href: '/archive', icon: IconBox },
              { label: '我的', href: '/me', icon: IconUser },
              { label: '设置', href: '/settings', icon: IconGear },
            ]
          : [
              { label: '主页', href: '/app', icon: IconHome },
              { label: '登录', href: '/login', icon: IconUser },
              { label: '注册', href: '/register', icon: IconBox },
              { label: '设置', href: '/settings', icon: IconGear },
            ]}
        ease="power2.easeOut"
        baseColor="rgba(255,255,255,0.06)"
        pillColor="#ffffff"
        hoveredPillTextColor="#060010"
        pillTextColor="#060010"
        showActivePill={false}
        electricColor="#5227FF"
        electricThickness={2}
        electricChaos={0.5}
        electricSpeed={1}
      />
      <div style={{ paddingBottom: 90 }}>
        <Routes>
          <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
          <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <App />
              </RequireAuth>
            }
          />
          <Route
            path="/archive"
            element={
              <RequireAuth>
                <Archive />
              </RequireAuth>
            }
          />
          <Route
            path="/me"
            element={
              <RequireAuth>
                <Me />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to={isLoggedIn() ? '/app' : '/login'} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}