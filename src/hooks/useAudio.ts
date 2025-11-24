import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { safeReadJson, safeWriteJson } from '../utils/safeStorage'

type SfxKey = 'choice' | 'nokia' | 'boss' | 'cash' | 'static'

const SFX_BASE_VOLUME: Record<SfxKey, number> = {
  boss: 0.4,
  cash: 0.3,
  choice: 0.3,
  nokia: 0.3,
  static: 0.3,
}

type UseAudioConfig = {
  backgroundSrc?: string
  intenseBackgroundSrc?: string
  sfxMap?: Partial<Record<SfxKey, string>>
}

const DEFAULT_SOURCES: Required<UseAudioConfig> = {
  backgroundSrc: '/audio/bg.wav',
  intenseBackgroundSrc: '/audio/Drone_Loop.mp4',
  sfxMap: {
    choice: '/audio/choice.wav',
    nokia: '/audio/nokia.wav',
    boss: '/audio/boss.wav',
    cash: '/audio/kassakone_cash.wav',
    static: '/audio/static_burst.wav',
  },
}

const AUDIO_PREFS_KEY = 'lapin-audio-prefs'

type AudioPrefs = {
  muted: boolean
  backgroundVolume: number
  sfxVolume: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const loadPrefs = (): AudioPrefs => {
  const defaults = { muted: false, backgroundVolume: 0.25, sfxVolume: 0.3 }
  const parsed = safeReadJson<Partial<AudioPrefs>>(AUDIO_PREFS_KEY)
  if (!parsed) return defaults
  return {
    muted: parsed.muted ?? defaults.muted,
    backgroundVolume: clamp(parsed.backgroundVolume ?? defaults.backgroundVolume, 0, 1),
    sfxVolume: clamp(parsed.sfxVolume ?? defaults.sfxVolume, 0, 1),
  }
}

export const useAudio = (config: UseAudioConfig = {}) => {
  const sources: Required<UseAudioConfig> = useMemo(
    () => ({
      backgroundSrc: config.backgroundSrc ?? DEFAULT_SOURCES.backgroundSrc,
      intenseBackgroundSrc: config.intenseBackgroundSrc ?? DEFAULT_SOURCES.intenseBackgroundSrc,
      sfxMap: { ...DEFAULT_SOURCES.sfxMap, ...config.sfxMap },
    }),
    [config.backgroundSrc, config.intenseBackgroundSrc, config.sfxMap],
  )
  const [prefs] = useState(loadPrefs)
  const [muted, setMuted] = useState(prefs.muted)
  const [backgroundVolume, setBackgroundVolume] = useState(prefs.backgroundVolume)
  const [sfxVolume, setSfxVolume] = useState(prefs.sfxVolume)
  const [backgroundPlaying, setBackgroundPlaying] = useState(false)
  const [backgroundMode, setBackgroundMode] = useState<'normal' | 'intense'>('normal')
  const [isPrimed, setIsPrimed] = useState(false)

  const lastPlayRef = useRef<Record<SfxKey, number>>({
    boss: 0,
    cash: 0,
    choice: 0,
    nokia: 0,
    static: 0,
  })
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const intenseBackgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const sfxAudioRef = useRef<Partial<Record<SfxKey, HTMLAudioElement>>>({})

  const primeAudio = useCallback(() => {
    setIsPrimed((prev) => prev || true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => setIsPrimed(true)
    window.addEventListener('pointerdown', handler, { once: true })
    return () => window.removeEventListener('pointerdown', handler)
  }, [])

  const ensureBackgroundAudio = useCallback(
    (mode: 'normal' | 'intense') => {
      if (!isPrimed) return null
      const targetRef = mode === 'intense' ? intenseBackgroundAudioRef : backgroundAudioRef
      const src = mode === 'intense' ? sources.intenseBackgroundSrc : sources.backgroundSrc
      const normalizedSrc = typeof window !== 'undefined' ? new URL(src, window.location.href).href : src

      if (!targetRef.current || targetRef.current.src !== normalizedSrc) {
        targetRef.current?.pause()
        const audio = new Audio(src)
        audio.loop = true
        audio.preload = 'auto'
        targetRef.current = audio
      }

      const audio = targetRef.current
      const intendedVolume = mode === 'intense' ? clamp(backgroundVolume + 0.03, 0, 1) : backgroundVolume
      if (audio) {
        audio.volume = muted ? 0 : intendedVolume
        audio.muted = muted
      }

      return audio
    },
    [backgroundVolume, isPrimed, muted, sources.backgroundSrc, sources.intenseBackgroundSrc],
  )

  const refreshSfxAudio = useCallback(() => {
    if (!isPrimed) return
    const current = sfxAudioRef.current
    ;(Object.keys(sources.sfxMap) as SfxKey[]).forEach((key) => {
      const src = sources.sfxMap[key]
      if (!src) return
      const normalizedSrc = typeof window !== 'undefined' ? new URL(src, window.location.href).href : src
      if (!current[key] || current[key]?.src !== normalizedSrc) {
        current[key]?.pause?.()
        const audio = new Audio(src)
        audio.preload = 'auto'
        current[key] = audio
      }
      const audio = current[key]
      if (!audio) return
      audio.volume = muted ? 0 : clamp(SFX_BASE_VOLUME[key] * (sfxVolume / 0.3), 0, 1)
      audio.muted = muted
    })
  }, [isPrimed, muted, sfxVolume, sources.sfxMap])

  useEffect(() => {
    if (!isPrimed) return
    ensureBackgroundAudio('normal')
    ensureBackgroundAudio('intense')
    refreshSfxAudio()
  }, [ensureBackgroundAudio, isPrimed, refreshSfxAudio])

  useEffect(() => {
    if (!isPrimed) return undefined
    const activeAudio = ensureBackgroundAudio(backgroundMode)
    const inactiveAudio = ensureBackgroundAudio(backgroundMode === 'intense' ? 'normal' : 'intense')

    if (backgroundPlaying && !muted && activeAudio) {
      inactiveAudio?.pause()
      void activeAudio.play().catch(() => setBackgroundPlaying(false))
    } else {
      activeAudio?.pause()
    }

    return () => {
      activeAudio?.pause()
      inactiveAudio?.pause()
    }
  }, [backgroundMode, backgroundPlaying, ensureBackgroundAudio, isPrimed, muted])

  useEffect(
    () => () => {
      backgroundAudioRef.current?.pause()
      intenseBackgroundAudioRef.current?.pause()
      Object.values(sfxAudioRef.current).forEach((audio) => audio?.pause())
    },
    [],
  )

  useEffect(() => {
    const payload: AudioPrefs = { muted, backgroundVolume, sfxVolume }
    safeWriteJson(AUDIO_PREFS_KEY, payload)
  }, [backgroundVolume, muted, sfxVolume])

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  const setBackgroundVolumeSafe = useCallback((value: number) => {
    setBackgroundVolume(clamp(value, 0, 1))
  }, [])

  const setSfxVolumeSafe = useCallback((value: number) => {
    setSfxVolume(clamp(value, 0, 1))
  }, [])

  const toggleBackground = useCallback(() => {
    primeAudio()
    setBackgroundPlaying((prev) => !prev)
  }, [primeAudio])

  const setBackgroundModeSafe = useCallback(
    (mode: 'normal' | 'intense') => {
      primeAudio()
      setBackgroundMode((prev) => (prev === mode ? prev : mode))
    },
    [primeAudio],
  )

  const playSfx = useCallback(
    (key: SfxKey) => {
      if (!isPrimed) {
        primeAudio()
        return
      }
      refreshSfxAudio()
      const audio = sfxAudioRef.current[key]
      if (!audio || muted) return
      const now = performance.now()
      const lastPlay = lastPlayRef.current[key] ?? 0
      if (now - lastPlay < 120) return
      lastPlayRef.current[key] = now
      audio.currentTime = 0
      void audio.play().catch(() => {})
    },
    [isPrimed, muted, primeAudio, refreshSfxAudio],
  )

  return {
    muted,
    toggleMute,
    backgroundPlaying,
    toggleBackground,
    playSfx,
    backgroundMode,
    setBackgroundMode: setBackgroundModeSafe,
    backgroundVolume,
    setBackgroundVolume: setBackgroundVolumeSafe,
    sfxVolume,
    setSfxVolume: setSfxVolumeSafe,
  }
}

export type UseAudioReturn = ReturnType<typeof useAudio>
