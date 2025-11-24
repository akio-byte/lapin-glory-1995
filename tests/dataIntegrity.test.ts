import { describe, expect, it } from 'vitest'

import { aiFaxEvents } from '../src/data/aiFaxEvents'
import { gameEvents, items, tagMeta } from '../src/data/gameData'

const knownTags = new Set(Object.keys(tagMeta))

const hasValidStats = (delta: Record<string, unknown>) =>
  Object.values(delta).every((value) => typeof value === 'number' && Number.isFinite(value))

describe('event data integrity', () => {
  const allEvents = [...gameEvents, ...aiFaxEvents]

  it('ensures required event fields exist and choices are valid', () => {
    allEvents.forEach((event) => {
      expect(event.id).toBeTruthy()
      expect(['day', 'night']).toContain(event.triggerPhase)
      expect(typeof event.text).toBe('string')
      expect(Array.isArray(event.choices)).toBe(true)

      if (event.tags) {
        event.tags.forEach((tag) => expect(knownTags.has(tag)).toBe(true))
      }

      if (event.tier) {
        expect([1, 2, 3]).toContain(event.tier)
      }

      event.choices.forEach((choice) => {
        expect(choice.label).toBeTruthy()
        expect(choice.outcomeFail).toBeDefined()
        expect(choice.outcomeSuccess).toBeDefined()
        expect(Object.keys(choice.outcomeFail).length).toBeGreaterThan(0)
        expect(Object.keys(choice.outcomeSuccess).length).toBeGreaterThan(0)
      })
    })
  })
})

describe('item data integrity', () => {
  it('ensures items have unique IDs and valid numeric values', () => {
    const ids = new Set<string>()

    items.forEach((item) => {
      expect(item.id).toBeTruthy()
      expect(ids.has(item.id)).toBe(false)
      ids.add(item.id)

      expect(typeof item.price).toBe('number')
      expect(item.price).toBeGreaterThanOrEqual(0)

      item.tags.forEach((tag) => expect(knownTags.has(tag)).toBe(true))

      if (item.effects.immediate) {
        expect(hasValidStats(item.effects.immediate as Record<string, unknown>)).toBe(true)
      }
      if (item.effects.passive) {
        expect(hasValidStats(item.effects.passive as Record<string, unknown>)).toBe(true)
      }
    })
  })
})
