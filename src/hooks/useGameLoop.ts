import { useEffect, useMemo, useState } from 'react'
import type { GameEvent, GameEventChoice, Item, Stats } from '../data/gameData'
import { fallbackEventMedia, gameEvents, items as availableItems } from '../data/gameData'

export type Phase = 'DAY' | 'NIGHT' | 'MORNING'

export type EndingType = 'psychWard' | 'bankruptcy' | 'vappu'

type EndingState = {
  type: EndingType
  dayCount: number
  stats: Stats
}

type MorningReport = {
  moneyDelta: number
  sanityDelta: number
  note: string
  day: number
}

type ChoiceResolution = {
  outcomeText: string
  appliedEffects: Partial<Stats>
}

type GameState = {
  stats: Stats
  inventory: Item[]
  phase: Phase
  dayCount: number
  ending: EndingState | null
  isGlitching: boolean
  currentEvent: GameEvent | null
  fallbackMedia: NonNullable<GameEvent['media']>
  morningReport: MorningReport | null
}

type GameActions = {
  advancePhase: () => void
  handleChoice: (effect: Partial<Stats>) => void
  buyItem: (item: Item) => boolean
  useItem: (itemId: string) => boolean
  resolveChoice: (choice: GameEventChoice) => ChoiceResolution
  resetGame: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const MAX_DAYS = 30

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
  const [dayStartStats, setDayStartStats] = useState<Stats>(INITIAL_STATS)
  const [morningReport, setMorningReport] = useState<MorningReport | null>(null)

  const currentEvent = useMemo(() => pickEventForPhase(phase, stats), [phase, stats])

  const ending: EndingState | null = useMemo(() => {
    if (stats.sanity <= 0) return { type: 'psychWard', dayCount, stats }
    if (stats.money < -1000) return { type: 'bankruptcy', dayCount, stats }
    if (dayCount > MAX_DAYS) return { type: 'vappu', dayCount: MAX_DAYS, stats }
    return null
  }, [dayCount, stats])

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
    if (ending) return

    setPhase((prev) => {
      const currentIndex = PHASE_ORDER.indexOf(prev)
      const next = PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length]

      if (next === 'DAY') {
        setDayCount((count) => count + 1)
        setDayStartStats(() => ({ ...stats }))
        handleChoice({ money: -50 })
      }

      return next
    })
  }

  const useItem = (itemId: string) => {
    const ownedItem = inventory.find((inv) => inv.id === itemId)
    if (!ownedItem) return false

    if (ownedItem.effects.immediate) {
      handleChoice(ownedItem.effects.immediate)
    }

    if (ownedItem.type === 'consumable') {
      setInventory((prev) => {
        const idx = prev.findIndex((entry) => entry.id === itemId)
        if (idx === -1) return prev
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
      })
    }

    return true
  }

  const buyItem = (item: Item) => {
    if (stats.money < item.price) return false
    if (item.req_stats?.byroslavia && stats.byroslavia < item.req_stats.byroslavia) return false

    handleChoice({ money: -item.price })
    setInventory((prev) => [...prev, item])

    if (item.type !== 'consumable' && item.effects.passive) {
      handleChoice(item.effects.passive)
    }

    if (item.type === 'consumable' && item.autoUseOnPurchase) {
      return useItem(item.id)
    }

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

  const resetGame = () => {
    setStats(INITIAL_STATS)
    setInventory([])
    setPhase('DAY')
    setDayCount(1)
    setDayStartStats(INITIAL_STATS)
    setMorningReport(null)
  }

  const buildMorningNote = (state: Stats) => {
    const randomPick = (options: string[]) => options[Math.floor(Math.random() * options.length)]

    if (state.sanity < 20)
      return randomPick([
        'Näytön takaa ilmestyy faksi: "Käy lepää, veli".',
        'Ruudun kulma vuotaa valoa. Kuulostat itseltäsi vastaantulevassa faksissa.',
      ])
    if (state.reputation > 65)
      return randomPick([
        'Huhu kiertää: olet Lapin virallinen neon-ikonoklasti.',
        'Posti tuo tuplakirjauksen: kansa odottaa uutta raporttia sinulta.',
      ])
    if (state.money < -500)
      return randomPick([
        'Kirjanpitäjä kuiskaa, että markat pakenevat kuin revontulet.',
        'Pankin faksi kysyy: onko tää vielä harrastus vai performanssi?',
      ])
    return randomPick([
      'Kahvinkeittimen ääni muistuttaa huminaa. Uusi päivä, uusi lomake.',
      'OS/95 piippaa hiljaa: "Muista hengittää ennen kuin avaat postin".',
    ])
  }

  useEffect(() => {
    if (phase === 'MORNING') {
      const moneyDelta = stats.money - dayStartStats.money
      const sanityDelta = stats.sanity - dayStartStats.sanity
      setMorningReport({
        moneyDelta,
        sanityDelta,
        note: buildMorningNote(stats),
        day: dayCount,
      })
    }
  }, [phase, stats, dayStartStats, dayCount])

  return {
    stats,
    inventory,
    phase,
    dayCount,
    ending,
    isGlitching,
    currentEvent,
    fallbackMedia: fallbackEventMedia,
    morningReport,
    advancePhase,
    handleChoice,
    buyItem,
    useItem,
    resolveChoice,
    resetGame,
  }
}

export const shopInventory = availableItems
