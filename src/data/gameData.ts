import faxMachine from '../assets/fax_machine.png.png'
import snowyStreet from '../assets/Snowy_Finland_Street_VHS.mp4'
import surrealVideo from '../assets/Surreal_Horror_Video_Generation.mp4'
import fallbackImage from '../assets/react.svg'

export type ItemType = 'consumable' | 'tool' | 'form' | 'relic'

export interface Stats {
  money: number
  reputation: number
  sanity: number
  sisu: number
  pimppaus: number
  byroslavia: number
}

export interface ItemEffects {
  immediate?: Partial<Stats>
  passive?: Partial<Stats>
}

export interface Item {
  id: string
  name: string
  price: number
  description: string
  type: ItemType
  icon: string
  effects: ItemEffects
  req_stats?: {
    byroslavia?: number
  }
  autoUseOnPurchase?: boolean
}

export interface GameEventChoice {
  label: string
  skillCheck?: { stat: 'pimppaus' | 'byroslavia'; dc: number }
  cost?: { money?: number; sanity?: number }
  outcomeSuccess: { text: string; effects: Partial<Stats> }
  outcomeFail: { text: string; effects: Partial<Stats> }
}

export interface GameEvent {
  id: string
  triggerPhase: 'day' | 'night'
  condition?: (stats: Stats) => boolean
  media?: {
    type: 'image' | 'video'
    src: string
    alt: string
  }
  text: string
  choices: GameEventChoice[]
}

export const items: Item[] = [
  {
    id: 'jaloviina',
    name: 'Jaloviina',
    price: 120,
    description: 'Pahvilaatikkoon piilotettu kansallisaarre. Lämmität mielen ja unohtuu byrokratia.',
    type: 'consumable',
    icon: '🍾',
    effects: { immediate: { sanity: 12, sisu: 6 } },
  },
  {
    id: 'nokia-2110',
    name: 'Nokia 2110',
    price: 480,
    description: 'Operatiivinen Net Monitor. Kuulee faksien väliset kuiskaukset ja näyttää tukiaseman haamut.',
    type: 'tool',
    icon: '📟',
    effects: { passive: { reputation: 4, byroslavia: 5 } },
  },
  {
    id: 'lomake-5057e',
    name: 'Lomake 5057e',
    price: 75,
    description: 'Verohallinnon esoteerinen kaavake. Leikkaa jonot ja avaa salaiset luukut.',
    type: 'form',
    icon: '📑',
    effects: { passive: { byroslavia: 15, sanity: -2 } },
    req_stats: { byroslavia: 8 },
  },
  {
    id: 'salmiakkikossu',
    name: 'Salmiakkikossu',
    price: 90,
    description: 'Aito apteekin sekoitus. Nostaa sisua, mutta maksa huutaa.',
    type: 'consumable',
    icon: '🥃',
    effects: { immediate: { sanity: 8, reputation: -2, sisu: 10 } },
  },
]

const fallbackMedia: NonNullable<GameEvent['media']> = {
  type: 'image',
  src: fallbackImage,
  alt: 'Neon siluetti Lapista',
}

export const gameEvents: GameEvent[] = [
  {
    id: 'EU Faksi',
    triggerPhase: 'day',
    media: {
      type: 'image',
      src: faxMachine,
      alt: 'Saapuva faksi Brysselistä',
    },
    text: 'Saapuva faksi Brysselistä. Paperi on kuuma ja muste tuoksuu otsonilta. EU haluaa tiedot heti.',
    choices: [
      {
        label: 'Leimaa heti virkamiesmoodissa',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        cost: { sanity: 5 },
        outcomeSuccess: {
          text: 'Leima osuu oikeaan ruutuun. Virkailija nyökkää linjan toisessa päässä.',
          effects: { money: -50, reputation: 8, sanity: -5 },
        },
        outcomeFail: {
          text: 'Leima on vino. Faksi kiertää kolmessa toimipisteessä ja mieli kärähtää.',
          effects: { reputation: -6, sanity: -12 },
        },
      },
      {
        label: 'Ignoraa ja kaada Jallua kahviin',
        cost: { money: 0 },
        outcomeSuccess: {
          text: 'Bryssel unohtuu hetkeksi. Pöydällä soi humina ja mieli pehmenee.',
          effects: { sanity: 10, reputation: -4, money: 0 },
        },
        outcomeFail: {
          text: 'Puhelin pirahtaa. EU-puhelinvaihde kiristää ääntään.',
          effects: { sanity: -6, reputation: -2 },
        },
      },
    ],
  },
  {
    id: 'Turistibussi',
    triggerPhase: 'night',
    media: {
      type: 'video',
      src: snowyStreet,
      alt: 'Turistibussi luo sumuisen valon lumelle',
    },
    text: 'Ruotsalainen turistibussi kaartaa pihaan. Neon kyltti välkkyy, porot tuijottavat.',
    choices: [
      {
        label: 'Myy kaikki Salmiakkikossut',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Jengi huutaa "skål" ja jättää tippiä. Markat kilisevät kassaan.',
          effects: { money: 220, reputation: 6, sanity: 2, sisu: -4 },
        },
        outcomeFail: {
          text: 'Bussi huomaa verottajan lapun ovessa. Kääntyy pois, maine ratisemaan.',
          effects: { money: -40, reputation: -8, sanity: -4 },
        },
      },
      {
        label: 'Salaa Net Monitoriin revontulikanava',
        skillCheck: { stat: 'byroslavia', dc: 10 },
        outcomeSuccess: {
          text: 'Turistit luulevat kyseessä olevan virallinen valvontakokeilu. Maine kasvaa mystisenä.',
          effects: { reputation: 10, money: 50, sanity: -2 },
        },
        outcomeFail: {
          text: 'Signaali säröilee ja kuulet kuiskauksen: "RUN: DIE". Turistit hermostuvat.',
          effects: { sanity: -10, reputation: -3 },
        },
      },
    ],
  },
  {
    id: 'Verotarkastus',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation > 25,
    media: {
      type: 'video',
      src: surrealVideo,
      alt: 'Verottaja ilmestyy lumiseen toimistoon',
    },
    text: 'Ovi paukahtaa. Hannele Krok astuu sisään paksun mapin kanssa. Boss fight: Paper War.',
    choices: [
      {
        label: 'Vastaa Lomake 5057e -kombolla',
        skillCheck: { stat: 'byroslavia', dc: 18 },
        cost: { sanity: 8 },
        outcomeSuccess: {
          text: 'Mapit sulavat. Verottaja hymyilee ja poistuu jättäen sinut rauhaan.',
          effects: { reputation: 5, sanity: -5, money: -30 },
        },
        outcomeFail: {
          text: 'Lisäselvityspyyntö. Kirjekuori alkaa savuamaan.',
          effects: { sanity: -20, money: -150 },
        },
      },
      {
        label: 'Bluffaa pimppauksella ja tarjoa kahvit',
        skillCheck: { stat: 'pimppaus', dc: 16 },
        outcomeSuccess: {
          text: 'Krok hörppää ja sulaa. Saat armonaikaa ja huhun mukaan bonuspisteitä.',
          effects: { reputation: 8, money: -20, sanity: 4 },
        },
        outcomeFail: {
          text: 'Kahvi oli kylmää. Saat merkinnän ja mieltä kiristää.',
          effects: { reputation: -10, sanity: -12, money: -50 },
        },
      },
    ],
  },
]

export const fallbackEventMedia = fallbackMedia
