export type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: '低' | '中' | '高';
  created_at: string;
  due_date?: string | null;
  status: '未完成' | '已完成';
  is_temp: number;
};

const BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://127.0.0.1:8000';

export async function getHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    // 后端离线或不可达时，返回 false，避免抛错
    return false;
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/presets/categories`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getTasks(params?: { search?: string; category?: string }): Promise<Task[]> {
  const url = new URL(`${BASE}/tasks`);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.category) url.searchParams.set('category', params.category);
  const res = await fetch(url);
  if (!res.ok) throw new Error('加载任务失败');
  return res.json();
}

export async function createTask(data: {
  title: string;
  description?: string;
  category?: string;
  priority?: '低' | '中' | '高';
  due_date?: string | null;
}): Promise<number> {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('创建任务失败');
  const json = await res.json();
  return json.id as number;
}

export async function completeTask(taskId: number, evidence?: string) {
  const res = await fetch(`${BASE}/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence }),
  });
  if (!res.ok) throw new Error('完成任务失败');
}

export async function uncompleteTask(taskId: number) {
  const res = await fetch(`${BASE}/tasks/${taskId}/uncomplete`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('撤销完成失败');
}

export async function deleteTask(taskId: number) {
  const res = await fetch(`${BASE}/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除任务失败');
}

export async function quickComplete(title: string) {
  const res = await fetch(`${BASE}/quick-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('快速完成失败');
}

export async function getStreak(): Promise<boolean[]> {
  try {
    const res = await fetch(`${BASE}/streak`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}