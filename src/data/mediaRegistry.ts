const PLACEHOLDER_ASSET = 'PLACEHOLDER_FAX'
export const PLACEHOLDER_MEDIA_URL = 'https://placehold.co/600x400/1b1f2d/FF00FF?text=Glitch'

const mediaFiles = import.meta.glob('../assets/**/*', { eager: true, query: '?url', import: 'default' })

const safeMediaImport = (fileName: string): string => {
  const relativePath = fileName.startsWith('../assets/') ? fileName : `../assets/${fileName}`
  const resolved = mediaFiles[relativePath]

  if (typeof resolved === 'string') {
    return resolved
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
