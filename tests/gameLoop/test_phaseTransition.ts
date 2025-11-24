import { describe, expect, it } from 'vitest'
import { __test_simulateRun } from '../../src/hooks/useGameLoop'

describe('phase transitions', () => {
  it('cycles phases and records day history without duplicates', () => {
    const sim = __test_simulateRun({ maxSteps: 9, random: () => 0 })
    const morningLogs = sim.log.filter((entry) => entry.phase === 'MORNING')

    expect(morningLogs.length).toBeGreaterThan(0)
    const uniqueDays = new Set(sim.dayHistory.map((entry) => entry.day))
    expect(uniqueDays.size).toBe(sim.dayHistory.length)
  })
})
