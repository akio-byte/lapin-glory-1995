import { describe, expect, it } from 'vitest'
import { __test_applyPathXp, createInitialPathProgress } from '../../src/hooks/useGameLoop'

describe('applyPathXp', () => {
  it('caps xp at milestone ceiling and grants rewards once', () => {
    const start = createInitialPathProgress()
    const first = __test_applyPathXp(start, { network: 20 })

    expect(first.updatedProgress.network.xp).toBeLessThanOrEqual(20)
    expect(first.updatedProgress.network.milestoneIndex).toBe(3)
    expect(first.rewards.pimppaus).toBeGreaterThan(0)
    expect(first.laiDelta).toBeLessThan(0)

    const second = __test_applyPathXp(first.updatedProgress, { network: 0 })
    expect(second.rewards).toEqual({})
    expect(second.updatedProgress.network.milestoneIndex).toBe(3)
  })

  it('applies partial gains without skipping milestones', () => {
    const start = createInitialPathProgress()
    const mid = __test_applyPathXp(start, { tax: 5 })
    expect(mid.updatedProgress.tax.milestoneIndex).toBe(0)

    const final = __test_applyPathXp(mid.updatedProgress, { tax: 2 })
    expect(final.updatedProgress.tax.milestoneIndex).toBe(1)
    expect(final.rewards.byroslavia).toBeGreaterThan(0)
  })
})
