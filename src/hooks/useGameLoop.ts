import { useEffect, useMemo, useState } from 'react'
import type { GameEvent, GameEventChoice, Item, Stats } from '../data/gameData'
import { fallbackEventMedia, gameEvents, items as availableItems } from '../data/gameData'

export type Phase = 'DAY' | 'NIGHT' | 'MORNING'

export type EndingType = 'psychWard' | 'bankruptcy' | 'taxRaid' | 'vappu'

type EndingState = {
  type: EndingType
  dayCount: number
  stats: Stats
}

type MorningReport = {
  rahatDelta: number
  jarkiDelta: number
  note: string
  day: number
}

export type NetMonitorReading = {
  newLai: number
  laiDelta: number
  band: 'calm' | 'odd' | 'rift'
  message: string
  jarkiDelta?: number
  signalDbm: number
  pingMs: number
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
  wasRestored: boolean
  lai: number
}

type GameActions = {
  advancePhase: () => void
  handleChoice: (effect: Partial<Stats>) => void
  buyItem: (item: Item) => boolean
  useItem: (itemId: string) => boolean
  resolveChoice: (choice: GameEventChoice) => ChoiceResolution
  resetGame: () => void
  pingNetMonitor: () => NetMonitorReading
  adjustLAI: (delta: number) => number
}

type LegacyStats = {
  money: number
  reputation: number
  sanity: number
  sisu: number
  pimppaus: number
  byroslavia: number
}

type PersistedStateBase = {
  stats: Stats | LegacyStats
  inventory: Item[]
  phase: Phase
  dayCount: number
  dayStartStats: Stats | LegacyStats
}

type PersistedStateV1 = PersistedStateBase & { version: 1 }

type PersistedStateV2 = PersistedStateBase & { version: 2; lai: number }

type PersistedStateV3 = Omit<PersistedStateBase, 'stats' | 'dayStartStats'> & {
  version: 3
  stats: Stats
  dayStartStats: Stats
  lai: number
}

export type PersistedState = PersistedStateV1 | PersistedStateV2 | PersistedStateV3

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const MAX_DAYS = 30

const INITIAL_STATS: Stats = {
  rahat: 0,
  maine: 10,
  jarki: 100,
  sisu: 50,
  pimppaus: 10,
  byroslavia: 10,
}

const PHASE_ORDER: Phase[] = ['DAY', 'NIGHT', 'MORNING']

const STORAGE_KEY = 'lapin-glory-state'

const hasPersistedShape = (data: unknown): data is PersistedState => {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return (
    (candidate.version === 1 || candidate.version === 2 || candidate.version === 3) &&
    'stats' in candidate &&
    'inventory' in candidate &&
    'phase' in candidate &&
    'dayCount' in candidate &&
    'dayStartStats' in candidate
  )
}

const hasLai = (state: PersistedState | null): state is PersistedStateV2 | PersistedStateV3 =>
  Boolean(state && 'lai' in state)

const normalizeStats = (raw: Stats | LegacyStats | null | undefined): Stats => {
  if (!raw) return INITIAL_STATS
  if ('money' in raw) {
    return {
      rahat: raw.money,
      maine: raw.reputation,
      jarki: raw.sanity,
      sisu: raw.sisu,
      pimppaus: raw.pimppaus,
      byroslavia: raw.byroslavia,
    }
  }

  return raw
}

