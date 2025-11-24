import { describe, expect, it } from 'vitest'

import { INITIAL_STATS, evaluateEndingForState, createInitialPathProgress } from '../src/hooks/useGameLoop'
import type { PathProgress, Phase } from '../src/hooks/useGameLoop'
import type { Stats } from '../src/data/gameData'

type EndingParams = {
  stats: Stats
  lai: number
  dayCount: number
  phase: Phase
  pathProgress?: PathProgress
}

const buildState = ({ stats, lai, dayCount, phase, pathProgress }: EndingParams) =>
  evaluateEndingForState({
    stats,
    lai,
    dayCount,
    phase,
    pathProgress: pathProgress ?? createInitialPathProgress(),
  })

  describe('ending selection logic', () => {
  it('returns immediate fail endings when stats crash', () => {
    const psychWard = buildState({ stats: { ...INITIAL_STATS, jarki: 0 }, lai: 10, dayCount: 3, phase: 'MORNING' })
    const bankruptcy = buildState({ stats: { ...INITIAL_STATS, rahat: -1200 }, lai: 10, dayCount: 3, phase: 'MORNING' })
    const taxRaid = buildState({ stats: { ...INITIAL_STATS, maine: 99 }, lai: 10, dayCount: 3, phase: 'MORNING' })

    expect(psychWard?.type).toBe('psychWard')
    expect(bankruptcy?.type).toBe('bankruptcy')
    expect(taxRaid?.type).toBe('taxRaid')
  })

  it('evaluates path-driven endings at day 30 morning', () => {
    const occultPath: PathProgress = {
      ...createInitialPathProgress(),
      occult: { xp: 30, milestoneIndex: 3 },
      network: { xp: 12, milestoneIndex: 2 },
      tourist: { xp: 0, milestoneIndex: 0 },
      tax: { xp: 0, milestoneIndex: 0 },
    }
    const occultAscension = buildState({
      stats: { ...INITIAL_STATS, rahat: 2000, maine: 70, byroslavia: 50 },
      lai: 95,
      dayCount: 30,
      phase: 'MORNING',
      pathProgress: occultPath,
    })

    expect(occultAscension?.type).toBe('occultAscension')

    const touristPath: PathProgress = {
      ...createInitialPathProgress(),
      tourist: { xp: 40, milestoneIndex: 3 },
      tax: { xp: 10, milestoneIndex: 2 },
      occult: { xp: 0, milestoneIndex: 0 },
      network: { xp: 0, milestoneIndex: 0 },
    }
    const mogul = buildState({
      stats: { ...INITIAL_STATS, rahat: 2000, maine: 60 },
      lai: 40,
      dayCount: 30,
      phase: 'MORNING',
      pathProgress: touristPath,
    })

    expect(mogul?.type).toBe('touristMogul')

    const fallback = buildState({
      stats: { ...INITIAL_STATS, maine: 40, byroslavia: 10, rahat: 200 },
      lai: 50,
      dayCount: 30,
      phase: 'MORNING',
      pathProgress: createInitialPathProgress(),
    })

    expect(fallback?.type).toBe('vappu')
  })
})
