const PLACEHOLDER_ASSET = 'PLACEHOLDER_FAX'
export const PLACEHOLDER_MEDIA_URL = 'https://placehold.co/600x400/1b1f2d/FF00FF?text=Glitch'

// Avoid hard dependency on import.meta.glob so non-Vite tooling can import data safely.
// eslint-disable-next-line no-new-func
const globFn: ((...args: unknown[]) => Record<string, string>) | undefined = (() => {
  try {
    return new Function('return import.meta.glob')()
  } catch (error) {
    console.warn('[MediaRegistry] import.meta.glob unavailable, falling back to empty registry.', error)
    return undefined
  }
})()
const mediaFiles = globFn ? globFn('../assets/**/*', { eager: true, query: '?url', import: 'default' }) : {}

const normalizeFileName = (fileName: string) => fileName.replace(/(\.png|\.mp4|\.jpg|\.jpeg)\1$/i, '$1')

const safeMediaImport = (fileName: string): string => {
  const normalized = normalizeFileName(fileName)
  const relativePath = normalized.startsWith('../assets/') ? normalized : `../assets/${normalized}`

  try {
    const resolved = mediaFiles[relativePath]

    if (typeof resolved === 'string') {
      return resolved
    }
  } catch (error) {
    console.warn(`[MediaRegistry] Error while loading asset: ${relativePath}`, error)
  }

  console.warn(`[MediaRegistry] Failed to load asset: ${relativePath}. Using placeholder instead.`)
  return PLACEHOLDER_MEDIA_URL
}

export const MediaRegistry = {
  faxMachine: safeMediaImport('fax_machine.png'),
  officeBg: safeMediaImport('office_bg.png'),
  surrealVideo: safeMediaImport('Surreal_Horror_Video_Generation.mp4'),
  snowyStreet: safeMediaImport('Snowy_Finland_Street_VHS.mp4'),
  placeholder: PLACEHOLDER_ASSET,
  fallback: PLACEHOLDER_MEDIA_URL,
}
