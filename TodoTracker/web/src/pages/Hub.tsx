import React, { useEffect, useMemo, useState } from 'react'
import BackgroundContainer from '../components/BackgroundContainer'
import { getSession } from '../lib/session'
import { getHealth, getTasks, type Task } from '../lib/api_hybrid'
import { Link } from 'react-router-dom'

export default function Hub() {
  const session = getSession()
  const nick = useMemo(() => session?.email?.split('@')[0] ?? '朋友', [session])
  const [ok, setOk] = useState<boolean>(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [shoppingPreview, setShoppingPreview] = useState<{ name: string; done?: boolean; category?: string }[]>([])

  useEffect(() => {
    getHealth().then(setOk).catch(() => setOk(false))
    getTasks().then(setTasks).catch(() => setTasks([]))
    try {
      const raw = localStorage.getItem('tt_shopping_items')
      const arr = raw ? JSON.parse(raw) : []
      setShoppingPreview(Array.isArray(arr) ? arr.filter((i: any) => !i?.done).slice(0, 5) : [])
    } catch {
      setShoppingPreview([])
    }
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTasks = useMemo(() => tasks.filter(t => t.status === '未完成' && (t.due_date ? t.due_date === todayStr : true)).slice(0, 6), [tasks, todayStr])

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>早上好，{nick}！</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>{ok ? '🟢 已连接' : '🔴 服务不可用'}</div>
            <Link to="/settings" style={{ textDecoration: 'none' }}>设置</Link>
          </div>
        </header>

        {!ok && (
          <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
            服务不可用：后台未连接，部分功能可能受限
          </div>
        )}

        <section style={{ marginTop: 16 }}>
          <AnnouncementCard />
        </section>

        <section style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>今日家务</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {todayTasks.length === 0 && <div style={emptyStyle}>今日暂无任务</div>}
            {todayTasks.map((t) => (
              <div key={t.id} style={taskStyle}>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{(t.due_date ?? '无截止') + (t.category ? ` ｜ ${t.category}` : '')}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>购物清单</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {shoppingPreview.length === 0 && <div style={emptyStyle}>暂无未购项目</div>}
            {shoppingPreview.map((s, idx) => (
              <div key={idx} style={taskStyle}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{s.category ?? '未分类'}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Link to="/shopping" style={{ textDecoration: 'none' }}>查看全部 →</Link>
          </div>
        </section>
      </div>
    </BackgroundContainer>
  )
}

function AnnouncementCard() {
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 12,
      padding: 12,
      background: 'rgba(255,255,255,0.06)'
    }}>
      <div style={{ fontWeight: 600 }}>公告板</div>
      <div style={{ fontSize: 13, opacity: 0.9 }}>管理员可在此发布最新公告（占位）。</div>
    </div>
  )
}

const taskStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 12,
  padding: 10,
  background: 'rgba(255,255,255,0.06)'
}

const emptyStyle: React.CSSProperties = {
  border: '1px dashed rgba(255,255,255,0.24)',
  borderRadius: 12,
  padding: 10,
  opacity: 0.8,
}