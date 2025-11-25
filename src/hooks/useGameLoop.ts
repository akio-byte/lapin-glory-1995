import { useEffect, useMemo, useRef, useState } from 'react'
import type { BuildPath, GameEvent, GameEventChoice, Item, Stats } from '../data/gameData'
import {
  fallbackEventMedia,
  gameEvents,
  getRentForDay,
  getTierForDay,
  items as availableItems,
  resolveEventTier,
  buildPathMeta,
} from '../data/gameData'
import type { EndingType } from '../data/endingData'
import { safeReadJson, safeRemove, safeWriteJson } from '../utils/safeStorage'

export type Phase = 'DAY' | 'NIGHT' | 'MORNING'

type EndingState = {
  type: EndingType
  dayCount: number
  stats: Stats
  lai: number
}

export type MorningReport = {
  rahatDelta: number
  jarkiDelta: number
  laiDelta: number
  note: string
  day: number
}

type MorningReportParams = {
  stats: Stats
  dayStartStats: Stats
  dayCount: number
  lai: number
  dayHistory: DaySnapshot[]
}

export type NetMonitorReading = {
  newLai: number
  laiDelta: number
  band: 'calm' | 'odd' | 'rift'
  message: string
  jarkiDelta?: number
  signalDbm: number
  pingMs: number
  hint?: string | null
}

type ChoiceResolution = {
  outcomeText: string
  appliedEffects: Partial<Stats>
}

export type PathProgress = Record<BuildPath, { xp: number; milestoneIndex: number }>

export type DaySnapshot = { day: number; rahat: number; lai: number; jarki: number; maine: number }

export const createInitialPathProgress = (): PathProgress => ({
  tourist: { xp: 0, milestoneIndex: 0 },
  tax: { xp: 0, milestoneIndex: 0 },
  occult: { xp: 0, milestoneIndex: 0 },
  network: { xp: 0, milestoneIndex: 0 },
})

const normalizePathProgress = (progress?: PathProgress | null): PathProgress => {
  const base = createInitialPathProgress()
  if (!progress) return base
  return {
    tourist: progress.tourist ?? base.tourist,
    tax: progress.tax ?? base.tax,
    occult: progress.occult ?? base.occult,
    network: progress.network ?? base.network,
  }
}

type ActiveModifier = {
  id: string
  name: string
  type: Item['type']
  summary: string
  tags: string[]
}

type GameState = {
  stats: Stats
  activeModifiers: ActiveModifier[]
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
  nextNightEventHint: string | null
  pathProgress: PathProgress
  dayHistory: DaySnapshot[]
}

