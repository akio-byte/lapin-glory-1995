import { gameEvents, items } from '../src/data/gameData'

const issues: string[] = []

const hasEffects = (effects: Record<string, unknown> | undefined) =>
  Boolean(effects && Object.values(effects).some((value) => typeof value === 'number'))

gameEvents.forEach((event) => {
  if (!event.id || !event.text) {
    issues.push(`event:${event.id || 'unknown'} missing id/text`)
  }
  if (!event.tier) {
    issues.push(`event:${event.id} missing tier`)
  }
  if (!event.choices || event.choices.length === 0) {
    issues.push(`event:${event.id} has no choices`)
    return
  }

  if (event.paperWar === false) {
    issues.push(`event:${event.id} has paperWar explicitly false (use true or omit)`) // prefer deterministic flag
  }

  event.choices.forEach((choice, idx) => {
    const hasPayload =
      Boolean(choice.skillCheck) || Boolean(choice.cost) || hasEffects(choice.outcomeSuccess.effects) || hasEffects(choice.outcomeFail.effects)
    if (!hasPayload) {
      issues.push(`event:${event.id} choice[${idx}] missing cost/skill/effects`)
    }
  })
})

items.forEach((item) => {
  if (!item.tags || item.tags.length === 0) {
    issues.push(`item:${item.id} missing tags`)
  }
  if (item.type === 'form' && !item.tags.includes('form')) {
    issues.push(`item:${item.id} form item missing form tag`)
  }
  if (item.type === 'relic' && !item.tags.includes('relic')) {
    issues.push(`item:${item.id} relic missing relic tag`)
  }
  if (item.type === 'tool' && !item.tags.includes('shop')) {
    issues.push(`item:${item.id} tool missing shop tag`)
  }
})

if (issues.length > 0) {
  console.warn(`Data validation found ${issues.length} issue(s):`)
  issues.forEach((issue) => console.warn(` - ${issue}`))
} else {
  console.log('Data validation passed: all events and items have required fields.')
}
