export const safeReadJson = <T>(key: string): T | null => {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`Failed to parse JSON for ${key}, clearing`, error)
    try {
      localStorage.removeItem(key)
    } catch (cleanupError) {
      console.warn(`Failed to clear corrupted key ${key}`, cleanupError)
    }
    return null
  }
}

export const safeWriteJson = (key: string, value: unknown): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to write JSON for ${key}`, error)
  }
}

export const safeRemove = (key: string): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove key ${key}`, error)
  }
}
