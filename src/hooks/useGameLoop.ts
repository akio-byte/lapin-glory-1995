import { useMemo, useState } from 'react'
import type { GameEvent, GameEventChoice, Item, Stats } from '../data/gameData'
import { fallbackEventMedia, gameEvents, items as availableItems } from '../data/gameData'

export type Phase = 'DAY' | 'NIGHT' | 'MORNING'

type ChoiceResolution = {
  outcomeText: string
  appliedEffects: Partial<Stats>
}

type GameState = {
  stats: Stats
  inventory: Item[]
  phase: Phase
  dayCount: number
  isGameOver: boolean
  isGlitching: boolean
  currentEvent: GameEvent | null
  fallbackMedia: NonNullable<GameEvent['media']>
}

type GameActions = {
  advancePhase: () => void
  handleChoice: (effect: Partial<Stats>) => void
  buyItem: (item: Item) => boolean
  resolveChoice: (choice: GameEventChoice) => ChoiceResolution
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const INITIAL_STATS: Stats = {
  money: 0,
  reputation: 10,
  sanity: 100,
  sisu: 50,
  pimppaus: 10,
  byroslavia: 10,
}

const PHASE_ORDER: Phase[] = ['DAY', 'NIGHT', 'MORNING']

const pickEventForPhase = (phase: Phase, stats: Stats): GameEvent | null => {
  const pool = gameEvents.filter((event) => event.triggerPhase === phase.toLowerCase())
  const conditioned = pool.filter((event) => (event.condition ? event.condition(stats) : true))
  if (conditioned.length === 0) return null
  const roll = Math.floor(Math.random() * conditioned.length)
  return conditioned[roll]
}

export const useGameLoop = (): GameState & GameActions => {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS)
  const [inventory, setInventory] = useState<Item[]>([])
  const [phase, setPhase] = useState<Phase>('DAY')
  const [dayCount, setDayCount] = useState<number>(1)

  const currentEvent = useMemo(() => pickEventForPhase(phase, stats), [phase, stats])

  const isGameOver = stats.sanity <= 0 || stats.money < -1000
  const isGlitching = stats.sanity < 20

  const handleChoice = (effect: Partial<Stats>) => {
    setStats((prev) => ({
      money: prev.money + (effect.money ?? 0),
      reputation: clamp(prev.reputation + (effect.reputation ?? 0), 0, 100),
      sanity: clamp(prev.sanity + (effect.sanity ?? 0), 0, 100),
      sisu: clamp(prev.sisu + (effect.sisu ?? 0), 0, 100),
      pimppaus: clamp(prev.pimppaus + (effect.pimppaus ?? 0), 0, 100),
      byroslavia: clamp(prev.byroslavia + (effect.byroslavia ?? 0), 0, 100),
    }))
  }

  const advancePhase = () => {
    setPhase((prev) => {
      const currentIndex = PHASE_ORDER.indexOf(prev)
      const next = PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length]

      if (next === 'DAY') {
        setDayCount((count) => count + 1)
        handleChoice({ money: -50 })
      }

      return next
    })
  }

  const buyItem = (item: Item) => {
    if (stats.money < item.price) return false
    handleChoice({ money: -item.price })
    const bonus = item.effects.byroslavia_bonus ?? 0
    if (bonus !== 0) {
      handleChoice({ byroslavia: bonus })
    }
    if (item.effects.sanity) handleChoice({ sanity: item.effects.sanity })
    if (item.effects.reputation) handleChoice({ reputation: item.effects.reputation })
    if (item.effects.sisu) handleChoice({ sisu: item.effects.sisu })
    setInventory((prev) => [...prev, item])
    return true
  }

  const resolveChoice = (choice: GameEventChoice): ChoiceResolution => {
    const baseEffect = { ...choice.cost } as Partial<Stats>
    let success = true

    if (choice.skillCheck) {
      const statValue = stats[choice.skillCheck.stat]
      const roll = Math.floor(Math.random() * 20)
      success = statValue + roll >= choice.skillCheck.dc
    }

    const outcome = success ? choice.outcomeSuccess : choice.outcomeFail
    const combinedEffects: Partial<Stats> = { ...baseEffect }

    Object.entries(outcome.effects).forEach(([key, value]) => {
      const typedKey = key as keyof Stats
      combinedEffects[typedKey] = (combinedEffects[typedKey] ?? 0) + (value ?? 0)
    })

    handleChoice(combinedEffects)

    return { outcomeText: outcome.text, appliedEffects: combinedEffects }
  }

  return {
    stats,
    inventory,
    phase,
    dayCount,
    isGameOver,
    isGlitching,
    currentEvent,
    fallbackMedia: fallbackEventMedia,
    advancePhase,
    handleChoice,
    buyItem,
    resolveChoice,
  }
}

export const shopInventory = availableItems
