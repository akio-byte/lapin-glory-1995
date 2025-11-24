import { describe, expect, it } from 'vitest'
import type { Item } from '../../src/data/gameData'
import { __test_sumPassiveModifiers } from '../../src/hooks/useGameLoop'

describe('passive item effects', () => {
  it('includes relic, form, and tool passives consistently', () => {
    const inventory: Item[] = [
      {
        id: 'tool-1',
        name: 'Tool',
        price: 0,
        description: 't',
        summary: 't',
        tags: ['shop'],
        type: 'tool',
        icon: 'i',
        effects: { passive: { jarki: 1 } },
      },
      {
        id: 'form-1',
        name: 'Form',
        price: 0,
        description: 'f',
        summary: 'f',
        tags: ['form'],
        type: 'form',
        icon: 'i',
        effects: { passive: { byroslavia: 2 } },
      },
      {
        id: 'relic-1',
        name: 'Relic',
        price: 0,
        description: 'r',
        summary: 'r',
        tags: ['relic'],
        type: 'relic',
        icon: 'i',
        effects: { passive: { sisu: 3 } },
      },
    ]

    const totals = __test_sumPassiveModifiers(inventory)
    expect(totals.jarki).toBe(1)
    expect(totals.byroslavia).toBe(2)
    expect(totals.sisu).toBe(3)
  })
})
