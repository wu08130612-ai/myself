export type Session = {
  email: string
  loggedAt: number
}

const KEY = 'tt_session'

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (typeof obj?.email === 'string') return obj as Session
    return null
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getSession()
}

export function setSession(email: string) {
  const ses: Session = { email, loggedAt: Date.now() }
  localStorage.setItem(KEY, JSON.stringify(ses))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}