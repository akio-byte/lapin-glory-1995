import faxImg from '../assets/fax_machine.png.png'
import officeBg from '../assets/office_bg.png.png'
import bossVideo from '../assets/Surreal_Horror_Video_Generation.mp4'
import streetVideo from '../assets/Snowy_Finland_Street_VHS.mp4'

export type Event = {
  id: string
  title: string
  description: string
  triggerPhase: 'day' | 'night'
  vibe?: 'mundane' | 'occult'
  condition?: { laiAbove?: number; jarkiBelow?: number }
  media?: { type: 'image' | 'video'; src: string; alt: string }
  choices: {
    text: string
    dcCheck?: { stat: 'pimppaus' | 'byroslavia' | 'sisu'; dc: number }
    effect: {
      rahat?: number
      jarki?: number
      maine?: number
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
        effect: { jarki: 10, rahat: 0, maine: 0 },
        outcomeText: 'Tunnet vapauden huumaa. ELY-keskus muistaa tämän.',
      },
      {
        text: 'Noudata direktiiviä (Osta himmentimet)',
        effect: { rahat: -200, jarki: -5, maine: 10 },
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
        effect: { rahat: 80, maine: 6, jarki: -3 },
        outcomeText: 'Katuvalo ja VHS-lumi tekevät taian. Kassakone kilahtaa.',
      },
      {
        text: 'Sulata jää ja myy monitori',
        effect: { rahat: 150, maine: -4, jarki: 2 },
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
        effect: { rahat: -50, maine: 12, jarki: -6 },
        outcomeText: 'Byrokraatti nyökkää. Maine kasvaa, hermot kiristyvät.',
      },
      {
        text: 'Katkaise linja, vaihda kasetti',
        effect: { rahat: 0, maine: -10, jarki: 8 },
        outcomeText: 'VHS pysähtyy. Pää kevenee, mutta huhumylly alkaa.',
      },
    ],
  },
  {
    id: 'EVT_006',
    title: 'NEON-FAX: Kurkkudirektiivi 2.0',
    description:
      'Bryssel lähettää yömyöhään neon-faksin: kurkkujen kaarevuus koskee nyt myös drinkkien koristeita.',
    triggerPhase: 'day',
    media: { type: 'image', src: faxImg, alt: 'Kimmeltävä neon-faksi' },
    vibe: 'mundane',
    choices: [
      {
        text: 'Leimaa poikkeuslupa Lapin valolla',
        dcCheck: { stat: 'byroslavia', dc: 13 },
        effect: { maine: 6, rahat: 40 },
        outcomeText: 'Poikkeuslupa menee läpi. RAHAT säästyvät ja MAINE kasvaa.',
      },
      {
        text: 'Osta laatikko standardikurkkuja',
        effect: { rahat: -120, maine: 4 },
        outcomeText: 'Kylmävarasto täyttyy, mutta EU on tyytyväinen.',
      },
      {
        text: 'Ignoraa ja tarjoa poron suolakurkkuja',
        effect: { maine: -6, jarki: 4 },
        outcomeText: 'Turisti ihmettelee, mutta pää rauhoittuu hetkeksi.',
      },
    ],
  },
  {
    id: 'EVT_007',
    title: 'Neon-fax: Kylmä sää',
    description:
      'EU varoittaa: pakkanen rikkoo neonputket. Faksi vilkkuu ja paperi on jäinen.',
    triggerPhase: 'day',
    media: { type: 'image', src: faxImg, alt: 'Jäinen faksi' },
    choices: [
      {
        text: 'Tilaa lämpövastukset Brysselistä',
        effect: { rahat: -90, jarki: 2, maine: 5 },
        outcomeText: 'Putket pysyvät ehjinä, faksit kiittävät.',
      },
      {
        text: 'Kirjoita vastine: Lapissa on aina kylmä',
        dcCheck: { stat: 'pimppaus', dc: 11 },
        effect: { maine: 2, rahat: 30, jarki: -2 },
        outcomeText: 'Fax-operaattori naurahtaa ja lähettää sinulle pienen tuen.',
      },
    ],
  },
  {
    id: 'EVT_008',
    title: 'Turisti-shamaani revontulilla',
    description:
      'Saksalainen shamaani palaa ja väittää virittäneensä aurorakanavan. LAI värähtää.',
    triggerPhase: 'night',
    media: { type: 'video', src: streetVideo, alt: 'Revontulen alla seisova shamaani' },
    vibe: 'occult',
    choices: [
      {
        text: 'Anna hänelle dj-slot ja savukone',
        effect: { rahat: 160, maine: 8, jarki: -3 },
        outcomeText: 'Rummut ja savut nostavat kassaa, mutta JÄRKI kipinöi.',
      },
      {
        text: 'Myy hänelle Lapin kristalli',
        dcCheck: { stat: 'pimppaus', dc: 12 },
        effect: { rahat: 90, maine: 3 },
        outcomeText: 'Shamaani maksaa hyvin ja kehuu baarin mainetta.',
      },
      {
        text: 'Sammuta valot ja pyydä hiljaisuutta',
        effect: { jarki: 5, maine: -4 },
        outcomeText: 'Hiljaisuus rauhoittaa, mutta turistit katoavat.',
      },
    ],
  },
  {
    id: 'EVT_009',
    title: 'Doris: Tangon pohja',
    description: 'Doris haluaa järjestää salaisen tangokisan Wanha Mestari -henkisesti.',
    triggerPhase: 'night',
    media: { type: 'image', src: officeBg, alt: 'Hämärä karaokelava' },
    choices: [
      {
        text: 'Mainosta paikallisradiossa',
        effect: { rahat: 130, maine: 7, jarki: -2 },
        outcomeText: 'Tangokansa valuu sisään ja kassa laulaa.',
      },
      {
        text: 'Pitkä soundcheck, pidä ovet kiinni',
        effect: { jarki: 6, maine: -5 },
        outcomeText: 'Rauhoitut, mutta yleisö jää ulos ja huhut leviävät.',
      },
    ],
  },
  {
    id: 'EVT_010',
    title: 'Wanha Mestari: Salainen resepti',
    description: 'Mestari kuiskaa sinulle reseptin lämpimästä simasta, mutta haluaa osan kassasta.',
    triggerPhase: 'night',
    media: { type: 'image', src: officeBg, alt: 'Kellarin neonkynttilät' },
    choices: [
      {
        text: 'Maksa ja ota resepti',
        effect: { rahat: -80, jarki: 2, maine: 5 },
        outcomeText: 'Juoma myy kuin häkä, MAINE kasvaa.',
      },
      {
        text: 'Bluffaa, että resepti löytyy jo',
        dcCheck: { stat: 'byroslavia', dc: 14 },
        effect: { maine: -2, jarki: 3, rahat: 60 },
        outcomeText: 'Mestari mutisee, mutta kassaan ilmestyy seteleitä.',
      },
    ],
  },
  {
    id: 'EVT_011',
    title: 'Metsänpeitto-varoitus',
    description:
      'Aamulla ikkuna on huurussa ja joku on piirtänyt siihen sanan METSÄNPEITTO. LAI pysyy matalana, mutta tunnelma kiristyy.',
    triggerPhase: 'day',
    media: { type: 'video', src: streetVideo, alt: 'Huurteinen katu' },
    vibe: 'occult',
    choices: [
      {
        text: 'Sytytä valoketju ulos',
        effect: { rahat: -30, maine: 4 },
        outcomeText: 'Valo leikkaa sumun ja asiakkaat uskaltautuvat sisään.',
      },
      {
        text: 'Pysy sisällä ja juo kahvia',
        effect: { jarki: 6, maine: -2 },
        outcomeText: 'Mieli tasaantuu, mutta kylä luulee sinun pelkäävän.',
      },
    ],
  },
  {
    id: 'EVT_012',
    title: 'Maahisen kolkutin',
    description:
      'Yöllä tiskin alta kuuluu naputus. Maahinen haluaa vaihtaa VHS-kasetin markkoihin.',
    triggerPhase: 'night',
    vibe: 'occult',
    choices: [
      {
        text: 'Osta kasetti ja anna juomaraha',
        effect: { rahat: -50, jarki: 3, maine: 4 },
        outcomeText: 'Kasetti sisältää outoa mainosrahaa, LAI värähtää.',
      },
      {
        text: 'Torju ja sulje luukku',
        effect: { maine: -4, jarki: 2 },
        outcomeText: 'Naputus hiljenee, mutta asiakas näkee kaiken.',
      },
    ],
  },
  {
    id: 'EVT_013',
    title: 'LAI-kipinä: Net Monitor välähtää',
    description:
      'Net Monitor ruudulla näkyy hetken Staalo-symboli. Jos LAI on korkea, koko huone värähtää.',
    triggerPhase: 'day',
    media: { type: 'video', src: bossVideo, alt: 'Häiriöruutu' },
    vibe: 'occult',
    condition: { laiAbove: 50 },
    choices: [
      {
        text: 'Kirjoita häiriö raporttiin',
        effect: { maine: 3, jarki: -2 },
        outcomeText: 'Raportti rauhoittaa vähän, mutta LAI kipinöi.',
      },
      {
        text: 'Vedä virta ja hengitä syvään',
        effect: { jarki: 5, maine: -1, rahat: -10 },
        outcomeText: 'Sähkölasku kasvaa, mutta pää selkenee hetkeksi.',
      },
    ],
  },
]
