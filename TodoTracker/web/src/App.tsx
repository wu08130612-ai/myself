import { useEffect, useMemo, useState } from 'react'
import './index.css'
import { Link } from 'react-router-dom'
import BackgroundContainer from './components/BackgroundContainer'
import GlareHover from './components/reactbits/GlareHover'
import type { Task } from './lib/api_hybrid'
import {
  getHealth,
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  quickComplete,
  getCategories,
  getStreak,
  uncompleteTask,
} from './lib/api_hybrid'
import { scheduleForTask, cancelForTask, requestPermission, permissionStatus, isNativePlatform } from './lib/notifications'

function Stamp({ status }: { status: Task['status'] }) {
  return <span title={status}>{status === '已完成' ? '✅' : '⏳'}</span>
}

function Momentum({ streak }: { streak: boolean[] }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {streak.map((hit, idx) => (
        <span key={idx} style={{ width: 10, height: 10, borderRadius: 10, background: hit ? '#22c55e' : '#334155', display: 'inline-block' }} />
      ))}
    </div>
  )
}

export default function App() {
  const [ok, setOk] = useState<boolean>(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState<boolean[]>([])
  const [categories, setCategories] = useState<string[]>([])

  // form state
  const [title, setTitle] = useState('')
  const [presetCat, setPresetCat] = useState<string>('')
  const [customCat, setCustomCat] = useState<string>('')
  const [priority, setPriority] = useState<'低' | '中' | '高'>('中')
  const [dueDate, setDueDate] = useState<string>('')
  const [remind, setRemind] = useState<boolean>(true)
  const [preRemind, setPreRemind] = useState<boolean>(true)

  const effectiveCategory = useMemo(() => customCat.trim() || presetCat, [presetCat, customCat])

  async function refresh() {
    try {
      setOk(await getHealth())
      const [list, cats, st] = await Promise.all([getTasks(), getCategories(), getStreak()])
      setTasks(list)
      setCategories(cats)
      setStreak(st)
      // 为所有未完成且有截止时间的任务调度提醒（包含预提醒）
      // 原生平台不依赖 Web Notification 权限判断
      if (permissionStatus() === 'granted' || isNativePlatform()) {
        list.forEach((t) => {
          if (t.status === '未完成' && t.due_date) {
            scheduleForTask({ id: t.id, title: t.title, due_date: t.due_date }, { preRemind: true })
          } else {
            cancelForTask(t.id)
          }
        })
      }
    } catch {
      setOk(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (permissionStatus() !== 'granted') {
      await requestPermission()
    }
    const newId = await createTask({ title: title.trim(), category: effectiveCategory, priority, due_date: dueDate ? dueDate : null })
    setTitle('')
    setCustomCat('')
    setDueDate('')
    // 创建后，若设置提醒则立即调度
    if (remind && dueDate) {
      scheduleForTask({ id: newId, title: title.trim(), due_date: dueDate }, { preRemind })
    }
    await refresh()
  }

  async function onQuickComplete() {
    if (!title.trim()) return
    await quickComplete(title.trim())
    setTitle('')
    await refresh()
  }

  return (
    <BackgroundContainer variant="liquidEther">
      <div className="max-w-[900px] mx-auto p-4">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>TodoTracker</h1>
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
        <Momentum streak={streak} />
      </section>

      <section style={{ marginTop: 16 }}>
        <form onSubmit={onCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px 180px 120px 120px', gap: 8 }}>
          <input placeholder="任务标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select value={presetCat} onChange={(e) => setPresetCat(e.target.value)}>
            <option value="">类别预设</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input placeholder="自定义类别(可选)" value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="低">低</option>
            <option value="中">中</option>
            <option value="高">高</option>
          </select>
          <GlareHover>
            <button type="submit">新增</button>
          </GlareHover>
        </form>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onQuickComplete}>快速完成临时</button>
          <GlareHover>
            <button onClick={refresh} style={{ marginLeft: 8 }}>刷新</button>
          </GlareHover>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} />
            到期提醒
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={preRemind} onChange={(e) => setPreRemind(e.target.checked)} />
            提前 1 小时预提醒
          </label>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ margin: '8px 0' }}>任务列表</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 160px 80px 220px', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155' }}>
              <Stamp status={t.status} />
              <div>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{t.description}</div>
              </div>
              <div style={{ fontSize: 12 }}>{t.category || '未分类'} | 优先级: {t.priority}</div>
              <div style={{ fontSize: 12 }}>{t.created_at.split('T')[0]}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {t.status === '未完成' ? (
                  <GlareHover>
                    <button onClick={() => { cancelForTask(t.id); completeTask(t.id).then(refresh) }}>完成</button>
                  </GlareHover>
                ) : (
                  <GlareHover>
                    <button onClick={() => uncompleteTask(t.id).then(refresh)}>撤销完成</button>
                  </GlareHover>
                )}
                <GlareHover>
                  <button onClick={() => { cancelForTask(t.id); deleteTask(t.id).then(refresh) }}>删除</button>
                </GlareHover>
              </div>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </BackgroundContainer>
  )
}
