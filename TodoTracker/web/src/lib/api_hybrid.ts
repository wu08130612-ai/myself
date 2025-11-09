import * as remote from './api'
import {
  getTasksOffline,
  createTaskOffline,
  completeTaskOffline,
  uncompleteTaskOffline,
  deleteTaskOffline,
  quickCompleteOffline,
  getCategoriesOffline,
  getStreakOffline,
} from './offline'

export type { Task } from './api'

export async function getHealth(): Promise<boolean> {
  // 健康检查保持后端语义，用于显示连接状态
  return remote.getHealth()
}

export async function getCategories(): Promise<string[]> {
  try {
    return await remote.getCategories()
  } catch {
    return await getCategoriesOffline()
  }
}

export async function getTasks(params?: { search?: string; category?: string }) {
  try {
    return await remote.getTasks(params)
  } catch {
    return await getTasksOffline(params)
  }
}

export async function createTask(data: {
  title: string
  description?: string
  category?: string
  priority?: '低' | '中' | '高'
  due_date?: string | null
}): Promise<number> {
  try {
    return await remote.createTask(data)
  } catch {
    return await createTaskOffline(data)
  }
}

export async function completeTask(taskId: number, evidence?: string) {
  try {
    await remote.completeTask(taskId, evidence)
  } catch {
    await completeTaskOffline(taskId)
  }
}

export async function uncompleteTask(taskId: number) {
  try {
    await remote.uncompleteTask(taskId)
  } catch {
    await uncompleteTaskOffline(taskId)
  }
}

export async function deleteTask(taskId: number) {
  try {
    await remote.deleteTask(taskId)
  } catch {
    await deleteTaskOffline(taskId)
  }
}

export async function quickComplete(title: string) {
  try {
    await remote.quickComplete(title)
  } catch {
    await quickCompleteOffline(title)
  }
}

export async function getStreak(): Promise<boolean[]> {
  try {
    return await remote.getStreak()
  } catch {
    return await getStreakOffline()
  }
}