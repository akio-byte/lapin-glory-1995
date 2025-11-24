import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  if (typeof window === 'undefined') {
    return { muted: false, backgroundVolume: 0.25, sfxVolume: 0.3 }
  }

  try {
    const stored = window.localStorage.getItem(AUDIO_PREFS_KEY)
    if (!stored) return { muted: false, backgroundVolume: 0.25, sfxVolume: 0.3 }
    const parsed = JSON.parse(stored) as Partial<AudioPrefs>
    return {
      muted: parsed.muted ?? false,
      backgroundVolume: clamp(parsed.backgroundVolume ?? 0.25, 0, 1),
      sfxVolume: clamp(parsed.sfxVolume ?? 0.3, 0, 1),
    }
  } catch (error) {
    console.warn('Failed to parse audio prefs', error)
    return { muted: false, backgroundVolume: 0.25, sfxVolume: 0.3 }
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
  const lastPlayRef = useRef<Record<SfxKey, number>>({
    boss: 0,
    cash: 0,
    choice: 0,
    nokia: 0,
    static: 0,
  })

  const backgroundAudio = useMemo(() => {
    const audio = new Audio(sources.backgroundSrc)
    audio.loop = true
    audio.volume = backgroundVolume
    audio.preload = 'auto'
    return audio
  }, [backgroundVolume, sources.backgroundSrc])

  const intenseBackgroundAudio = useMemo(() => {
    const audio = new Audio(sources.intenseBackgroundSrc)
    audio.loop = true
    audio.volume = clamp(backgroundVolume + 0.03, 0, 1)
    audio.preload = 'auto'
    return audio
  }, [backgroundVolume, sources.intenseBackgroundSrc])

  const sfxAudio = useMemo(() => {
    const entries: Partial<Record<SfxKey, HTMLAudioElement>> = {} as Partial<Record<SfxKey, HTMLAudioElement>>
    ;(Object.keys(sources.sfxMap) as (keyof typeof sources.sfxMap)[]).forEach((key) => {
      const typedKey = key as SfxKey
      const src = sources.sfxMap[typedKey]
      if (!src) return
      const audio = new Audio(src)
      const baseVolume = SFX_BASE_VOLUME[typedKey]
      audio.volume = clamp(baseVolume * (sfxVolume / 0.3), 0, 1)
      audio.preload = 'auto'
      entries[typedKey] = audio
    })
    return entries
  }, [sfxVolume, sources])

  useEffect(
    () => () => {
      backgroundAudio.pause()
      intenseBackgroundAudio.pause()
    },
    [backgroundAudio, intenseBackgroundAudio],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    backgroundAudio.volume = backgroundVolume
    // eslint-disable-next-line react-hooks/immutability
    intenseBackgroundAudio.volume = clamp(backgroundVolume + 0.03, 0, 1)
    Object.entries(sfxAudio).forEach(([key, audio]) => {
      if (!audio) return
      const typedKey = key as SfxKey
      audio.volume = clamp(SFX_BASE_VOLUME[typedKey] * (sfxVolume / 0.3), 0, 1)
    })
  }, [backgroundAudio, backgroundVolume, intenseBackgroundAudio, sfxAudio, sfxVolume])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    backgroundAudio.muted = muted
    // eslint-disable-next-line react-hooks/immutability
    intenseBackgroundAudio.muted = muted
    if (muted) {
      backgroundAudio.pause()
      intenseBackgroundAudio.pause()
      setBackgroundPlaying(false)
    } else if (backgroundPlaying) {
      const activeAudio = backgroundMode === 'intense' ? intenseBackgroundAudio : backgroundAudio
      void activeAudio.play()
    }

    Object.values(sfxAudio).forEach((audio) => {
      if (audio) audio.muted = muted
    })
  }, [backgroundAudio, backgroundMode, backgroundPlaying, intenseBackgroundAudio, muted, sfxAudio])

  useEffect(() => {
    const payload: AudioPrefs = { muted, backgroundVolume, sfxVolume }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(payload))
    }
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
    setBackgroundPlaying((prev) => {
      const next = !prev
      if (muted) return prev
      const activeAudio = backgroundMode === 'intense' ? intenseBackgroundAudio : backgroundAudio
      const inactiveAudio = backgroundMode === 'intense' ? backgroundAudio : intenseBackgroundAudio
      inactiveAudio.pause()
      if (next) {
        void activeAudio.play()
      } else {
        activeAudio.pause()
      }
      return next
    })
  }, [backgroundAudio, backgroundMode, intenseBackgroundAudio, muted])

  const setBackgroundModeSafe = useCallback(
    (mode: 'normal' | 'intense') => {
      setBackgroundMode((prev) => {
        if (prev === mode) return prev
        if (muted) return mode
        const activeAudio = mode === 'intense' ? intenseBackgroundAudio : backgroundAudio
        const inactiveAudio = mode === 'intense' ? backgroundAudio : intenseBackgroundAudio
        inactiveAudio.pause()
        if (backgroundPlaying) {
          void activeAudio.play()
        }
        return mode
      })
    },
    [backgroundAudio, backgroundPlaying, intenseBackgroundAudio, muted],
  )

  const playSfx = useCallback(
    (key: SfxKey) => {
      const audio = sfxAudio[key]
      if (!audio || muted) return
      const now = performance.now()
      const lastPlay = lastPlayRef.current[key] ?? 0
      if (now - lastPlay < 120) return
      lastPlayRef.current[key] = now
      // eslint-disable-next-line react-hooks/immutability
      audio.currentTime = 0
      void audio.play()
    },
    [muted, sfxAudio],
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
