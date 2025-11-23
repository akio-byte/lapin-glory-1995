import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

type Phase = 'DAY' | 'NIGHT'

type GeneratedEvent = {
  id: string
  title: string
  phase: Phase
  description: string
  laiBand: 'low' | 'mid' | 'high'
  choices: {
    id: string
    label: string
    dcType?: 'PIMPPAUS' | 'BYROSLAVIA' | 'SISU'
    dcValue?: number
    delta: {
      rahat?: number
      maine?: number
      jarki?: number
      lai?: number
    }
    outcome: string
  }[]
}

type GameEvent = {
  id: string
  triggerPhase: 'day' | 'night'
  text: string
  vibe?: 'occult' | 'mundane'
  tier?: 1 | 2 | 3
  choices: {
    label: string
    skillCheck?: { stat: 'pimppaus' | 'byroslavia'; dc: number }
    cost?: { rahat?: number; jarki?: number }
    outcomeSuccess: { text: string; effects: Partial<Record<'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia', number>> }
    outcomeFail: { text: string; effects: Partial<Record<'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia', number>> }
  }[]
}

type StatsSnapshot = {
  rahat: number
  maine: number
  jarki: number
  lai: number
  phase: Phase
}

const aiEventsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'aiFaxEvents.ts')

const readExistingEvents = async (): Promise<GameEvent[]> => {
  try {
    await fs.access(aiEventsPath)
  } catch (error) {
    return []
  }

  try {
    const moduleUrl = pathToFileURL(aiEventsPath).href
    const imported = await import(moduleUrl)
    if (imported && Array.isArray(imported.aiFaxEvents)) {
      return imported.aiFaxEvents as GameEvent[]
    }
  } catch (error) {
    console.warn('⚠️  Failed to import existing aiFaxEvents.ts, starting from empty array.', error)
  }

  return []
}

const ensureEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    console.error(`Missing ${key}. Please set it before running the generator.`)
    process.exit(1)
  }
  return value
}

const buildPrompt = (snapshot: StatsSnapshot): { system: string; user: string } => {
  const system = `You are an expert event writer for a 1995 Lapland noir management game. Respond with ONLY raw JSON matching the provided schema. Tone: VHS-noir, bureaucratic black humour, Finnish slang, safe-for-work.`

  const user = `Produce one Lapin Glory fax event as JSON with no extra text. Obey this schema exactly:\n${JSON.stringify(
    {
      id: 'unique slug',
      title: 'Finnish title',
      phase: 'DAY | NIGHT',
      description: '1-3 short sentences',
      laiBand: 'low | mid | high',
      choices: [
        {
          id: 'unique choice id',
          label: 'short Finnish choice label',
          dcType: 'PIMPPAUS | BYROSLAVIA | SISU (prefer the first two)',
          dcValue: 10,
          delta: { rahat: 40, maine: 3, jarki: -2, lai: 4 },
          outcome: 'concise outcome line',
        },
      ],
    },
    null,
    2,
  )}\nRules:\n- Keep it grounded in Rovaniemi 1995 fax-club atmosphere.\n- Avoid hate/NSFW.\n- Choices should be 2-4, punchy, and prefer dcType PIMPPAUS or BYROSLAVIA when using checks.\n- Keep numbers small: typically between -30 and 60.\n- Make ids slug-like (lowercase, hyphens).\n- laiBand should match roughly these moods: low=cold mundane, mid=strange static, high=occult interference.\nContext:\n- Current phase: ${snapshot.phase}.\n- Mood band (lai): ${snapshot.lai}.\n- Rough stats: rahat ${snapshot.rahat}, maine ${snapshot.maine}, jarki ${snapshot.jarki}.\nReturn ONLY the JSON object, no code fences.`

  return { system, user }
}