type GameActions = {
  advancePhase: () => void
  handleChoice: (effect: Partial<Stats>) => void
  buyItem: (item: Item) => boolean
  consumeItem: (itemId: string) => boolean
  resolveChoice: (choice: GameEventChoice) => ChoiceResolution
  resetGame: () => void
  pingNetMonitor: () => NetMonitorReading
  adjustLAI: (delta: number) => number
  setNextNightEventHint: (hint: string | null) => void
  grantPathXp: (xp: Partial<Record<BuildPath, number>>, note?: string) => void
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
type PersistedStateV4 = Omit<PersistedStateBase, 'stats' | 'dayStartStats'> & {
  version: 4
  stats: Stats
  dayStartStats: Stats
  lai: number
  pathProgress: PathProgress
}

type PersistedStateV5 = Omit<PersistedStateBase, 'stats' | 'dayStartStats'> & {
  version: 5
  stats: Stats
  dayStartStats: Stats
  lai: number
  pathProgress: PathProgress
  dayHistory: DaySnapshot[]
}

type PersistedStateV6 = Omit<PersistedStateBase, 'stats' | 'dayStartStats'> & {
  version: 6
  stats: Stats
  dayStartStats: Stats
  lai: number
  pathProgress: PathProgress
  dayHistory: DaySnapshot[]
}

export type PersistedState =
  | PersistedStateV1
  | PersistedStateV2
  | PersistedStateV3
  | PersistedStateV4
  | PersistedStateV5
  | PersistedStateV6

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const MAX_DAYS = 30

export const INITIAL_STATS: Stats = {
  rahat: 200,
  maine: 10,
  jarki: 100,
  sisu: 50,
  pimppaus: 10,
  byroslavia: 10,
}

const PHASE_ORDER: Phase[] = ['DAY', 'NIGHT', 'MORNING']

const STORAGE_KEY = 'lapin-glory-state'
const STORAGE_VERSION = 6

const hasPersistedShape = (data: unknown): data is PersistedState => {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return (
    (candidate.version === 1 ||
      candidate.version === 2 ||
      candidate.version === 3 ||
      candidate.version === 4 ||
      candidate.version === 5 ||
      candidate.version === 6) &&
    'stats' in candidate &&
    'inventory' in candidate &&
    'phase' in candidate &&
    'dayCount' in candidate &&
    'dayStartStats' in candidate
  )
}

const mergeStatDeltas = (base: Stats, delta: Partial<Stats>): Stats => ({
  rahat: base.rahat + (delta.rahat ?? 0),
  maine: clamp(base.maine + (delta.maine ?? 0), 0, 100),
  jarki: clamp(base.jarki + (delta.jarki ?? 0), 0, 100),
  sisu: clamp(base.sisu + (delta.sisu ?? 0), 0, 100),
  pimppaus: clamp(base.pimppaus + (delta.pimppaus ?? 0), 0, 100),
  byroslavia: clamp(base.byroslavia + (delta.byroslavia ?? 0), 0, 100),
})

const sumPassiveModifiers = (inventory: Item[], allowedTypes: Item['type'][] = ['tool', 'form']) => {
  const totals: Partial<Stats> = {}
  inventory.forEach((item) => {
    if (!allowedTypes.includes(item.type)) return
    if (!item.effects.passive) return
    Object.entries(item.effects.passive).forEach(([key, value]) => {
      const typedKey = key as keyof Stats
      totals[typedKey] = (totals[typedKey] ?? 0) + (value ?? 0)
    })
  })
  return totals
}

const applyPassiveModifiers = (base: Stats, modifiers: Partial<Stats>): Stats => {
  const next = { ...base }
  Object.entries(modifiers).forEach(([key, value]) => {
    const typedKey = key as keyof Stats
    if (typedKey === 'rahat') {
      next.rahat += value ?? 0
    } else {
      next[typedKey] = clamp(next[typedKey] + (value ?? 0), 0, 100)
    }
  })
  return next
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

const createMorningReport = ({ stats, dayStartStats, dayCount, lai, dayHistory }: MorningReportParams): MorningReport => {
  const moneyDelta = stats.rahat - dayStartStats.rahat
  const jarkiDelta = stats.jarki - dayStartStats.jarki
  const lastSnapshot = dayHistory.find((entry) => entry.day === dayCount - 1) ?? dayHistory[dayHistory.length - 1]
  const lastLai = lastSnapshot?.lai ?? lai
  const laiDelta = lai - lastLai

  return {
    rahatDelta: moneyDelta,
    jarkiDelta,
    laiDelta,
    note: buildMorningNote(stats),
    day: dayCount,
  }
}

const hasLai = (
  state: PersistedState | null,
): state is PersistedStateV2 | PersistedStateV3 | PersistedStateV4 | PersistedStateV5 | PersistedStateV6 =>
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

const loadPersistedState = (): PersistedStateV6 | null => {
  const parsed = safeReadJson<PersistedState>(STORAGE_KEY)
  if (!parsed) return null
  if (!hasPersistedShape(parsed)) {
    safeRemove(STORAGE_KEY)
    return null
  }

  const normalizedStats = normalizeStats(parsed.stats as Stats)
  const normalizedDayStart = normalizeStats(parsed.dayStartStats as Stats)
  const laiValue = hasLai(parsed) ? parsed.lai : 0
  const normalizedHistory =
    'dayHistory' in parsed && Array.isArray(parsed.dayHistory) && parsed.dayHistory.length > 0
      ? parsed.dayHistory
      : [
          {
            day: parsed.dayCount ?? 1,
            rahat: normalizedStats.rahat,
            lai: laiValue,
            jarki: normalizedStats.jarki,
            maine: normalizedStats.maine,
          },
        ]

  const normalized: PersistedStateV6 = {
    version: STORAGE_VERSION,
    stats: normalizedStats,
    inventory: parsed.inventory ?? [],
    phase: parsed.phase ?? 'DAY',
    dayCount: parsed.dayCount ?? 1,
    dayStartStats: normalizedDayStart,
    lai: laiValue,
    pathProgress: normalizePathProgress('pathProgress' in parsed ? parsed.pathProgress : null),
    dayHistory: normalizedHistory,
  }

  safeWriteJson(STORAGE_KEY, normalized)
  return normalized
}

const savePersistedState = (state: PersistedStateV6): void => {
  safeWriteJson(STORAGE_KEY, state)
}

export const pickEventForPhase = (
  phase: Phase,
  stats: Stats,
  lai: number,
  dayCount: number,
  random: () => number = Math.random,
): GameEvent | null => {
  const pool = gameEvents.filter((event) => event.triggerPhase === phase.toLowerCase())
  const tier = getTierForDay(dayCount)
  const conditioned = pool.filter(
    (event) => (event.condition ? event.condition(stats) : true) && resolveEventTier(event) <= tier,
  )
  if (conditioned.length === 0) return null
  const occultPool = conditioned.filter((event) => event.vibe === 'occult')
  const mundanePool = conditioned.filter((event) => event.vibe !== 'occult')

  const occultBias = Math.min(Math.max(lai - 40, 0) / 60, 1)
  const mundaneBias = Math.min(Math.max(20 - lai, 0) / 30, 1)

  if (occultPool.length > 0 && random() < occultBias) {
    const roll = Math.floor(random() * occultPool.length)
    return occultPool[roll]
  }

  if (mundanePool.length > 0 && random() < mundaneBias) {
    const roll = Math.floor(random() * mundanePool.length)
    return mundanePool[roll]
  }

  const roll = Math.floor(random() * conditioned.length)
  return conditioned[roll]
}

export const evaluateEndingForState = ({
  stats,
  dayCount,
  phase,
  pathProgress,
  lai,
}: {
  stats: Stats
  dayCount: number
  phase: Phase
  pathProgress: PathProgress
  lai: number
}): EndingState | null => {
  if (stats.jarki <= 0) return { type: 'psychWard', dayCount, stats, lai }
  if (stats.rahat < -1000) return { type: 'bankruptcy', dayCount, stats, lai }
  if (stats.maine > 95) return { type: 'taxRaid', dayCount, stats, lai }
  if (dayCount >= MAX_DAYS && phase === 'MORNING') {
    const pathScores = (Object.keys(pathProgress) as BuildPath[]).map((path) => ({
      path,
      level: pathProgress[path]?.milestoneIndex ?? 0,
      xp: pathProgress[path]?.xp ?? 0,
    }))
    const highestPath = pathScores.sort((a, b) => b.level - a.level || b.xp - a.xp)[0]

    if (lai > 90 && (highestPath?.path === 'occult' || highestPath?.path === 'network')) {
      return { type: highestPath.path === 'occult' ? 'occultAscension' : 'networkProphet', dayCount, stats, lai }
    }
    if (highestPath?.path === 'tourist' && stats.rahat > 1500 && stats.maine > 55) {
      return { type: 'touristMogul', dayCount, stats, lai }
    }
    if (highestPath?.path === 'tax' && stats.maine < 70 && stats.byroslavia > 40) {
      return { type: 'taxLegend', dayCount, stats, lai }
    }
    if (lai > 96) {
      return { type: 'riftCollapse', dayCount, stats, lai }
    }
    return { type: 'vappu', dayCount: MAX_DAYS, stats, lai }
  }
  return null
}

function applyPathXpSimulation(
  currentProgress: PathProgress,
  xp: Partial<Record<BuildPath, number>>,
): { rewards: Partial<Stats>; updatedProgress: PathProgress } {
  const updates: PathProgress = { ...currentProgress }
  const rewards: Partial<Stats> = {}

  ;(Object.keys(xp) as BuildPath[]).forEach((path) => {
    const gain = xp[path]
    if (!gain) return
    const current = updates[path]?.xp ?? 0
    const nextXp = current + gain
    const milestones = buildPathMeta[path].milestones
    const currentMilestoneIndex = updates[path]?.milestoneIndex ?? 0
    let milestoneIndex = currentMilestoneIndex
    while (milestoneIndex < milestones.length && nextXp >= milestones[milestoneIndex]) {
      milestoneIndex += 1
      if (path === 'tourist') {
        rewards.maine = (rewards.maine ?? 0) + 3
        rewards.rahat = (rewards.rahat ?? 0) + 40
      }
      if (path === 'tax') {
        rewards.byroslavia = (rewards.byroslavia ?? 0) + 4
        rewards.jarki = (rewards.jarki ?? 0) + 1
      }
      if (path === 'occult') {
        rewards.jarki = (rewards.jarki ?? 0) + 2
        rewards.sisu = (rewards.sisu ?? 0) + 2
      }
      if (path === 'network') {
        rewards.byroslavia = (rewards.byroslavia ?? 0) + 2
        rewards.pimppaus = (rewards.pimppaus ?? 0) + 2
      }
    }

    updates[path] = { xp: nextXp, milestoneIndex }
  })

  return { rewards, updatedProgress: updates }
}

const computeChoiceResolution = (
  choice: GameEventChoice,
  currentEvent: GameEvent | null,
  stats: Stats,
  inventory: Item[],
  pathProgress: PathProgress,
  random: () => number,
  options?: { applyPathRewards?: boolean; activeTags?: Set<string> },
): { appliedEffects: Partial<Stats>; outcomeText: string; updatedPathProgress: PathProgress } => {
  const baseEffect = { ...choice.cost } as Partial<Stats>
  let success = true
  const activeTags = options?.activeTags ?? new Set(inventory.flatMap((item) => item.tags ?? []))
  const tagBonus = (() => {
    if (!currentEvent) return 0

    const eventTags = currentEvent.tags ?? []
    const tagWeights: Record<string, number> = {
      tax: 2,
      form: 2,
      occult: currentEvent.vibe === 'occult' ? 3 : 1,
      tourist: 2,
      network: 2,
    }

    let bonus = 0
    if (currentEvent.paperWar && (activeTags.has('tax') || activeTags.has('form'))) bonus += 3
    if (currentEvent.vibe === 'occult' && activeTags.has('occult')) bonus += 3
    if (/turisti|bussi/i.test(currentEvent.id) && activeTags.has('tourist')) bonus += 2

    eventTags.forEach((tag) => {
      if (activeTags.has(tag)) {
        bonus += tagWeights[tag] ?? 1
      }
    })

    return bonus
  })()
  const formSupport = currentEvent?.paperWar && inventory.some((item) => item.type === 'form')

  if (choice.skillCheck) {
    const statValue = stats[choice.skillCheck.stat]
    const roll = Math.floor(random() * 20)
    success = statValue + roll + tagBonus >= choice.skillCheck.dc
    if (!success && formSupport) {
      success = statValue + roll + tagBonus + 3 >= choice.skillCheck.dc
    }
  }

  const outcome = success ? choice.outcomeSuccess : choice.outcomeFail
  const combinedEffects: Partial<Stats> = { ...baseEffect }
  let outcomeText = outcome.text

  if (formSupport && currentEvent?.paperWar) {
    const paperworkBoost = success ? 2 : 0
    if (paperworkBoost > 0) {
      combinedEffects.byroslavia = (combinedEffects.byroslavia ?? 0) + paperworkBoost
      outcomeText = `${outcomeText} (Lomakkeet voimistavat paperisotaa.)`
    }
  }

  Object.entries(outcome.effects).forEach(([key, value]) => {
    const typedKey = key as keyof Stats
    combinedEffects[typedKey] = (combinedEffects[typedKey] ?? 0) + (value ?? 0)
  })

  let updatedPathProgress = pathProgress
  if (choice.pathXp && options?.applyPathRewards) {
    const pathRewards = applyPathXpSimulation(pathProgress, choice.pathXp)
    updatedPathProgress = pathRewards.updatedProgress
    Object.entries(pathRewards.rewards).forEach(([key, value]) => {
      const typedKey = key as keyof Stats
      combinedEffects[typedKey] = (combinedEffects[typedKey] ?? 0) + (value ?? 0)
    })
  }

  return { appliedEffects: combinedEffects, outcomeText, updatedPathProgress }
}

export const useGameLoop = (): GameState & GameActions => {
  const persistedState = loadPersistedState()

  const [baseStats, setBaseStats] = useState<Stats>(() => normalizeStats(persistedState?.stats))
  const [inventory, setInventory] = useState<Item[]>(() => persistedState?.inventory ?? [])
  const [phase, setPhase] = useState<Phase>(() => persistedState?.phase ?? 'DAY')
  const [dayCount, setDayCount] = useState<number>(() => persistedState?.dayCount ?? 1)
  const [dayStartStats, setDayStartStats] = useState<Stats>(() => normalizeStats(persistedState?.dayStartStats))
  const [morningReport, setMorningReport] = useState<MorningReport | null>(null)
  const [wasRestored, setWasRestored] = useState(() => Boolean(persistedState))
  const [lai, setLai] = useState<number>(() => (hasLai(persistedState) ? persistedState.lai : 0))
  const [nextNightEventHint, setNextNightEventHint] = useState<string | null>(null)
  const [pathProgress, setPathProgress] = useState<PathProgress>(() =>
    normalizePathProgress(persistedState?.pathProgress ?? null),
  )
  const [dayHistory, setDayHistory] = useState<DaySnapshot[]>(() => {
    if (persistedState && 'dayHistory' in persistedState && persistedState.dayHistory?.length) {
      return persistedState.dayHistory
    }
    return [{ day: persistedState?.dayCount ?? 1, rahat: baseStats.rahat, lai, jarki: baseStats.jarki, maine: baseStats.maine }]
  })

  const passiveModifiers = useMemo(() => sumPassiveModifiers(inventory, ['tool', 'form', 'relic']), [inventory])
  const stats = useMemo(() => applyPassiveModifiers(baseStats, passiveModifiers), [baseStats, passiveModifiers])
  const activeModifiers = useMemo<ActiveModifier[]>(
    () =>
      inventory
        .filter((item) => item.type === 'tool' || item.type === 'form' || item.type === 'relic')
        .map((item) => ({ id: item.id, name: item.name, type: item.type, summary: item.summary, tags: item.tags })),
    [inventory],
  )
  const activeTags = useMemo(() => new Set(inventory.flatMap((item) => item.tags ?? [])), [inventory])

  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(() =>
    phase === 'MORNING' ? null : pickEventForPhase(phase, stats, lai, dayCount),
  )
  const prevPhaseRef = useRef<Phase>(phase)
  const eventRollRef = useRef<{ phase: Phase; day: number }>({ phase, day: dayCount })
  const persistSnapshotRef = useRef<string>('')

  const ending: EndingState | null = useMemo(
    () => evaluateEndingForState({ stats, dayCount, phase, pathProgress, lai }),
    [dayCount, lai, pathProgress, phase, stats],
  )

  const isGlitching = stats.jarki < 20 || lai > 70

  const adjustLAI = (delta: number) => {
    const next = clamp(lai + delta, 0, 100)
    setLai(next)
    return next
  }

  const grantPathXp = (xp: Partial<Record<BuildPath, number>>, note?: string) => {
    const updates: PathProgress = { ...pathProgress }
    const rewards: Partial<Stats> = {}

    ;(Object.keys(xp) as BuildPath[]).forEach((path) => {
      const gain = xp[path]
      if (!gain) return
      const current = updates[path]?.xp ?? 0
      const nextXp = current + gain
      const milestones = buildPathMeta[path].milestones
      const currentMilestoneIndex = updates[path]?.milestoneIndex ?? 0
      let milestoneIndex = currentMilestoneIndex
      while (milestoneIndex < milestones.length && nextXp >= milestones[milestoneIndex]) {
        milestoneIndex += 1
        // Reward: small stat bumps tuned per path identity
        if (path === 'tourist') {
          rewards.maine = (rewards.maine ?? 0) + 3
          rewards.rahat = (rewards.rahat ?? 0) + 40
        }
        if (path === 'tax') {
          rewards.byroslavia = (rewards.byroslavia ?? 0) + 4
          rewards.jarki = (rewards.jarki ?? 0) + 1
        }
        if (path === 'occult') {
          rewards.jarki = (rewards.jarki ?? 0) + 2
          rewards.sisu = (rewards.sisu ?? 0) + 2
        }
        if (path === 'network') {
          rewards.byroslavia = (rewards.byroslavia ?? 0) + 2
          rewards.pimppaus = (rewards.pimppaus ?? 0) + 2
        }
      }

      updates[path] = { xp: nextXp, milestoneIndex }
    })

    setPathProgress(updates)
    if (Object.keys(rewards).length > 0) {
      handleChoice(rewards)
    }

    if (note) {
      console.info('Path XP awarded', xp, note)
    }
  }

  const handleChoice = (effect: Partial<Stats>) => {
    setBaseStats((prev) => mergeStatDeltas(prev, effect))
  }

  const advancePhase = () => {
    if (ending) return

    setPhase((prev) => {
      const currentIndex = PHASE_ORDER.indexOf(prev)
      const next = PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length]

      if (prev === 'MORNING') {
        setMorningReport(null)
      }

      if (next === 'DAY') {
        const upcomingDay = dayCount + 1
        const rent = getRentForDay(upcomingDay)

        setDayCount((count) => count + 1)
        setDayStartStats(() => ({ ...baseStats }))
        setDayHistory((prevHistory) => {
          const withoutDupes = prevHistory.filter((entry) => entry.day !== dayCount)
          return [...withoutDupes, { day: dayCount, rahat: stats.rahat, lai, jarki: stats.jarki, maine: stats.maine }]
        })
        handleChoice({ rahat: -rent })
        if (lai > 85) handleChoice({ jarki: -2 })
        if (lai < 10) handleChoice({ jarki: 1 })
        const sanityTension = stats.jarki < 25 ? 3 : stats.jarki < 50 ? 1 : stats.jarki > 85 ? -1 : 0
        if (sanityTension !== 0) adjustLAI(sanityTension)
        setNextNightEventHint(null)
      }

      if (next === 'NIGHT') {
        setNextNightEventHint(null)
      }

      return next
    })
  }

  const consumeItem = (itemId: string) => {
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

    if (item.type === 'consumable' && item.autoUseOnPurchase) {
      return consumeItem(item.id)
    }

    return true
  }

  const resolveChoice = (choice: GameEventChoice): ChoiceResolution => {
    const resolution = computeChoiceResolution(
      choice,
      currentEvent,
      stats,
      inventory,
      pathProgress,
      Math.random,
      { activeTags },
    )

    handleChoice(resolution.appliedEffects)

    if (choice.pathXp) {
      grantPathXp(choice.pathXp, `choice:${choice.label}`)
    }

    return { outcomeText: resolution.outcomeText, appliedEffects: resolution.appliedEffects }
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

  const describeEventHint = (event: GameEvent | null): string | null => {
    if (!event) return null
    const id = event.id.toLowerCase()
    if (id.includes('verottaja')) return 'VEROTTAJA'
    if (id.includes('turisti') || id.includes('bussi')) return 'TURISTIBUSSI'
    if (id.includes('staalo')) return 'STAALO'
    if (id.includes('kultti') || event.vibe === 'occult') return 'KULTTI/OKKULT'
    if (id.includes('eu') || id.includes('tarkast')) return 'EU-TARKASTUS'
    return event.vibe === 'mundane' ? 'ARKI-HASSLE' : 'VERKKOVIIVE'
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

    const pingLuck = Math.random()
    const skillFactor = stats.byroslavia / 120
    const successfulProphecy = pingLuck + skillFactor > 0.65
    const hintedEvent = successfulProphecy ? pickEventForPhase('NIGHT', stats, nextLai, dayCount) : null
    const hintText = hintedEvent ? `Signaali varoittaa: ${describeEventHint(hintedEvent)}` : null
    if (hintText) {
      setNextNightEventHint(hintText)
    }

    return {
      newLai: nextLai,
      laiDelta: delta,
      band,
      jarkiDelta,
      signalDbm,
      pingMs,
      message: buildLaiMessage(nextLai, band),
      hint: hintText,
    }
  }

  const resetGame = () => {
    setBaseStats(INITIAL_STATS)
    setInventory([])
    setPhase('DAY')
    setDayCount(1)
    setDayStartStats(INITIAL_STATS)
    setMorningReport(null)
    setLai(0)
    setNextNightEventHint(null)
    setPathProgress(createInitialPathProgress())
    setDayHistory([{ day: 1, rahat: INITIAL_STATS.rahat, lai: 0, jarki: INITIAL_STATS.jarki, maine: INITIAL_STATS.maine }])
    setWasRestored(false)
    setCurrentEvent(null)
    eventRollRef.current = { phase: 'DAY', day: 1 }
    persistSnapshotRef.current = ''
    safeRemove(STORAGE_KEY)
  }

  useEffect(() => {
    const phaseChanged = phase !== prevPhaseRef.current
    if (phaseChanged) {
      prevPhaseRef.current = phase
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentEvent(null)
    }

    if (phase === 'MORNING') {
      eventRollRef.current = { phase, day: dayCount }
      return
    }

    const alreadyRolled =
      eventRollRef.current.phase === phase && eventRollRef.current.day === dayCount && currentEvent !== null

    if (!alreadyRolled) {
      const nextEvent = pickEventForPhase(phase, stats, lai, dayCount)
      setCurrentEvent(nextEvent)
      eventRollRef.current = { phase, day: dayCount }
    }
  }, [currentEvent, dayCount, lai, phase, stats])

  useEffect(() => {
    if (phase !== 'MORNING') return
    if (morningReport?.day === dayCount) return

    const report = createMorningReport({
      stats,
      dayStartStats,
      dayCount,
      lai,
      dayHistory,
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMorningReport(report)
    setDayHistory((prev) => {
      const withoutDupes = prev.filter((entry) => entry.day !== dayCount)
      return [...withoutDupes, { day: dayCount, rahat: stats.rahat, lai, jarki: stats.jarki, maine: stats.maine }]
    })
  }, [phase, stats, dayStartStats, dayCount, lai, dayHistory, morningReport])

  useEffect(() => {
    if (ending) {
      safeRemove(STORAGE_KEY)
      persistSnapshotRef.current = ''
      return
    }

    const payload: PersistedStateV6 = {
      version: STORAGE_VERSION,
      stats: baseStats,
      inventory,
      phase,
      dayCount,
      dayStartStats,
      lai,
      pathProgress,
      dayHistory,
    }
    const snapshot = JSON.stringify(payload)
    if (snapshot === persistSnapshotRef.current) return
    persistSnapshotRef.current = snapshot
    savePersistedState(payload)
  }, [baseStats, inventory, phase, dayCount, dayStartStats, ending, lai, pathProgress, dayHistory])

  return {
    activeModifiers,
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
    nextNightEventHint,
    pathProgress,
    dayHistory,
    advancePhase,
    handleChoice,
    buyItem,
    consumeItem,
    resolveChoice,
    resetGame,
    pingNetMonitor,
    adjustLAI,
    setNextNightEventHint,
    grantPathXp,
  }
}

export const shopInventory = availableItems

type SimulationState = {
  baseStats: Stats
  inventory: Item[]
  lai: number
  phase: Phase
  dayCount: number
  pathProgress: PathProgress
  dayHistory: DaySnapshot[]
  dayStartStats: Stats
  morningReportDays: number[]
}

const resolveChoiceForSimulation = (
  choice: GameEventChoice,
  currentEvent: GameEvent | null,
  stats: Stats,
  inventory: Item[],
  pathProgress: PathProgress,
  random: () => number,
): { appliedEffects: Partial<Stats>; outcomeText: string; updatedPathProgress: PathProgress } => {
  return computeChoiceResolution(choice, currentEvent, stats, inventory, pathProgress, random, {
    applyPathRewards: true,
  })
}

const advancePhaseInSimulation = (state: SimulationState) => {
  const currentIndex = PHASE_ORDER.indexOf(state.phase)
  const next = PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length]
  const stats = applyPassiveModifiers(state.baseStats, sumPassiveModifiers(state.inventory, ['tool', 'form', 'relic']))

  if (next === 'DAY') {
    const upcomingDay = state.dayCount + 1
    const rent = getRentForDay(upcomingDay)
    const withoutDupes = state.dayHistory.filter((entry) => entry.day !== state.dayCount)
    state.dayHistory = [...withoutDupes, { day: state.dayCount, rahat: stats.rahat, lai: state.lai, jarki: stats.jarki, maine: stats.maine }]
    state.dayCount += 1
    state.dayStartStats = { ...state.baseStats }
    state.baseStats = mergeStatDeltas(state.baseStats, { rahat: -rent })
    if (state.lai > 85) {
      state.baseStats = mergeStatDeltas(state.baseStats, { jarki: -2 })
    }
    if (state.lai < 10) {
      state.baseStats = mergeStatDeltas(state.baseStats, { jarki: 1 })
    }
    const sanityTension = stats.jarki < 25 ? 3 : stats.jarki < 50 ? 1 : stats.jarki > 85 ? -1 : 0
    if (sanityTension !== 0) {
      state.lai = clamp(state.lai + sanityTension, 0, 100)
    }
  }

  state.phase = next
}

export type SimulationLogEntry = {
  step: number
  phase: Phase
  day: number
  lai: number
  stats: Stats
  eventId: string | null
  choiceLabel?: string
}

export type SimulationResult = {
  ending: EndingState | null
  log: SimulationLogEntry[]
  finalStats: Stats
  pathProgress: PathProgress
  dayHistory: DaySnapshot[]
  morningReportDays: number[]
}

export const __test_simulateRun = (options?: { maxSteps?: number; random?: () => number }): SimulationResult => {
  const random = options?.random ?? Math.random
  const state: SimulationState = {
    baseStats: { ...INITIAL_STATS },
    inventory: [],
    lai: 0,
    phase: 'DAY',
    dayCount: 1,
    pathProgress: createInitialPathProgress(),
    dayHistory: [
      { day: 1, rahat: INITIAL_STATS.rahat, lai: 0, jarki: INITIAL_STATS.jarki, maine: INITIAL_STATS.maine },
    ],
    dayStartStats: { ...INITIAL_STATS },
    morningReportDays: [],
  }

  const maxSteps = options?.maxSteps ?? 240
  const log: SimulationLogEntry[] = []
  let ending: EndingState | null = null

  for (let step = 0; step < maxSteps; step += 1) {
    const stats = applyPassiveModifiers(state.baseStats, sumPassiveModifiers(state.inventory, ['tool', 'form', 'relic']))
    const event = state.phase === 'MORNING' ? null : pickEventForPhase(state.phase, stats, state.lai, state.dayCount, random)

    if (state.phase === 'MORNING' && state.morningReportDays[state.morningReportDays.length - 1] !== state.dayCount) {
      const report = createMorningReport({
        stats,
        dayStartStats: state.dayStartStats,
        dayCount: state.dayCount,
        lai: state.lai,
        dayHistory: state.dayHistory,
      })
      state.morningReportDays.push(report.day)
      const withoutDupes = state.dayHistory.filter((entry) => entry.day !== state.dayCount)
      state.dayHistory = [
        ...withoutDupes,
        { day: state.dayCount, rahat: stats.rahat, lai: state.lai, jarki: stats.jarki, maine: stats.maine },
      ]
    }

    if (event) {
      const choice = event.choices[0]
      const resolution = resolveChoiceForSimulation(choice, event, stats, state.inventory, state.pathProgress, random)
      state.baseStats = mergeStatDeltas(state.baseStats, resolution.appliedEffects)
      state.pathProgress = resolution.updatedPathProgress
    }

    const updatedStats = applyPassiveModifiers(state.baseStats, sumPassiveModifiers(state.inventory, ['tool', 'form', 'relic']))
    log.push({
      step,
      phase: state.phase,
      day: state.dayCount,
      lai: state.lai,
      stats: { ...updatedStats },
      eventId: event?.id ?? null,
      choiceLabel: event?.choices[0]?.label,
    })

    ending = evaluateEndingForState({
      stats: updatedStats,
      dayCount: state.dayCount,
      phase: state.phase,
      pathProgress: state.pathProgress,
      lai: state.lai,
    })
    if (ending) break

    advancePhaseInSimulation(state)
  }

  const finalStats = applyPassiveModifiers(state.baseStats, sumPassiveModifiers(state.inventory, ['tool', 'form', 'relic']))

  return { ending, log, finalStats, pathProgress: state.pathProgress, dayHistory: state.dayHistory, morningReportDays: state.morningReportDays }
}

export const __test_resolveChoice = (
  event: GameEvent,
  choiceIndex = 0,
  context?: { stats?: Stats; inventory?: Item[]; pathProgress?: PathProgress; random?: () => number },
) => {
  const stats = context?.stats ?? { ...INITIAL_STATS }
  const inventory = context?.inventory ?? []
  const pathProgress = context?.pathProgress ?? createInitialPathProgress()
  const random = context?.random ?? Math.random
  const choice = event.choices[choiceIndex] ?? event.choices[0]

  return resolveChoiceForSimulation(choice, event, stats, inventory, pathProgress, random)
}
