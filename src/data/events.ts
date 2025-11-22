export type Event = {
  id: string
  title: string
  description: string
  triggerPhase: 'day' | 'night'
  media?: { type: 'image' | 'video'; src: string; alt: string }
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
    media: {
      type: 'image',
      src: 'https://placehold.co/600x400/1a1a1a/ff00ff?text=VHS+Glitch',
      alt: 'VHS-glitchattu faksi lapin yössä',
    },
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
  {
    id: 'EVT_005',
    title: 'VHS-KAMERA PIMPUTTAA',
    description:
      'Valvontamonitori sylkee VHS-lunta. Kuvaan ilmestyy poroheijastus, ehkä mainos tai kirous.',
    triggerPhase: 'day',
    media: {
      type: 'video',
      src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
      alt: 'VHS-noise video baarin valvontakamerasta',
    },
    choices: [
      {
        text: 'Järjestä VHS-maraton baarissa',
        effect: { money: 120, reputation: 8, sanity: -4 },
        outcomeText: 'Kansa jonottaa katsomaan neon-sinistä lumisadetta. Kassa kilahtaa.',
      },
      {
        text: 'Katkaise virta ja kutsu sähkömies',
        effect: { money: -80, reputation: -2, sanity: 6 },
        outcomeText: 'Hiljaisuus helpottaa päätä, mutta poroja kiinnostaa vähemmän.',
      },
    ],
  },
]
