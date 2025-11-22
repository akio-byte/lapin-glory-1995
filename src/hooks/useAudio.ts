import { useCallback, useEffect, useMemo, useState } from 'react'

type SfxKey = 'choice' | 'nokia' | 'boss'

type UseAudioConfig = {
  backgroundSrc?: string
  sfxMap?: Partial<Record<SfxKey, string>>
}

const DEFAULT_SOURCES: Required<UseAudioConfig> = {
  backgroundSrc: '/audio/bg.wav',
  sfxMap: {
    choice: '/audio/choice.wav',
    nokia: '/audio/nokia.wav',
    boss: '/audio/boss.wav',
  },
}

export const useAudio = (config: UseAudioConfig = {}) => {
  const sources: Required<UseAudioConfig> = {
    backgroundSrc: config.backgroundSrc ?? DEFAULT_SOURCES.backgroundSrc,
    sfxMap: { ...DEFAULT_SOURCES.sfxMap, ...config.sfxMap },
  }
  const [muted, setMuted] = useState(true)
  const [backgroundPlaying, setBackgroundPlaying] = useState(false)

  const backgroundAudio = useMemo(() => {
    const audio = new Audio(sources.backgroundSrc)
    audio.loop = true
    audio.volume = 0.25
    audio.preload = 'auto'
    return audio
  }, [sources.backgroundSrc])

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

  useEffect(() => () => backgroundAudio.pause(), [backgroundAudio])

  useEffect(() => {
    backgroundAudio.muted = muted
    if (muted) {
      backgroundAudio.pause()
      setBackgroundPlaying(false)
    } else if (backgroundPlaying) {
      void backgroundAudio.play()
    }

    Object.values(sfxAudio).forEach((audio) => {
      if (audio) audio.muted = muted
    })
  }, [backgroundAudio, backgroundPlaying, muted, sfxAudio])

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  const toggleBackground = useCallback(() => {
    setBackgroundPlaying((prev) => {
      const next = !prev
      if (muted) return prev
      if (next) {
        void backgroundAudio.play()
      } else {
        backgroundAudio.pause()
      }
      return next
    })
  }, [backgroundAudio, muted])

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
  }
}

export type UseAudioReturn = ReturnType<typeof useAudio>