const callOpenRouter = async (apiKey: string, snapshot: StatsSnapshot): Promise<GeneratedEvent> => {
  const { system, user } = buildPrompt(snapshot)
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://lapin-glory-dev.local',
      'X-Title': 'Lapin Glory AI Fax Generator',
    },
    body: JSON.stringify({
      model: 'openrouter/anthropic/claude-3.5-sonnet-20241022',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.6,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenRouter request failed: ${response.status} ${response.statusText}\n${text}`)
  }

  const payload = (await response.json()) as any
  const content = payload?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenRouter response missing content')
  }

  try {
    return JSON.parse(content) as GeneratedEvent
  } catch (error) {
    throw new Error(`Failed to parse OpenRouter JSON: ${(error as Error).message}\nRaw content: ${content}`)
  }
}

const invertEffects = (
  effects: Partial<Record<'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia', number>>,
) => {
  const inverted: Partial<Record<'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia', number>> = {}
  Object.entries(effects).forEach(([key, value]) => {
    if (typeof value === 'number') {
      inverted[key as keyof typeof inverted] = value !== 0 ? -value : 0
    }
  })
  return inverted
}

const mapChoiceEffects = (delta: GeneratedEvent['choices'][number]['delta']) => {
  const mapped: Partial<Record<'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia', number>> = {}
  if (typeof delta.rahat === 'number') mapped.rahat = delta.rahat
  if (typeof delta.maine === 'number') mapped.maine = delta.maine
  if (typeof delta.jarki === 'number') mapped.jarki = delta.jarki
  return mapped
}

const toGameEvent = (generated: GeneratedEvent): GameEvent => {
  const choices: GameEvent['choices'] = generated.choices.map((choice) => {
    const effects = mapChoiceEffects(choice.delta)
    const skillStat =
      choice.dcType === 'PIMPPAUS'
        ? 'pimppaus'
        : choice.dcType === 'BYROSLAVIA'
          ? 'byroslavia'
          : undefined

    const skillCheck = skillStat && choice.dcValue ? { stat: skillStat, dc: choice.dcValue } : undefined

    return {
      label: choice.label,
      skillCheck,
      outcomeSuccess: { text: choice.outcome, effects },
      outcomeFail: {
        text: skillCheck ? `${choice.outcome} (epäonnistuit)` : choice.outcome,
        effects: skillCheck ? invertEffects(effects) : effects,
      },
    }
  })

  return {
    id: generated.id,
    triggerPhase: generated.phase.toLowerCase() as 'day' | 'night',
    text: generated.description,
    choices,
    vibe: generated.laiBand === 'high' ? 'occult' : 'mundane',
  }
}

const formatEventsFile = (events: GameEvent[]): string => {
  const header = `// Auto-generated AI fax events. Run \`npm run gen:fax\` to add more.\n`
  const importLine = "import type { GameEvent } from './gameData'\n\n"
  const body = JSON.stringify(events, null, 2)
    .replace(/"triggerPhase"/g, 'triggerPhase')
    .replace(/"text"/g, 'text')
  return `${header}${importLine}export const aiFaxEvents: GameEvent[] = ${body}\n`
}

const writeEvents = async (events: GameEvent[]) => {
  const content = formatEventsFile(events)
  await fs.writeFile(aiEventsPath, content, 'utf-8')
}

const pickSnapshot = (phaseArg?: string): StatsSnapshot => {
  const phases: Phase[] = ['DAY', 'NIGHT']
  const phase = phases.includes((phaseArg as Phase) ?? 'DAY') ? ((phaseArg as Phase) ?? 'DAY') : phases[Math.floor(Math.random() * phases.length)]
  const lai = Math.floor(Math.random() * 80)

  return {
    phase,
    lai,
    rahat: Math.floor(Math.random() * 800) - 200,
    maine: Math.floor(Math.random() * 80),
    jarki: Math.floor(Math.random() * 80) + 10,
  }
}

const mergeEvents = (existing: GameEvent[], next: GameEvent): GameEvent[] => {
  const deduped = existing.filter((event) => event.id !== next.id)
  deduped.push(next)
  return deduped
}

const main = async () => {
  const apiKey = ensureEnv('OPENROUTER_API_KEY')
  const phaseArg = process.argv[2]?.toUpperCase()
  const snapshot = pickSnapshot(phaseArg)

  console.log(`Generating fax event for phase ${snapshot.phase} (lai ${snapshot.lai})...`)

  try {
    const generated = await callOpenRouter(apiKey, snapshot)
    const nextEvent = toGameEvent(generated)
    const existing = await readExistingEvents()
    const merged = mergeEvents(existing, nextEvent)
    await writeEvents(merged)
    console.log(`✅ Added event ${nextEvent.id} to aiFaxEvents.ts (total ${merged.length})`)
  } catch (error) {
    console.error('Failed to generate fax event:', error)
    process.exit(1)
  }
}

main()
