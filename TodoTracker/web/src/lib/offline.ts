import type { Task } from './api'

const KEY = 'tt_offline_tasks'
const NEXT_ID_KEY = 'tt_offline_next_id'

function load(): Task[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

function nextId(): number {
  const raw = localStorage.getItem(NEXT_ID_KEY)
  const val = raw ? parseInt(raw, 10) : 1
  const nid = Number.isFinite(val) && val > 0 ? val : 1
  localStorage.setItem(NEXT_ID_KEY, String(nid + 1))
  return nid
}

export async function getTasksOffline(params?: { search?: string; category?: string }): Promise<Task[]> {
  let tasks = load()
  if (params?.search) {
    const s = params.search.trim()
    tasks = tasks.filter(t => t.title.includes(s) || (t.description ?? '').includes(s))
  }
  if (params?.category) {
    tasks = tasks.filter(t => (t.category ?? '') === params.category)
  }
  // 按创建时间倒序
  return tasks.sort((a, b) => (b.created_at?.localeCompare(a.created_at)))
}

export async function createTaskOffline(data: {
  title: string;
  description?: string;
  category?: string;
  priority?: '低' | '中' | '高';
  due_date?: string | null;
}): Promise<number> {
  const tasks = load()
  const id = nextId()
  const now = new Date().toISOString()
  const newTask: Task = {
    id,
    title: data.title,
    description: data.description ?? '',
    category: data.category ?? '',
    priority: data.priority ?? '中',
    created_at: now,
    due_date: data.due_date ?? null,
    status: '未完成',
    is_temp: 0,
  }
  tasks.push(newTask)
  save(tasks)
  return id
}

export async function completeTaskOffline(taskId: number) {
  const tasks = load()
  const idx = tasks.findIndex(t => t.id === taskId)
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], status: '已完成' }
    save(tasks)
  }
}

export async function uncompleteTaskOffline(taskId: number) {
  const tasks = load()
  const idx = tasks.findIndex(t => t.id === taskId)
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], status: '未完成' }
    save(tasks)
  }
}

export async function deleteTaskOffline(taskId: number) {
  const tasks = load().filter(t => t.id !== taskId)
  save(tasks)
}

export async function quickCompleteOffline(title: string) {
  const tasks = load()
  const id = nextId()
  const now = new Date().toISOString()
  const temp: Task = {
    id,
    title,
    description: '',
    category: '',
    priority: '中',
    created_at: now,
    due_date: null,
    status: '已完成',
    is_temp: 1,
  }
  tasks.push(temp)
  save(tasks)
}

export async function getCategoriesOffline(): Promise<string[]> {
  const tasks = load()
  const set = new Set<string>()
  tasks.forEach(t => { if (t.category?.trim()) set.add(t.category.trim()) })
  return Array.from(set)
}

export async function getStreakOffline(): Promise<boolean[]> {
  const tasks = load()
  // 简化：以任务创建日期作为完成记录（仅用于可视化），统计最近 14 天
  const days = 14
  const today = new Date()
  const hits: boolean[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    const anyHit = tasks.some(t => t.status === '已完成' && t.created_at.slice(0, 10) === dayStr)
    hits.push(anyHit)
  }
  return hits
}