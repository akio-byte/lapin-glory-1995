export type Event = {
  id: string
  title: string
  description: string
  triggerPhase: 'day' | 'night'
  choices: {
    text: string
    effect: {
      money?: number
      sanity?: number
      reputation?: number
    }
    outcomeText: string
  }[]
}

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'EVT_001',
    title: 'SAAPUVA FAKSI: BRYSSEL',
    description:
      'Faksi rätisee. Se on EU-direktiivi 882/B: "Viihderavintoloiden Valaisustandardit". Nykyiset neonvalosi ovat liian kirkkaat poroille.',
    triggerPhase: 'day',
    choices: [
      {
        text: 'Revi faksi ja sytytä tupakka',
        effect: { sanity: 10, money: 0, reputation: 0 },
        outcomeText: 'Tunnet vapauden huumaa. ELY-keskus muistaa tämän.',
      },
      {
        text: 'Noudata direktiiviä (Osta himmentimet)',
        effect: { money: -200, sanity: -5, reputation: 10 },
        outcomeText: 'Baari on pimeä. Virkamiehet hymyilevät.',
      },
    ],
  },
]
