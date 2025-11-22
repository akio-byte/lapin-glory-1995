import faxImg from '../assets/fax_machine.png.png'
import officeBg from '../assets/office_bg.png.png'
import bossVideo from '../assets/Surreal_Horror_Video_Generation.mp4'
import streetVideo from '../assets/Snowy_Finland_Street_VHS.mp4'

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

export const FALLBACK_MEDIA: NonNullable<Event['media']> = {
  type: 'image',
  src: officeBg,
  alt: 'Neoninen toimistotausta',
}

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'EVT_001',
    title: 'SAAPUVA FAKSI: BRYSSEL',
    description:
      'Faksi rätisee. Se on EU-direktiivi 882/B: "Viihderavintoloiden Valaisustandardit". Nykyiset neonvalosi ovat liian kirkkaat poroille.',
    triggerPhase: 'day',
    media: { type: 'image', src: faxImg, alt: 'Rätisevä faksi' },
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
    id: 'EVT_003',
    title: 'KAAMOSKATU VHS-LUMESSA',
    description:
      'Ulkona lumisade on kuin VHS-kohinaa. Joku jätti monitorin kadulle näyttämään yökuvaa, ja se vetää ohikulkijoita puoleensa.',
    triggerPhase: 'day',
    media: { type: 'video', src: streetVideo, alt: 'Luminen katu' },
    choices: [
      {
        text: 'Siirrä monitori baarin ikkunaan',
        effect: { money: 80, reputation: 6, sanity: -3 },
        outcomeText: 'Katuvalo ja VHS-lumi tekevät taian. Kassakone kilahtaa.',
      },
      {
        text: 'Sulata jää ja myy monitori',
        effect: { money: 150, reputation: -4, sanity: 2 },
        outcomeText: 'Kauppias kättelee, mutta kylmä katu menettää taikansa.',
      },
    ],
  },
  {
    id: 'EVT_005',
    title: 'VEROTTAJA VAIHETTA PYYTÄÄ',
    description:
      'Verottajan VHS-päällikkö soittaa. Kasettia ei voi pausettaa, ja taustalla näkyy neoninen toimisto.',
    triggerPhase: 'day',
    media: { type: 'video', src: bossVideo, alt: 'Verottaja' },
    choices: [
      {
        text: 'Esitä raportti ja nosta ääntä',
        effect: { money: -50, reputation: 12, sanity: -6 },
        outcomeText: 'Byrokraatti nyökkää. Maine kasvaa, hermot kiristyvät.',
      },
      {
        text: 'Katkaise linja, vaihda kasetti',
        effect: { money: 0, reputation: -10, sanity: 8 },
        outcomeText: 'VHS pysähtyy. Pää kevenee, mutta huhumylly alkaa.',
      },
    ],
  },
]
