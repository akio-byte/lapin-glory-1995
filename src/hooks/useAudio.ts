import { useCallback, useEffect, useMemo, useState } from 'react'

type SfxKey = 'choice' | 'nokia' | 'boss' | 'cash' | 'static'

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

export const useAudio = (config: UseAudioConfig = {}) => {
  const sources: Required<UseAudioConfig> = {
    backgroundSrc: config.backgroundSrc ?? DEFAULT_SOURCES.backgroundSrc,
    intenseBackgroundSrc: config.intenseBackgroundSrc ?? DEFAULT_SOURCES.intenseBackgroundSrc,
    sfxMap: { ...DEFAULT_SOURCES.sfxMap, ...config.sfxMap },
  }
  const [muted, setMuted] = useState(true)
  const [backgroundPlaying, setBackgroundPlaying] = useState(false)
  const [backgroundMode, setBackgroundMode] = useState<'normal' | 'intense'>('normal')

  const backgroundAudio = useMemo(() => {
    const audio = new Audio(sources.backgroundSrc)
    audio.loop = true
    audio.volume = 0.25
    audio.preload = 'auto'
    return audio
  }, [sources.backgroundSrc])

  const intenseBackgroundAudio = useMemo(() => {
    const audio = new Audio(sources.intenseBackgroundSrc)
    audio.loop = true
    audio.volume = 0.28
    audio.preload = 'auto'
    return audio
  }, [sources.intenseBackgroundSrc])

  const sfxAudio = useMemo(() => {
    const entries: Partial<Record<SfxKey, HTMLAudioElement>> = {} as Partial<Record<SfxKey, HTMLAudioElement>>
    ;(Object.keys(sources.sfxMap) as (keyof typeof sources.sfxMap)[]).forEach((key) => {
      const typedKey = key as SfxKey
      const src = sources.sfxMap[typedKey]
      if (!src) return
      const audio = new Audio(src)
      audio.volume = typedKey === 'boss' ? 0.4 : 0.3
      audio.preload = 'auto'
      entries[typedKey] = audio
    })
    return entries
  }, [sources.sfxMap])

  useEffect(
    () => () => {
      backgroundAudio.pause()
      intenseBackgroundAudio.pause()
    },
    [backgroundAudio, intenseBackgroundAudio],
  )

  useEffect(() => {
    backgroundAudio.muted = muted
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

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
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
  }
}

export type UseAudioReturn = ReturnType<typeof useAudio>
