import { describe, expect, it } from 'vitest'

import { __test_simulateRun } from '../src/hooks/useGameLoop'

describe('loop stability', () => {
  it('runs a single full cycle without double-processing', () => {
    const result = __test_simulateRun({ maxSteps: 3, random: () => 0.25 })

    expect(result.finalDayCount).toBe(2)
    expect(result.morningReportDays).toEqual([1])

    const dayOneSnapshots = result.dayHistory.filter((entry) => entry.day === 1)
    expect(dayOneSnapshots).toHaveLength(1)
  })
})
