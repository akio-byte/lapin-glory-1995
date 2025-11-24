import { describe, expect, it } from 'vitest'
import { evaluateEndingForState, createInitialPathProgress, INITIAL_STATS } from '../../src/hooks/useGameLoop'

describe('ending evaluation determinism', () => {
  it('runs only during MORNING', () => {
    const ending = evaluateEndingForState({
      stats: { ...INITIAL_STATS, jarki: 0 },
      dayCount: 30,
      phase: 'DAY',
      pathProgress: createInitialPathProgress(),
      lai: 0,
    })

    expect(ending).toBeNull()
  })

  it('prioritises fatal endings before path endings', () => {
    const ending = evaluateEndingForState({
      stats: { ...INITIAL_STATS, jarki: 0 },
      dayCount: 30,
      phase: 'MORNING',
      pathProgress: createInitialPathProgress(),
      lai: 0,
    })

    expect(ending?.type).toBe('psychWard')
  })
})
