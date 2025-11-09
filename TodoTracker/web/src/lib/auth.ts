export type Account = {
  email: string
  passwordHash: string
  acceptedPolicies: boolean
  createdAt: number
}

const KEY = 'tt_accounts'

function loadAll(): Record<string, Account> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object') return obj as Record<string, Account>
    return {}
  } catch {
    return {}
  }
}

function saveAll(map: Record<string, Account>) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function getAccount(email: string): Account | null {
  const map = loadAll()
  const acc = map[email.toLowerCase()]
  return acc ?? null
}

export function isEmailRegistered(email: string): boolean {
  return !!getAccount(email)
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const arr = Array.from(new Uint8Array(digest))
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function register(email: string, password: string, acceptedPolicies: boolean): Promise<void> {
  const map = loadAll()
  const key = email.toLowerCase()
  if (map[key]) throw new Error('该邮箱已注册')
  const passwordHash = await hashPassword(password)
  map[key] = { email: key, passwordHash, acceptedPolicies, createdAt: Date.now() }
  saveAll(map)
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const acc = getAccount(email)
  if (!acc) return false
  const h = await hashPassword(password)
  return acc.passwordHash === h
}

export function getAcceptedPolicies(email: string): boolean {
  const acc = getAccount(email)
  return !!acc?.acceptedPolicies
}