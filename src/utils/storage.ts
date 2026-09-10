export function loadJson<T>(key: string, fallback: T, merge: (raw: unknown, base: T) => T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return merge(JSON.parse(raw), fallback)
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    localStorage.removeItem(key)
  }
}

export function removeKeys(keys: string[]): void {
  keys.forEach((k) => localStorage.removeItem(k))
}

export function shallowMerge<T extends object>(raw: unknown, base: T): T {
  if (typeof raw !== 'object' || raw === null) return base
  const out = { ...base } as Record<string, unknown>
  const baseRecord = base as Record<string, unknown>
  for (const k of Object.keys(base)) {
    const v = (raw as Record<string, unknown>)[k]
    if (v !== undefined && typeof v === typeof baseRecord[k]) out[k] = v
  }
  return out as T
}
