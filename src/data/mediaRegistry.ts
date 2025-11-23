const PLACEHOLDER_ASSET = 'PLACEHOLDER_FAX'
export const PLACEHOLDER_MEDIA_URL = 'https://placehold.co/600x400/1b1f2d/FF00FF?text=Glitch'

const safeMediaImport = (relativePath: string): string => {
  try {
    return new URL(relativePath, import.meta.url).href
  } catch (error) {
    console.warn(`[MediaRegistry] Failed to load asset: ${relativePath}`, error)
    return PLACEHOLDER_MEDIA_URL
  }
}

export const MediaRegistry = {
  faxMachine: safeMediaImport('../assets/fax_machine.png'),
  officeBg: safeMediaImport('../assets/office_bg.png'),
  surrealVideo: safeMediaImport('../assets/Surreal_Horror_Video_Generation.mp4'),
  snowyStreet: safeMediaImport('../assets/Snowy_Finland_Street_VHS.mp4'),
  placeholder: PLACEHOLDER_ASSET,
  fallback: PLACEHOLDER_MEDIA_URL,
}
