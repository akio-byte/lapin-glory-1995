export type Phase = 'day' | 'night'
export type BuildPath = 'tourist' | 'tax' | 'occult' | 'network'
export type StatKey = 'rahat' | 'maine' | 'jarki' | 'sisu' | 'pimppaus' | 'byroslavia'

export type StatDelta = Partial<Record<StatKey, number>>

export type SkillCheck = {
  stat: 'pimppaus' | 'byroslavia'
  dc: number
  advantageTags?: string[] // e.g., ['tourist'] to grant +bonus
}

export type ChoiceOutcome = {
  text: string
  effects: StatDelta
  pathXp?: Partial<Record<BuildPath, number>>
}

export type EventChoice = {
  id: string
  label: string
  cost?: StatDelta
  skillCheck?: SkillCheck
  success: ChoiceOutcome
  fail: ChoiceOutcome
}

export type EventGate = {
  minDay?: number
  maxDay?: number
  minStats?: Partial<Record<StatKey, number>>
  maxStats?: Partial<Record<StatKey, number>>
  requiresTags?: string[]
}

export type EventMedia = { kind: 'image' | 'video'; src: string; alt?: string }

export type GameEventData = {
  id: string
  phase: Phase
  title: string
  body: string
  vibe?: 'occult' | 'mundane'
  tags?: string[]
  paperWar?: boolean
  gates?: EventGate
  media?: EventMedia
  choices: EventChoice[]
}

export type EndingTrigger = {
  minDay?: number
  maxDay?: number
  statChecks?: { stat: StatKey; op: 'lt' | 'gt'; value: number }[]
  pathFocus?: BuildPath
  laiThreshold?: { op: 'lt' | 'gt'; value: number }
}

export type EndingData = {
  id: string
  title: string
  trigger: EndingTrigger
  summary: string
  epilogue: { text: string; media?: EventMedia }
}

export const sampleEvent: GameEventData = {
  id: 'lumihankeen-turisti',
  phase: 'night',
  title: 'Lumihankeen kadonnut turisti',
  body: 'Eksynyt japanilainen turisti astuu sisään, kamera huurussa.',
  tags: ['tourist'],
  media: { kind: 'image', src: '/fallback.jpg', alt: 'Eksynyt turisti lumen keskellä' },
  choices: [
    {
      id: 'tee-ja-kartta',
      label: 'Tarjoa teetä ja myy kartta',
      success: { text: 'Hän kiittää syvästi ja jättää paksun tipin.', effects: { rahat: 130, maine: 7, jarki: 3 } },
      fail: { text: 'Kartta on vanha ja vie väärään kylään.', effects: { maine: -5, jarki: -6, rahat: -20 } },
    },
    {
      id: 'taksi-nokiasta',
      label: 'Kutsu taksi Nokiasta',
      cost: { rahat: 30 },
      success: { text: 'Taksi saapuu heti. Turisti tekee sinusta legendan.', effects: { maine: 8, jarki: 4 } },
      fail: { text: 'Taksi ei vastaa. Turisti pettyy.', effects: { maine: -3, jarki: -4 } },
    },
  ],
}

export const sampleEnding: EndingData = {
  id: 'tourist-mogul',
  title: 'Pohjolan turismikeisari',
  trigger: {
    minDay: 30,
    statChecks: [
      { stat: 'rahat', op: 'gt', value: 1500 },
      { stat: 'maine', op: 'gt', value: 55 },
    ],
    pathFocus: 'tourist',
  },
  summary: 'Rahaa, mainetta ja neon-bussien virta – polku huipentuu turistikuninkuuteen.',
  epilogue: {
    text: 'Bussit täyttyvät Lapin brändistäsi ja neon-mainokset syttyvät joka kortteliin.',
    media: { kind: 'image', src: '/office_bg.png', alt: 'Neonmainoksia täynnä oleva ikkuna' },
  },
}