const loadPersistedState = (): PersistedState | null => {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (hasPersistedShape(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn('Failed to parse persisted state', error)
  }

  return null
}

const savePersistedState = (state: PersistedStateV3): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const pickEventForPhase = (phase: Phase, stats: Stats, lai: number): GameEvent | null => {
  const pool = gameEvents.filter((event) => event.triggerPhase === phase.toLowerCase())
  const conditioned = pool.filter((event) => (event.condition ? event.condition(stats) : true))
  if (conditioned.length === 0) return null
  const occultPool = conditioned.filter((event) => event.vibe === 'occult')
  const mundanePool = conditioned.filter((event) => event.vibe !== 'occult')

  const occultBias = Math.min(Math.max(lai - 40, 0) / 60, 1)
  const mundaneBias = Math.min(Math.max(20 - lai, 0) / 30, 1)

  if (occultPool.length > 0 && Math.random() < occultBias) {
    const roll = Math.floor(Math.random() * occultPool.length)
    return occultPool[roll]
  }

  if (mundanePool.length > 0 && Math.random() < mundaneBias) {
    const roll = Math.floor(Math.random() * mundanePool.length)
    return mundanePool[roll]
  }

  const roll = Math.floor(Math.random() * conditioned.length)
  return conditioned[roll]
}

export const useGameLoop = (): GameState & GameActions => {
  const persistedState = loadPersistedState()

  const [stats, setStats] = useState<Stats>(() => normalizeStats(persistedState?.stats))
  const [inventory, setInventory] = useState<Item[]>(() => persistedState?.inventory ?? [])
  const [phase, setPhase] = useState<Phase>(() => persistedState?.phase ?? 'DAY')
  const [dayCount, setDayCount] = useState<number>(() => persistedState?.dayCount ?? 1)
  const [dayStartStats, setDayStartStats] = useState<Stats>(() => normalizeStats(persistedState?.dayStartStats))
  const [morningReport, setMorningReport] = useState<MorningReport | null>(null)
  const [wasRestored, setWasRestored] = useState(() => Boolean(persistedState))
  const [lai, setLai] = useState<number>(() => (hasLai(persistedState) ? persistedState.lai : 0))

  const currentEvent = useMemo(() => pickEventForPhase(phase, stats, lai), [phase, stats, lai])

  const ending: EndingState | null = useMemo(() => {
    if (stats.jarki <= 0) return { type: 'psychWard', dayCount, stats }
    if (stats.rahat < -1000) return { type: 'bankruptcy', dayCount, stats }
    if (stats.maine > 95) return { type: 'taxRaid', dayCount, stats }
    if (dayCount >= MAX_DAYS && phase === 'MORNING') return { type: 'vappu', dayCount: MAX_DAYS, stats }
    return null
  }, [dayCount, stats, phase])

const isGlitching = stats.jarki < 20 || lai > 70

const adjustLAI = (delta: number) => {
  const next = clamp(lai + delta, 0, 100)
  setLai(next)
  return next
}

  const handleChoice = (effect: Partial<Stats>) => {
    setStats((prev) => ({
      rahat: prev.rahat + (effect.rahat ?? 0),
      maine: clamp(prev.maine + (effect.maine ?? 0), 0, 100),
      jarki: clamp(prev.jarki + (effect.jarki ?? 0), 0, 100),
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
        handleChoice({ rahat: -50 })
        if (lai > 85) handleChoice({ jarki: -2 })
        if (lai < 10) handleChoice({ jarki: 1 })
        const sanityTension = stats.jarki < 25 ? 3 : stats.jarki < 50 ? 1 : stats.jarki > 85 ? -1 : 0
        if (sanityTension !== 0) adjustLAI(sanityTension)
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
    if (stats.rahat < item.price) return false
    if (item.req_stats?.byroslavia && stats.byroslavia < item.req_stats.byroslavia) return false

    handleChoice({ rahat: -item.price })
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

  const buildLaiBand = (value: number): NetMonitorReading['band'] => {
    if (value < 20) return 'calm'
    if (value < 80) return 'odd'
    return 'rift'
  }

  const buildLaiMessage = (value: number, band: NetMonitorReading['band']) => {
    if (value < 20)
      return Math.random() > 0.5
        ? 'Verkko ok. Turistiystävällinen latenssi.'
        : 'Kenttä: tyyni. Tukiasemat humisevat kuin hiljainen suo.'
    if (value < 50)
      return Math.random() > 0.5
        ? 'Revontuli-kanava auki. Linjassa kuiskitaan.'
        : 'Verkkopakat sihisee. Staalo kurkistaa lukemien välistä.'
    if (band === 'odd')
      return Math.random() > 0.5
        ? 'Häiriöitä: signaali nykii kuin VHS-lumi. LAI aaltoilee.'
        : 'Signaali vääristyy, maahinen rummuttaa antennia.'
    return Math.random() > 0.5
      ? 'Staalo häiritsee. Todellisuus repeää.'
      : 'Staalo syöttää outoa puhetta. GSM-kanava välkkyy verenpunaisena.'
  }

  const pingNetMonitor = (): NetMonitorReading => {
    const signalDbm = Math.floor(-110 + Math.random() * 35)
    const basePing = Math.floor(40 + Math.random() * 180)
    const sanityVolatility = stats.jarki < 50 ? 1.6 : 1
    const randomSwing = Math.floor((Math.random() * 7 - 2) * sanityVolatility) // wider if low jarki
    const sanityInfluence = stats.jarki < 35 ? 3 : stats.jarki > 80 ? -2 : 0
    const drift = Math.random() > 0.55 ? 2 : -1
    const delta = clamp(randomSwing + sanityInfluence + drift, -5, 9)
    const nextLai = adjustLAI(delta)
    const band = buildLaiBand(nextLai)
    const pingJitter = nextLai >= 80 ? Math.random() * 120 : nextLai >= 50 ? Math.random() * 60 : Math.random() * 20
    const pingMs = Math.max(12, Math.round(basePing + (band === 'rift' ? pingJitter * 1.5 : pingJitter)))

    const jarkiDelta = nextLai > 90 ? -2 : nextLai < 8 ? 1 : undefined
    if (jarkiDelta) {
      handleChoice({ jarki: jarkiDelta })
    }

    return {
      newLai: nextLai,
      laiDelta: delta,
      band,
      jarkiDelta,
      signalDbm,
      pingMs,
      message: buildLaiMessage(nextLai, band),
    }
  }

  const resetGame = () => {
    setStats(INITIAL_STATS)
    setInventory([])
    setPhase('DAY')
    setDayCount(1)
    setDayStartStats(INITIAL_STATS)
    setMorningReport(null)
    setLai(0)
    setWasRestored(false)
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const buildMorningNote = (state: Stats) => {
    const randomPick = (options: string[]) => options[Math.floor(Math.random() * options.length)]

    if (state.jarki < 20)
      return randomPick([
        'Näytön takaa ilmestyy faksi: "Käy lepää, veli".',
        'Ruudun kulma vuotaa valoa. Kuulostat itseltäsi vastaantulevassa faksissa.',
      ])
    if (state.maine > 65)
      return randomPick([
        'Huhu kiertää: olet Lapin virallinen neon-ikonoklasti.',
        'Posti tuo tuplakirjauksen: kansa odottaa uutta raporttia sinulta.',
      ])
    if (state.rahat < -500)
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
      const moneyDelta = stats.rahat - dayStartStats.rahat
      const jarkiDelta = stats.jarki - dayStartStats.jarki
      setMorningReport({
        rahatDelta: moneyDelta,
        jarkiDelta,
        note: buildMorningNote(stats),
        day: dayCount,
      })
    }
  }, [phase, stats, dayStartStats, dayCount])

  useEffect(() => {
    if (ending) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
      return
    }

    savePersistedState({
      version: 3,
      stats,
      inventory,
      phase,
      dayCount,
      dayStartStats,
      lai,
    })
  }, [stats, inventory, phase, dayCount, dayStartStats, ending, lai])

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
    wasRestored,
    lai,
    advancePhase,
    handleChoice,
    buyItem,
    useItem,
    resolveChoice,
    resetGame,
    pingNetMonitor,
    adjustLAI,
  }
}

export const shopInventory = availableItems
