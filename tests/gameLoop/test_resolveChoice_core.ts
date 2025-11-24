import { describe, expect, it } from 'vitest'
import type { GameEvent } from '../../src/data/gameData'
import { INITIAL_STATS, __test_resolveChoiceCore, createInitialPathProgress } from '../../src/hooks/useGameLoop'
import type { Item } from '../../src/data/gameData'

const mockEvent: GameEvent = {
  id: 'unit-test-event',
  triggerPhase: 'day',
  text: 'Test your bureaucracy.',
  tier: 1,
  paperWar: true,
  tags: ['tax'],
  choices: [
    {
      label: 'File paperwork',
      skillCheck: { stat: 'byroslavia', dc: 5 },
      outcomeSuccess: { text: 'Stamped.', effects: { rahat: 10 } },
      outcomeFail: { text: 'Rejected.', effects: { rahat: -5 } },
      pathXp: { tax: 6 },
    },
  ],
}

const clerkForm: Item = {
  id: 'form-1',
  name: 'Clerk Form',
  price: 0,
  description: 'Helper form',
  summary: 'A stamped helper form.',
  type: 'form',
  tags: ['tax', 'form'],
  icon: 'icon',
  effects: { passive: { byroslavia: 1 } },
}

describe('resolveChoiceCore', () => {
  it('treats meeting the dc as success and applies path xp', () => {
    const result = __test_resolveChoiceCore({
      choice: mockEvent.choices[0],
      event: mockEvent,
      stats: { ...INITIAL_STATS, byroslavia: 5 },
      inventory: [clerkForm],
      lai: 0,
      pathProgress: createInitialPathProgress(),
      random: () => 0,
    })

    expect(result.success).toBe(true)
    expect(result.appliedEffects.rahat).toBeGreaterThan(0)
    expect(result.updatedPathProgress.tax.milestoneIndex).toBeGreaterThanOrEqual(1)
  })

  it('fails when stat is below dc and no bonuses apply', () => {
    const result = __test_resolveChoiceCore({
      choice: mockEvent.choices[0],
      event: { ...mockEvent, paperWar: false },
      stats: { ...INITIAL_STATS, byroslavia: 1 },
      inventory: [],
      lai: 0,
      pathProgress: createInitialPathProgress(),
      random: () => 0,
    })

    expect(result.success).toBe(false)
    expect(result.appliedEffects.rahat).toBeLessThan(0)
  })

  it('applies tag synergy stat effects even without outcome payload', () => {
    const synergyEvent: GameEvent = {
      ...mockEvent,
      id: 'synergy',
      tags: ['network'],
      choices: [
        {
          label: 'Ping',
          outcomeSuccess: { text: 'ok', effects: {} },
          outcomeFail: { text: 'no', effects: {} },
        },
      ],
    }

    const result = __test_resolveChoiceCore({
      choice: synergyEvent.choices[0],
      event: synergyEvent,
      stats: { ...INITIAL_STATS },
      inventory: [{ ...clerkForm, type: 'relic', tags: ['network', 'relic'] }],
      lai: 50,
      pathProgress: { ...createInitialPathProgress(), network: { xp: 12, milestoneIndex: 2 } },
      random: () => 0,
    })

    expect(result.appliedEffects.pimppaus).toBeGreaterThan(0)
    expect(result.laiDelta).toBeLessThan(0)
  })
})
