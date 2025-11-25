import { describe, expect, it } from 'vitest'

import { __test_resolveChoice, __test_simulateRun } from '../src/hooks/useGameLoop'
import { gameEvents } from '../src/data/gameData'

const finiteStats = (stats: Record<string, number>) =>
  Object.values(stats).every((value) => Number.isFinite(value))

describe('smoke: game loop runs to completion without errors', () => {
  it('simulates multiple days and reaches a valid ending', () => {
    const result = __test_simulateRun({ maxSteps: 320, random: () => 0.31 })

    expect(result.ending).not.toBeNull()
    result.log.forEach((entry) => {
      expect(entry.lai).toBeGreaterThanOrEqual(0)
      expect(entry.lai).toBeLessThanOrEqual(100)
      expect(finiteStats(entry.stats)).toBe(true)
    })

    expect(() => JSON.stringify(result.pathProgress)).not.toThrow()
    expect(() => JSON.stringify(result.dayHistory)).not.toThrow()
  })

  it('resolves at least one PaperWar-capable event without crashing', () => {
    const paperWarEvent = gameEvents.find((event) => event.paperWar)
    expect(paperWarEvent).toBeDefined()

    if (paperWarEvent) {
      const hydratedEvent =
        paperWarEvent.choices.length > 0
          ? paperWarEvent
          : {
              ...paperWarEvent,
              choices: [
                {
                  label: 'Test resolve',
                  outcomeSuccess: { text: 'ok', effects: {} },
                  outcomeFail: { text: 'fail', effects: {} },
                },
              ],
            }

      const resolution = __test_resolveChoice(hydratedEvent)
      expect(finiteStats(resolution.appliedEffects as Record<string, number>)).toBe(true)
    }
  })

  it('produces exactly one morning report per in-game morning', () => {
    const result = __test_simulateRun({ maxSteps: 120, random: () => 0.42 })

    expect(result.morningReportDays.length).toBeGreaterThan(0)
    const perDay = new Map<number, number>()

    result.morningReportDays.forEach((day) => {
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    })

    perDay.forEach((count) => {
      expect(count).toBe(1)
    })

    const morningDaysFromLog = result.log.filter((entry) => entry.phase === 'MORNING').map((entry) => entry.day)
    morningDaysFromLog.forEach((day) => {
      expect(perDay.get(day)).toBe(1)
    })
  })
})
