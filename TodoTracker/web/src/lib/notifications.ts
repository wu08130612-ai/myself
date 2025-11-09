// 通知封装：
// - Web：用 Notification + setTimeout 模拟到期提醒（页面打开期间有效）
// - 原生(iOS/Android, Capacitor)：使用 Local Notifications 插件（存在才调用）

export type TaskLike = {
  id: number
  title: string
  due_date?: string | null
}

type ScheduleOptions = {
  preRemind?: boolean // 提前 1 小时预提醒
}

const timersByTask: Record<number, number[]> = {}

function isNativePlatform(): boolean {
  const c = (globalThis as any).Capacitor
  return !!c && typeof c.isNativePlatform === 'function' && c.isNativePlatform()
}

function withLocalNotifications<T>(fn: (ln: any) => T): T | null {
  const c = (globalThis as any).Capacitor
  const ln = (globalThis as any).LocalNotifications || c?.Plugins?.LocalNotifications || c?.LocalNotifications
  if (!ln) return null
  try {
    return fn(ln)
  } catch {
    return null
  }
}

function parseISODate(input?: string | null): Date | null {
  if (!input) return null
  const raw = input.includes('T') ? input : input.replace(' ', 'T')
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d
}

export function permissionStatus(): NotificationPermission | 'unsupported' {
  // Web 环境权限
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<boolean> {
  // 原生平台优先尝试插件授权
  if (isNativePlatform()) {
    const ok = withLocalNotifications((ln) => {
      const res = ln.requestPermissions ? ln.requestPermissions() : null
      // 兼容返回 Promise 或直接对象
      if (res && typeof res.then === 'function') {
        return (res as Promise<any>).then((r) => ((r?.display || r?.results?.display) === 'granted')).catch(() => false) as unknown as boolean
      }
      return ((res?.display || res?.results?.display) === 'granted') as boolean
    })
    if (ok !== null) {
      // 若返回为 Promise，则等待其结果
      if (typeof (ok as any)?.then === 'function') {
        try {
          const r = await (ok as any)
          return !!r
        } catch {
          return false
        }
      }
      return !!ok
    }
  }

  // Web 授权
  const status = permissionStatus()
  if (status === 'unsupported') return false
  if (status === 'granted') return true
  try {
    const res = await Notification.requestPermission()
    return res === 'granted'
  } catch {
    return false
  }
}

function notifyNow(title: string, body: string) {
  // 原生立即通知
  if (isNativePlatform()) {
    const r = withLocalNotifications((ln) => ln.schedule?.({ notifications: [{ id: Math.floor(Date.now() % 1000000), title, body }] }))
    if (r && typeof (r as any).then === 'function') {
      ;(r as any).catch(() => {})
    }
    return
  }
  // Web 通知
  if (permissionStatus() !== 'granted') return
  try {
    new Notification(title, { body })
  } catch {}
}

export function scheduleForTask(task: TaskLike, opts: ScheduleOptions = {}) {
  const due = parseISODate(task.due_date)
  if (!due) return
  const now = Date.now()
  const mainDelay = Math.max(0, due.getTime() - now)
  const preDelay = Math.max(0, due.getTime() - 60 * 60 * 1000 - now)

  const current = timersByTask[task.id] || []
  current.forEach((t) => clearTimeout(t))
  const timers: number[] = []

  if (opts.preRemind && preDelay > 0) {
    timers.push(
      window.setTimeout(() => {
        notifyNow('待办预提醒', `距任务「${task.title}」截止还有 1 小时`)
      }, preDelay)
    )
  }

  timers.push(
    window.setTimeout(() => {
      notifyNow('待办到期', `任务「${task.title}」已到截止时间`)
    }, mainDelay)
  )

  timersByTask[task.id] = timers

  // 原生平台：安排本地通知（不依赖页面存活）
  if (isNativePlatform()) {
    const idPre = task.id * 1000 + 1
    const idMain = task.id * 1000 + 2
    const notifs: any[] = []
    if (opts.preRemind && preDelay > 0) {
      notifs.push({ id: idPre, title: '待办预提醒', body: `距任务「${task.title}」截止还有 1 小时`, schedule: { at: new Date(due.getTime() - 60 * 60 * 1000) } })
    }
    notifs.push({ id: idMain, title: '待办到期', body: `任务「${task.title}」已到截止时间`, schedule: { at: new Date(due.getTime()) } })
    const r = withLocalNotifications((ln) => ln.schedule?.({ notifications: notifs }))
    if (r && typeof (r as any).then === 'function') {
      ;(r as any).catch(() => {})
    }
  }
}

export function cancelForTask(taskId: number) {
  const timers = timersByTask[taskId] || []
  timers.forEach((t) => clearTimeout(t))
  delete timersByTask[taskId]
  // 原生平台：取消已安排的本地通知
  if (isNativePlatform()) {
    const idPre = taskId * 1000 + 1
    const idMain = taskId * 1000 + 2
    const r = withLocalNotifications((ln) => ln.cancel?.({ notifications: [{ id: idPre }, { id: idMain }] }))
    if (r && typeof (r as any).then === 'function') {
      ;(r as any).catch(() => {})
    }
  }
}