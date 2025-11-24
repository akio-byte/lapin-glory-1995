import { MediaRegistry, PLACEHOLDER_MEDIA_URL } from './mediaRegistry'
import { aiFaxEvents } from './aiFaxEvents'

export type ItemType = 'consumable' | 'tool' | 'form' | 'relic'

export interface Stats {
  rahat: number // RAHAT (mk)
  maine: number // MAINE
  jarki: number // JÄRKI
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
  summary: string
  tags: string[]
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
  cost?: { rahat?: number; jarki?: number }
  outcomeSuccess: { text: string; effects: Partial<Stats> }
  outcomeFail: { text: string; effects: Partial<Stats> }
}

export type EventTier = 1 | 2 | 3

export interface GameEvent {
  id: string
  triggerPhase: 'day' | 'night'
  condition?: (stats: Stats) => boolean
  vibe?: 'occult' | 'mundane'
  tier?: EventTier
  media?: {
    type: 'image' | 'video'
    src: string
    alt: string
  }
  text: string
  paperWar?: boolean
  choices: GameEventChoice[]
}

export const baseRent = 50
export const rentIndexRate = 0.1

export const getRentForDay = (day: number): number => {
  const weeksPassed = Math.floor((day - 1) / 7)
  return Math.round(baseRent * Math.pow(1 + rentIndexRate, weeksPassed))
}

export const getTierForDay = (day: number): EventTier => {
  if (day >= 21) return 3
  if (day >= 11) return 2
  return 1
}

export const items: Item[] = [
  {
    id: 'jaloviina',
    name: 'Jaloviina',
    price: 120,
    description: 'Pahvilaatikkoon piilotettu kansallisaarre. Lämmität mielen ja unohtuu byrokratia.',
    summary: 'Kertanosto järkeen ja sisun palautus',
    tags: ['tourist'],
    type: 'consumable',
    icon: '🍾',
    effects: { immediate: { jarki: 12, sisu: 6 } },
  },
  {
    id: 'nokia-2110',
    name: 'Nokia 2110',
    price: 480,
    description: 'Operatiivinen Net Monitor. Kuulee faksien väliset kuiskaukset ja näyttää tukiaseman haamut.',
    summary: 'Passiivisesti nostaa mainetta ja Byroslaviaa',
    tags: ['occult', 'network'],
    type: 'tool',
    icon: '📟',
    effects: { passive: { maine: 4, byroslavia: 5 } },
  },
  {
    id: 'lomake-5057e',
    name: 'Lomake 5057e',
    price: 75,
    description: 'Verohallinnon esoteerinen kaavake. Leikkaa jonot ja avaa salaiset luukut.',
    summary: 'Passiivinen byrokraattinen etu paperisodassa, hieman järkiveroa',
    tags: ['tax', 'form'],
    type: 'form',
    icon: '📑',
    effects: { passive: { byroslavia: 15, jarki: -2 } },
    req_stats: { byroslavia: 8 },
  },
  {
    id: 'salmiakkikossu',
    name: 'Salmiakkikossu',
    price: 90,
    description: 'Aito apteekin sekoitus. Nostaa sisua, mutta maksa huutaa.',
    summary: 'Kertakäyttö: sisu- ja järkibuusti, maine kärsii',
    tags: ['tourist'],
    type: 'consumable',
    icon: '🥃',
    effects: { immediate: { jarki: 8, maine: -2, sisu: 10 } },
  },
  {
    id: 'neon-kyltti-v2',
    name: 'Neon-kyltti V2',
    price: 1500,
    description: 'Uusi kirkas kehä, joka näkyy napapiirin yli. Pitää maineen hengissä kun Staalo kurkkii.',
    summary: 'Passiivinen maine- ja pimppausbonus',
    tags: ['tourist', 'occult'],
    type: 'tool',
    icon: '💡',
    effects: { passive: { maine: 12, pimppaus: 6 } },
  },
  {
    id: 'lahjusrahasto',
    name: 'Lahjusrahasto',
    price: 500,
    description: 'Ruskea kirjekuori -setti. Rahasto, jota ruokit jotta tarkastajat pysyvät pehmeinä.',
    summary: 'Passiivinen Byroslavia- ja maine-etu viranomaissuhteisiin',
    tags: ['tax'],
    type: 'tool',
    icon: '💼',
    effects: { passive: { byroslavia: 10, maine: 4 } },
  },
]

const fallbackMedia: NonNullable<GameEvent['media']> = {
  type: 'image',
  src: MediaRegistry.fallback ?? PLACEHOLDER_MEDIA_URL,
  alt: 'Neon siluetti Lapista',
}

const media = MediaRegistry

const eventTierMap: Record<string, EventTier> = {
  'Prologi: Paluu Lappiin': 1,
  'Prologi: Ensimmäinen EU-faksi': 1,
  'Prologi: Krok esittäytyy': 1,
  'Net Monitor: Maahis-piikki': 1,
  'EU Faksi': 2,
  'EU tarkastaja': 2,
  'Kurkkudirektiivi iskee': 1,
  'Metsänpeitto': 2,
  'Staalo yössä': 3,
  'Staalo varjosta': 3,
  'Veropako': 2,
  'Verkoissa kaikuu': 2,
  'Lentävä renki': 3,
  'Henkinen velka': 2,
  'Sattuuko vuokra': 1,
}

export const resolveEventTier = (event: GameEvent): EventTier => event.tier ?? eventTierMap[event.id] ?? 1

const coreGameEvents: GameEvent[] = [
  {
    id: 'Net Monitor: Maahis-piikki',
    triggerPhase: 'day',
    vibe: 'occult',
    media: fallbackMedia,
    text: 'Net Monitor välähtää. Maahisten GSM-paketti soi kuin noitarumpu ja LAI kohoaa.',
    choices: [
      {
        label: 'Kirjoita ylös häiriö',
        outcomeSuccess: {
          text: 'Faksi tulostaa käyrän: maahiset huutelee, mutta pysyt tyynenä.',
          effects: { jarki: 2, maine: 1 },
        },
        outcomeFail: {
          text: 'Piikki särähtää hermoihin. Maine kasvaa, mutta uni häiriintyy.',
          effects: { jarki: -4, maine: 3 },
        },
      },
    ],
  },
  {
    id: 'Staalo yössä',
    triggerPhase: 'night',
    vibe: 'occult',
    text: 'Pimeys tihkuu. Staalo kolistelee tukiasemaa ja yrittää soittaa sinulle suoraan.',
    choices: [
      {
        label: 'Vastaa rohkeasti',
        outcomeSuccess: {
          text: 'Staalo puhuu byrokratiaa. Saat oudon vinkin ja mieli pysyy kasassa.',
          effects: { jarki: 3, rahat: 30 },
        },
        outcomeFail: {
          text: 'Puhelu katkeaa, mutta korvissa soi. Järki rätisee.',
          effects: { jarki: -6 },
        },
      },
      {
        label: 'Katkaise virta',
        outcomeSuccess: {
          text: 'Linja hiljenee. LAI laskee hetkeksi, mutta et saa tietoa.',
          effects: { jarki: 1 },
        },
        outcomeFail: {
          text: 'Virta palaa itsekseen. Staalo nauraa jossain kaukana.',
          effects: { jarki: -2, rahat: -10 },
        },
      },
    ],
  },
  {
    id: 'Paranormaali sääbrief',
    triggerPhase: 'day',
    vibe: 'occult',
    media: fallbackMedia,
    text: 'Revontuli-sääkeskus faksaa: solmyrsky kuumenee, LAI aaltoilee. Net Monitor hurisee.',
    choices: [
      {
        label: 'Hae markkinahäiriöhyöty',
        outcomeSuccess: {
          text: 'Spekuloit sääpiikillä. Markat liikkuvat ja maine kasvaa.',
          effects: { rahat: 90, maine: 4 },
        },
        outcomeFail: {
          text: 'Sähkökatko. Faksi sulaa, joudut maksamaan korjaukset.',
          effects: { rahat: -60, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Paluu Lappiin',
    triggerPhase: 'day',
    condition: (stats) => stats.maine <= 15,
    media: fallbackMedia,
    text: 'Saavut Rovaniemelle. Vanha neon-kyltti välähtää ja kylmä huuru lyö kasvoille.',
    choices: [
      {
        label: 'Avataan ovi ja laitetaan kahvi tippumaan',
        outcomeSuccess: {
          text: 'Tila tuoksuu tutulta. Olet taas kotona.',
          effects: { jarki: 6, rahat: 20 },
        },
        outcomeFail: {
          text: 'Sulakkeet kärähtävät. Ensimmäinen päivä alkaa hermoillen.',
          effects: { jarki: -8, rahat: -40 },
        },
      },
      {
        label: 'Soita Kallelle ja pyydä vanhaa kassakonetta',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Kalle lupaa tukea. Kassakone kilahtaa vanhaan malliin.',
          effects: { rahat: 80, maine: 2 },
        },
        outcomeFail: {
          text: 'Kalle ei vastaa. Kuuntelet vain pohjoistuulta.',
          effects: { jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Ensimmäinen EU-faksi',
    triggerPhase: 'day',
    condition: (stats) => stats.maine <= 18,
    media: { type: 'image', src: media.faxMachine, alt: 'Ensimmäinen neon-faksi' },
    text: 'Brysselistä jyrähtää neonilla korostettu faksi: "Poro migreenit neonvaloista".',
    choices: [
      {
        label: 'Himmennä kyltit ja allekirjoita vastaanotto',
        cost: { rahat: 50 },
        outcomeSuccess: {
          text: 'Poro kiittää nyökkäyksellä ikkunan takaa.',
          effects: { maine: 6, jarki: 3 },
        },
        outcomeFail: {
          text: 'Valot välähtävät uudelleen. Poro soittaa lehdistöä.',
          effects: { maine: -6, jarki: -6 },
        },
      },
      {
        label: 'Teippaa faksin kiinni ja kirjoita vastine',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Perustelusi menevät läpi. Saat jatkoaikaa.',
          effects: { rahat: 60, maine: 3 },
        },
        outcomeFail: {
          text: 'Teksti jää musteläiskäksi. EU-tiskillä pudistellaan päätä.',
          effects: { jarki: -10, maine: -4 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Krok esittäytyy',
    triggerPhase: 'day',
    condition: (stats) => stats.maine >= 12 && stats.maine <= 30,
    media: { type: 'video', src: media.surrealVideo, alt: 'Krok hologrammina' },
    text: 'Verotarkastaja Krok välähtää hologrammina: "Näen teidät pian".',
    choices: [
      {
        label: 'Valmistele kahvit ja kansiot',
        cost: { jarki: 5 },
        outcomeSuccess: {
          text: 'Krok arvostaa valmistelua. Saat hetken rauhan.',
          effects: { maine: 5, jarki: 2 },
        },
        outcomeFail: {
          text: 'Kansiot sekaisin, kahvi läikkyy. Krok hymähtää kylmästi.',
          effects: { maine: -5, jarki: -7 },
        },
      },
      {
        label: 'Uhmaa ja laita VHS-suoja oveen',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Hologrammi säröytyy. Saat lisäaikaa veroihin.',
          effects: { rahat: 90, jarki: 4 },
        },
        outcomeFail: {
          text: 'Särö kääntyy takaisin. Krok merkitsee nimesi punaiseen.',
          effects: { maine: -8, rahat: -40 },
        },
      },
    ],
  },
  {
    id: 'EU Faksi',
    triggerPhase: 'day',
    media: {
      type: 'image',
      src: media.faxMachine,
      alt: 'Saapuva faksi Brysselistä',
    },
    text: 'Saapuva faksi Brysselistä. Paperi on kuuma ja muste tuoksuu otsonilta. EU haluaa tiedot heti.',
    choices: [
      {
        label: 'Leimaa heti virkamiesmoodissa',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        cost: { jarki: 5 },
        outcomeSuccess: {
          text: 'Leima osuu oikeaan ruutuun. Virkailija nyökkää linjan toisessa päässä.',
          effects: { rahat: -50, maine: 8, jarki: -5 },
        },
        outcomeFail: {
          text: 'Leima on vino. Faksi kiertää kolmessa toimipisteessä ja mieli kärähtää.',
          effects: { maine: -6, jarki: -12 },
        },
      },
      {
        label: 'Ignoraa ja kaada Jallua kahviin',
        cost: { rahat: 0 },
        outcomeSuccess: {
          text: 'Bryssel unohtuu hetkeksi. Pöydällä soi humina ja mieli pehmenee.',
          effects: { jarki: 10, maine: -4, rahat: 0 },
        },
        outcomeFail: {
          text: 'Puhelin pirahtaa. EU-puhelinvaihde kiristää ääntään.',
          effects: { jarki: -6, maine: -2 },
        },
      },
    ],
  },
  {
    id: 'Kurkkudirektiivi iskee',
    triggerPhase: 'day',
    condition: (stats) => stats.maine >= 10,
    media: fallbackMedia,
    text: 'Saapuu faksi: "Kurkkudirektiivi – jokainen drinkki mitattava 11,3 cm kurkulla".',
    choices: [
      {
        label: 'Tilaa laatikollinen kurkkuja',
        cost: { rahat: 70 },
        outcomeSuccess: {
          text: 'Drinkit näyttävät standardilta. EU-virkailija hymyilee.',
          effects: { maine: 7, jarki: 2 },
        },
        outcomeFail: {
          text: 'Kurkkujen hinta räjähtää. Asiakkaat nauravat sinulle.',
          effects: { rahat: -80, maine: -5 },
        },
      },
      {
        label: 'Vetoa poikkeuslupaan, Lapin valo-olosuhteet',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        outcomeSuccess: {
          text: 'Poikkeuslupa myönnetään. Säästät rahat.',
          effects: { rahat: 120, maine: 4 },
        },
        outcomeFail: {
          text: 'Hakemus katoaa. Saat sakon.',
          effects: { rahat: -120, jarki: -8 },
        },
      },
      {
        label: 'Juo kaikki kurkut itse protestina',
        outcomeSuccess: {
          text: 'Outo energia valtaa sinut. Tarinat leviävät.',
          effects: { jarki: -4, maine: 5, sisu: 6 },
        },
        outcomeFail: {
          text: 'Suola kuivattaa. Menet shokkiin hetkeksi.',
          effects: { jarki: -10, maine: -3 },
        },
      },
    ],
  },
  {
    id: 'Turisti-shamaani',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Saksalainen shamaani tuo minitrummun: "Lapin aurora, minä kutsua!"',
    choices: [
      {
        label: 'Anna hänelle lava ja valot',
        outcomeSuccess: {
          text: 'Rituaali kerää yleisön. Kassakone kilisee.',
          effects: { rahat: 170, maine: 8, jarki: -2 },
        },
        outcomeFail: {
          text: 'Hän kaataa glögin mikseriin. Kaikki piippaa.',
          effects: { rahat: -90, jarki: -7 },
        },
      },
      {
        label: 'Peru esitys ja myy t-paita matkamuistona',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Shamaani ostaa kolme. Hän mainitsee sinut blogissa.',
          effects: { rahat: 110, maine: 4 },
        },
        outcomeFail: {
          text: 'Hän suuttuu ja kiroaa tiskin.',
          effects: { maine: -6, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Doris-ilta',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Doris järjestää karaoken. Tangokuningas vs. poromies -duetto uhkaa.',
    choices: [
      {
        label: 'Mainosta ilta somessa',
        cost: { rahat: 30 },
        outcomeSuccess: {
          text: 'Talvi-hipstereitä valuu sisään. Lippuja myydään.',
          effects: { rahat: 180, maine: 10, jarki: -4 },
        },
        outcomeFail: {
          text: 'Algoritmi ei näytä mainosta. Hiljainen ilta.',
          effects: { rahat: -30, jarki: 2 },
        },
      },
      {
        label: 'Salli vain paikallisille legendat',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'Tunnelma tiivistyy. Maine kasvaa legendaarisena.',
          effects: { maine: 12, jarki: 3 },
        },
        outcomeFail: {
          text: 'Ulkopaikkakuntalaiset boikotoivat.',
          effects: { rahat: -60, maine: -5 },
        },
      },
    ],
  },
  {
    id: 'Wanha Mestari -yö',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Wanha Mestari kutsuu sinut kellariin juomaan "retrovarastoa".',
    choices: [
      {
        label: 'Lähde mukaan, ota sisuvaraus',
        cost: { jarki: 6 },
        outcomeSuccess: {
          text: 'Vanha konjakki avaa tarinoita. Saat yhteyksiä.',
          effects: { maine: 7, rahat: 90, sisu: 8 },
        },
        outcomeFail: {
          text: 'Heräät aamulla varastossa. Kukkaro keventynyt.',
          effects: { rahat: -100, jarki: -8 },
        },
      },
      {
        label: 'Kieltäydy ja lähetä lahjakori',
        outcomeSuccess: {
          text: 'Mestari arvostaa kohteliaisuutta.',
          effects: { maine: 5, jarki: 4 },
        },
        outcomeFail: {
          text: 'Lahjakori tippuu portaisiin. Mestari suuttuu.',
          effects: { maine: -7, rahat: -40 },
        },
      },
    ],
  },
  {
    id: 'Metsänpeitto',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Kaupunkia peittää outo sumu. Metsänpeitto nielaisee kadunkulman.',
    choices: [
      {
        label: 'Sytytä valoketju ja johdata asiakkaita',
        outcomeSuccess: {
          text: 'Valot halkovat sumun. Olet sankari.',
          effects: { maine: 9, rahat: 120, jarki: 2 },
        },
        outcomeFail: {
          text: 'Valot vilkkuvat. Poro törmää ikkunaan.',
          effects: { rahat: -70, jarki: -6 },
        },
      },
      {
        label: 'Sulje ovet ja kuuntele sumun huminaa',
        cost: { jarki: 4 },
        outcomeSuccess: {
          text: 'Humina rauhoittaa. Säästät sähkön.',
          effects: { jarki: 10, rahat: 40 },
        },
        outcomeFail: {
          text: 'Humina muuttuu kuiskauksiksi. Pelko hiipii.',
          effects: { jarki: -12, maine: -3 },
        },
      },
    ],
  },
  {
    id: 'Staalo varjosta',
    triggerPhase: 'night',
    media: { type: 'video', src: media.snowyStreet, alt: 'Varjo liikkuu kadulla' },
    text: 'Staalo ilmestyy varjona oven taakse. Sarvet piirtyvät valoon.',
    choices: [
      {
        label: 'Tarjoa hopeinen shottilasi',
        cost: { rahat: 40 },
        outcomeSuccess: {
          text: 'Staalo tyyntyy ja katoaa lumeen.',
          effects: { jarki: 8, maine: 6 },
        },
        outcomeFail: {
          text: 'Staalo murskaa lasin. Pelko leviää asiakkaisiin.',
          effects: { jarki: -14, maine: -7 },
        },
      },
      {
        label: 'Pelaa säkkijärven polkkaa kovalla',
        skillCheck: { stat: 'pimppaus', dc: 15 },
        outcomeSuccess: {
          text: 'Rytmi ajaa varjon kauemmas.',
          effects: { maine: 5, jarki: 6 },
        },
        outcomeFail: {
          text: 'Rytmi ärsyttää. Varjo paiskoo roskiksen.',
          effects: { rahat: -60, jarki: -10 },
        },
      },
    ],
  },
  {
    id: 'Maahisen diili',
    triggerPhase: 'night',
    condition: (stats) => stats.rahat < 100,
    media: fallbackMedia,
    text: 'Pöydän alta kurkistaa maahinen ja tarjoaa: "Kaksi kasettia, yksi sielu".',
    choices: [
      {
        label: 'Ota diili, pyydä kuitit',
        outcomeSuccess: {
          text: 'Maahinen leimaa kuittisi. Rahaa löytyy lattianraoista.',
          effects: { rahat: 140, maine: 3, jarki: -4 },
        },
        outcomeFail: {
          text: 'Kuitit palavat kädessä. Varjo nauraa.',
          effects: { jarki: -12, maine: -4 },
        },
      },
      {
        label: 'Kieltäydy ja lähetä hänet metsänpeittoon',
        skillCheck: { stat: 'byroslavia', dc: 11 },
        outcomeSuccess: {
          text: 'Maahinen häipyy mutisten säädöksiä.',
          effects: { jarki: 6, maine: 2 },
        },
        outcomeFail: {
          text: 'Hän kiroaa tilikirjan. Numerot pomppivat.',
          effects: { rahat: -50, jarki: -8 },
        },
      },
    ],
  },
  {
    id: 'Outo räntä',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Räntää sataa vaakasuoraan sisään faksiin. Muste leviää.',
    choices: [
      {
        label: 'Suunnittele pressu-liputus',
        cost: { rahat: 40 },
        outcomeSuccess: {
          text: 'Räntä pysyy ulkona. Saat kiitoksen palokunnalta.',
          effects: { maine: 6, jarki: 3 },
        },
        outcomeFail: {
          text: 'Pressu repeää. Paperit liukuvat viemäriin.',
          effects: { rahat: -70, maine: -6 },
        },
      },
      {
        label: 'Anna räntäsateen täyttää ämpärit',
        outcomeSuccess: {
          text: 'Keksit myydä räntäjuomia. Hullu idea toimii.',
          effects: { rahat: 130, maine: 5, jarki: -3 },
        },
        outcomeFail: {
          text: 'Ämpärit homehtuvat. Kukaan ei osta.',
          effects: { rahat: -20, jarki: -6 },
        },
      },
    ],
  },
  {
    id: 'Verottajan Paper War',
    triggerPhase: 'day',
    condition: (stats) => stats.maine > 12,
    paperWar: true,
    media: { type: 'video', src: media.surrealVideo, alt: 'Krok-tarkastajan hologrammi' },
    text: 'Hannele Krok ilmestyy faksista neon-silmä välkkyen. Hän kaataa pöydälle nipun lomakkeita ja kuiskuttaa: "Paper War, kolmesta kierroksesta paras".',
    choices: [],
  },
  {
    id: 'Faksi Jumiutuu',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Faksissa paperi rypistyy ja kuuluu mekaaninen kiljunta. Muste leijuu kuin savu.',
    choices: [
      {
        label: 'Avaa kone ja voitele rullat',
        skillCheck: { stat: 'byroslavia', dc: 11 },
        outcomeSuccess: {
          text: 'Rullat hyrisevät uudestaan. Saat lähetteen valmiiksi ja joku kiittää sinua viestissä.',
          effects: { maine: 5, jarki: -2, rahat: 40 },
        },
        outcomeFail: {
          text: 'Sormi jää väliin ja muste imeytyy ihoon. Päätä jomottaa.',
          effects: { jarki: -10, rahat: -20 },
        },
      },
      {
        label: 'Kääri paperi ja tee siitä origami-lomake',
        outcomeSuccess: {
          text: 'Virkailija näkee taideteoksen ja antaa sinulle pienen avustuksen.',
          effects: { rahat: 60, maine: 3, jarki: 2 },
        },
        outcomeFail: {
          text: 'Origami näyttää uhkauskirjeeltä. Saat huomautuksen.',
          effects: { maine: -5, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Lapin Posti',
    triggerPhase: 'day',
    condition: (stats) => stats.rahat >= -200,
    media: fallbackMedia,
    text: 'Postin setä tuo paketin, jonka päällä on poron kavion jälki. Hän tuijottaa merkkejä.',
    choices: [
      {
        label: 'Maksa tullimaksu heti',
        cost: { rahat: 50 },
        outcomeSuccess: {
          text: 'Paketissa on uusia kuitteja ja tarrat. Paperisota helpottuu.',
          effects: { maine: 6, byroslavia: 2, jarki: 4 },
        },
        outcomeFail: {
          text: 'Posti hukkaa kuitin ja veloittaa uudestaan.',
          effects: { rahat: -80, jarki: -6 },
        },
      },
      {
        label: 'Kieltäydy ja viittaa asetukseen 1677/88',
        skillCheck: { stat: 'byroslavia', dc: 13 },
        outcomeSuccess: {
          text: 'Virkailija perääntyy ja mutisee. Saat paketin ilmaiseksi.',
          effects: { rahat: 90, maine: 2 },
        },
        outcomeFail: {
          text: 'Setä suuttuu ja jättää paketin lumeen. Sisältö kastuu.',
          effects: { jarki: -8, maine: -3 },
        },
      },
    ],
  },
  {
    id: 'Nokia Net Monitor',
    triggerPhase: 'day',
    condition: (stats) => stats.jarki > 30,
    media: fallbackMedia,
    text: 'Nokia piippaa koodia: 48B... 48C... Viesti näyttää runoilevan heksaa.',
    choices: [
      {
        label: 'Syötä Composerilla Säkkijärven Polkka',
        outcomeSuccess: {
          text: 'Taajuus rauhoittuu. Kuulit kaukaisen "kiitos"-kuiskauksen.',
          effects: { jarki: 10, maine: 4 },
        },
        outcomeFail: {
          text: 'Polkka menee väärin. Kuulee vain staattista uhkaa.',
          effects: { jarki: -12, maine: -2 },
        },
      },
      {
        label: 'Kuuntele koko sekvenssi',
        cost: { jarki: 6 },
        outcomeSuccess: {
          text: 'Salainen numero paljastuu: porofarmari tilaa VIP-bileet.',
          effects: { rahat: 130, maine: 5 },
        },
        outcomeFail: {
          text: 'Numero olikin teleoperaattorin lasku.',
          effects: { rahat: -90, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'VHS-antiquaari',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'VHS-kauppias Kemiestä tarjoaa laatikollista kiellettyjä tallenteita.',
    choices: [
      {
        label: 'Osta koko laatikko',
        cost: { rahat: 100 },
        outcomeSuccess: {
          text: 'Kaseteista löytyy retro-mainoksia, jotka vetävät hipsterit puoleen.',
          effects: { maine: 7, rahat: 140, jarki: -2 },
        },
        outcomeFail: {
          text: 'Kasetit homeessa. TV:stä tulee vain huminaa.',
          effects: { jarki: -10, rahat: -100 },
        },
      },
      {
        label: 'Vaihtokauppa: tarjoa salmiakkikossu',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Kauppias pehmenee. Saat kasetit ja vielä lisäjutun Lapin legendoista.',
          effects: { maine: 5, jarki: 3 },
        },
        outcomeFail: {
          text: 'Hän loukkaantuu ja lähtee. Mainetta ropisee pois.',
          effects: { maine: -7, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Lomake 6B puuttuu',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Kaupungintalon faksista puuttuu kriittinen sivu 6B. Jono kasvaa.',
    choices: [
      {
        label: 'Improvisoi sivu käsin',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Käsialasi näyttää viralliselta. Kaikki luulevat sen olevan oikea.',
          effects: { maine: 6, jarki: -3, rahat: 50 },
        },
        outcomeFail: {
          text: 'Virheellinen viittaus pykälään. Sinut huudetaan käytävällä.',
          effects: { maine: -6, jarki: -8 },
        },
      },
      {
        label: 'Lainaa sivu verotoimiston seinältä',
        outcomeSuccess: {
          text: 'Sivu irtoaa helposti. Kukaan ei huomaa katoamista.',
          effects: { byroslavia: 2, jarki: 4 },
        },
        outcomeFail: {
          text: 'Alarma käynnistyy. Saat nuhteet.',
          effects: { maine: -4, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Pohjoinen shopkeeper',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Rovaniemen kulmakioskin pitäjä kysyy haluatko myydä tiskit hänelle.',
    choices: [
      {
        label: 'Solmi diili pikavoitoista',
        skillCheck: { stat: 'pimppaus', dc: 11 },
        outcomeSuccess: {
          text: 'Kioski mainostaa sinua. Rahaa tulee virraksi.',
          effects: { rahat: 160, maine: 5, jarki: 1 },
        },
        outcomeFail: {
          text: 'Kauppias haukkuu hinnat ja levittää juorua.',
          effects: { rahat: -30, maine: -6 },
        },
      },
      {
        label: 'Kieltäydy ja viittaa omaan brändiin',
        outcomeSuccess: {
          text: 'Itsenäisyys tuo karismaa. Paikalliset arvostavat.',
          effects: { maine: 4, jarki: 3 },
        },
        outcomeFail: {
          text: 'Kioski aloittaa hintasodan. Kukaan ei voita.',
          effects: { rahat: -40, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Kirkonkylän kirjastonhoitaja',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Kirjastonhoitaja vaatii hiljaisuutta ja kysyy lupaa järjestää runoilta.',
    choices: [
      {
        label: 'Järjestä ilta ja ota pieni maksu',
        outcomeSuccess: {
          text: 'Runoilijat tuovat oman yleisön. Markkoja ja mainetta sataa.',
          effects: { rahat: 120, maine: 8, jarki: 2 },
        },
        outcomeFail: {
          text: 'Tilaisuus venyy. Hiljaisuussääntö rikkoo mielesi.',
          effects: { jarki: -9, rahat: 10 },
        },
      },
      {
        label: 'Kieltäydy kohteliaasti',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Hän ymmärtää ja suosittelee silti kirjoja sinulle.',
          effects: { jarki: 5, maine: 3 },
        },
        outcomeFail: {
          text: 'Hän sulkee korttisi. Et saa lainata VHS:ää.',
          effects: { jarki: -4, maine: -3 },
        },
      },
    ],
  },
  {
    id: 'Sattuuko vuokra',
    triggerPhase: 'day',
    condition: (stats) => stats.rahat < 200,
    media: fallbackMedia,
    text: 'Vuokranantaja kolkuttaa. Kirjekuoressa punainen merkintä.',
    choices: [
      {
        label: 'Maksa osa ja lupaa loput',
        cost: { rahat: 80 },
        outcomeSuccess: {
          text: 'Hän mutisee, mutta hyväksyy. Saat yön rauhan.',
          effects: { maine: 2, jarki: 4 },
        },
        outcomeFail: {
          text: 'Hän ei usko sinua ja laittaa muistutuksen.',
          effects: { maine: -5, jarki: -7 },
        },
      },
      {
        label: 'Tarjoa talkootyötä',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Pihatyöt sulattavat sydämen. Vuokra lykkääntyy.',
          effects: { jarki: 6, maine: 4 },
        },
        outcomeFail: {
          text: 'Hän naureskelee ja korottaa vuokraa.',
          effects: { rahat: -60, maine: -4, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'EU tarkastaja',
    triggerPhase: 'day',
    condition: (stats) => stats.maine >= 50,
    media: fallbackMedia,
    text: 'Brysselistä saapuu kylmä katseinen tarkastaja. Hän haistelee ilmapiiriä.',
    choices: [
      {
        label: 'Näytä kaikki kuitit ja leimat',
        skillCheck: { stat: 'byroslavia', dc: 17 },
        outcomeSuccess: {
          text: 'Hän nyökkää tyytyväisenä ja jättää hyväksyntäleiman.',
          effects: { maine: 10, rahat: 100, jarki: -4 },
        },
        outcomeFail: {
          text: 'Yksi leima puuttuu. Hän kirjoittaa raportin.',
          effects: { maine: -12, jarki: -15, rahat: -80 },
        },
      },
      {
        label: 'Bluffaa että kaikki on pilot-projekti',
        skillCheck: { stat: 'pimppaus', dc: 18 },
        outcomeSuccess: {
          text: 'Hän vaikuttuu innovatiivisuudesta. Saat avustuksen.',
          effects: { rahat: 200, maine: 6, jarki: 2 },
        },
        outcomeFail: {
          text: 'Hän ei naura. Dokumentit takavarikoidaan.',
          effects: { maine: -15, jarki: -12, rahat: -120 },
        },
      },
    ],
  },
  {
    id: 'Poronhoitaja soittaa',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Nokiassa soi: "Tarviitko revontuliporoa promoihin?" Taustalla kuuluu kellon kilinä.',
    choices: [
      {
        label: 'Tilaa poro heti',
        cost: { rahat: 70 },
        outcomeSuccess: {
          text: 'Poro poseeraa neonvalojen edessä. Somehype kasvaa.',
          effects: { maine: 9, rahat: 140, jarki: 3 },
        },
        outcomeFail: {
          text: 'Poro karkaa Keskuskadulle ja poliisi soittaa.',
          effects: { maine: -6, rahat: -60, jarki: -5 },
        },
      },
      {
        label: 'Torju kohteliaasti',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Hän ymmärtää ja lupaa alen ensi viikolla.',
          effects: { rahat: 40, jarki: 4 },
        },
        outcomeFail: {
          text: 'Hän loukkaantuu ja varoittaa muille yrittäjille.',
          effects: { maine: -5, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Kahvilan juorut',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Kahvilan pitäjä kuiskuttaa, että poliisi suunnittelee ratsiaa.',
    choices: [
      {
        label: 'Tarjoa ilmainen pulla tiedosta',
        cost: { rahat: 15 },
        outcomeSuccess: {
          text: 'Saat tarkat kellonajat. Voit valmistautua.',
          effects: { maine: 3, jarki: 2, byroslavia: 2 },
        },
        outcomeFail: {
          text: 'Pulla ei riitä. Hän myy tiedon kilpailijalle.',
          effects: { maine: -4, jarki: -3 },
        },
      },
      {
        label: 'Ignoraa ja jatka kahvin keittoa',
        outcomeSuccess: {
          text: 'Rauha säilyy, mutta jää epävarmuus.',
          effects: { jarki: 5 },
        },
        outcomeFail: {
          text: 'Saat jälkeenpäin tietää että ratsia olisi vältetty.',
          effects: { maine: -3, jarki: -6 },
        },
      },
    ],
  },
  {
    id: 'Yökelkkailijat',
    triggerPhase: 'night',
    media: { type: 'video', src: media.snowyStreet, alt: 'Lumessa jyrisevät kelkat' },
    text: 'Saksalaiset moottorikelkkailijat parkkeeraavat neonin alle ja huutavat "LÄMPIMÄÄ GLÖG!!"',
    choices: [
      {
        label: 'Myy erikoisdrinkki ja selfie-passit',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Glögi loppuu ja tippiä sataa. Kelkkailijat mainitsevat sinut foorumilla.',
          effects: { rahat: 200, maine: 9, jarki: 1, sisu: -3 },
        },
        outcomeFail: {
          text: 'Yksi kaataa drinkin printeriin. Laitteet savuaa.',
          effects: { rahat: -70, jarki: -8, maine: -5 },
        },
      },
      {
        label: 'Pidä ovella pääsyrajoitus',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Paperi ja järjestys kunniaan. He jonottavat kiltisti.',
          effects: { maine: 5, jarki: 4 },
        },
        outcomeFail: {
          text: 'He hermostuvat ja lähtevät toiseen paikkaan.',
          effects: { rahat: -40, maine: -4 },
        },
      },
    ],
  },
  {
    id: 'KaraokeTuristit',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Ruotsalaiset haluavat laulaa Joulupukin maassa Abbaa.',
    choices: [
      {
        label: 'Anna mikki ja myy juomalippuja',
        outcomeSuccess: {
          text: 'Kaikki tanssii. Kassassa kilisee.',
          effects: { rahat: 150, maine: 6, jarki: 2 },
        },
        outcomeFail: {
          text: 'Mikki oikosulussa. Hiljaisuus on kiusallinen.',
          effects: { rahat: -30, maine: -5, jarki: -4 },
        },
      },
      {
        label: 'Piilota mikki ja vedä VHS-baariteema',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'Improvisointi toimii. He luulevat sen olevan konsepti.',
          effects: { maine: 8, rahat: 90 },
        },
        outcomeFail: {
          text: 'He pettyvät ja lähtevät.',
          effects: { maine: -6, rahat: -20, jarki: -2 },
        },
      },
    ],
  },
  {
    id: 'MafiaKeruu',
    triggerPhase: 'night',
    condition: (stats) => stats.maine < 20,
    media: fallbackMedia,
    text: 'Pimeä BMW pysähtyy. Velan perijä koputtaa tiskin kylkeen.',
    choices: [
      {
        label: 'Maksa osa rahana',
        cost: { rahat: 120 },
        outcomeSuccess: {
          text: 'Hän hyväksyy ja lähtee savuten.',
          effects: { jarki: 3, maine: 2 },
        },
        outcomeFail: {
          text: 'Rahat ei riitä. Hän uhkaa paluulla.',
          effects: { rahat: -80, jarki: -12, maine: -4 },
        },
      },
      {
        label: 'Bluffaa poliisiyhteyksillä',
        skillCheck: { stat: 'pimppaus', dc: 15 },
        outcomeSuccess: {
          text: 'Kerääjä hämmentyy ja vetäytyy.',
          effects: { maine: 6, jarki: 5 },
        },
        outcomeFail: {
          text: 'Bluffi paljastuu. Saat varoituksen.',
          effects: { maine: -7, jarki: -10 },
        },
      },
    ],
  },
  {
    id: 'PoliisiRatsia',
    triggerPhase: 'night',
    condition: (stats) => stats.maine > 40 || stats.rahat > 300,
    media: fallbackMedia,
    text: 'Siniset valot heijastuvat ikkunaan. Poliisi haluaa tarkistaa paperit.',
    choices: [
      {
        label: 'Anna kaikki luvat',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        outcomeSuccess: {
          text: 'Paperit kunnossa. He poistuvat, ja maine nousee.',
          effects: { maine: 7, jarki: 2 },
        },
        outcomeFail: {
          text: 'Lupa puuttuu. Saat sakon.',
          effects: { rahat: -100, maine: -8, jarki: -6 },
        },
      },
      {
        label: 'Järjestä viivyttely kahvilla',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'He jäävät rupattelemaan ja unohtavat tarkistaa kaiken.',
          effects: { maine: 4, jarki: 5 },
        },
        outcomeFail: {
          text: 'He hermostuvat ja tarkistavat kaksin verroin.',
          effects: { rahat: -60, maine: -5, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'AuroraInfluensseri',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Somevaikuttaja haluaa yksinoikeuden revontulikuvaan baarin katolta.',
    choices: [
      {
        label: 'Anna lupa ja tee yhteistyö',
        outcomeSuccess: {
          text: 'Postaus nousee viraaliksi. Markkoja virtaa.',
          effects: { rahat: 170, maine: 10, jarki: 2 },
        },
        outcomeFail: {
          text: 'Pilvi peittää taivaan. Kaikki oli turhaa.',
          effects: { rahat: -20, maine: -4 },
        },
      },
      {
        label: 'Kerro että katto on EU-suojelussa',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Hän kunnioittaa kieltoa ja silti mainitsee mystisen paikan.',
          effects: { maine: 5, jarki: 3 },
        },
        outcomeFail: {
          text: 'Hän suuttuu ja tekee haukkuvideon.',
          effects: { maine: -8, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Keskiyön nettilinja',
    triggerPhase: 'night',
    condition: (stats) => stats.jarki < 60,
    media: fallbackMedia,
    text: 'Nokia vilkuttaa sanoja joita et muista ohjelmoineesi. Linja humisee.',
    choices: [
      {
        label: 'Kirjoita viesti takaisin',
        cost: { jarki: 5 },
        outcomeSuccess: {
          text: 'Saat numeerisen arpalipun. Se tuo yön jackpotin.',
          effects: { rahat: 140, jarki: -2 },
        },
        outcomeFail: {
          text: 'Vastaus laukaisee outoja ääniä. Valot vilkkuu.',
          effects: { jarki: -12, maine: -2 },
        },
      },
      {
        label: 'Katkaise virta',
        outcomeSuccess: {
          text: 'Hiljaisuus palautuu. Lepäät hetken.',
          effects: { jarki: 8 },
        },
        outcomeFail: {
          text: 'Akku purkautuu ja tarvitset uuden.',
          effects: { rahat: -60, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'HaamuBussi',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Tyhjä linja-auto pysähtyy ilman kuljettajaa. Ovet aukeavat hitaasti.',
    choices: [
      {
        label: 'Tutki bussia',
        cost: { jarki: 6 },
        outcomeSuccess: {
          text: 'Löydät unohtuneita markkoja ja turistin kameran.',
          effects: { rahat: 110, maine: 2 },
        },
        outcomeFail: {
          text: 'Kuulet kaiun menneistä asiakkaista. Mieli särähtää.',
          effects: { jarki: -14, maine: -3 },
        },
      },
      {
        label: 'Sulje ovet ja siunaa',
        outcomeSuccess: {
          text: 'Bussi haihtuu sumuun. Sinusta tulee urbaani legenda.',
          effects: { maine: 7, jarki: 4 },
        },
        outcomeFail: {
          text: 'Siunaus kajahtaa takaisin. Korvissa soi.',
          effects: { jarki: -8 },
        },
      },
    ],
  },
  {
    id: 'ReindeerMafia',
    triggerPhase: 'night',
    condition: (stats) => stats.rahat > 100,
    media: fallbackMedia,
    text: 'Porot ilmestyvät mustissa takeissa. Ne kolkuttavat sarvilla oveen.',
    choices: [
      {
        label: 'Ruoki heidät jalluporkkanoilla',
        cost: { rahat: 40 },
        outcomeSuccess: {
          text: 'Porot rauhoittuvat ja vartioivat ovea.',
          effects: { maine: 6, jarki: 5, sisu: 3 },
        },
        outcomeFail: {
          text: 'Porkkanat olivat pilaantuneita. Ne pillastuvat.',
          effects: { jarki: -10, maine: -5 },
        },
      },
      {
        label: 'Lukitse ovet ja laita faksi soimaan',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Byrokraattinen ääni karkottaa lauman.',
          effects: { jarki: 4, maine: 3 },
        },
        outcomeFail: {
          text: 'Ne oppivat käyttämään nenäänsä ovenpainikkeena.',
          effects: { jarki: -9, rahat: -50 },
        },
      },
    ],
  },
  {
    id: 'GlitchyTaxSpirit',
    triggerPhase: 'night',
    condition: (stats) => stats.jarki < 35,
    media: { type: 'video', src: media.surrealVideo, alt: 'Glitchaava tarkastus' },
    text: 'Faksi kirjoittaa itseään: "RUN: FORM". Näet Krok-avarion varjon.',
    choices: [
      {
        label: 'Täytä lomake verellä',
        cost: { jarki: 8 },
        outcomeSuccess: {
          text: 'Varjo tyyntyy ja jättää kasan hyväksyntämerkkejä.',
          effects: { maine: 9, rahat: 90, jarki: -4 },
        },
        outcomeFail: {
          text: 'Lomake palaa. Mielesi rasahtaa.',
          effects: { jarki: -16, maine: -6 },
        },
      },
      {
        label: 'Soita säkkijärven polkka Nokiasta',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Sävel resonoi ja henki poistuu sähkölinjoja pitkin.',
          effects: { jarki: 12, maine: 4 },
        },
        outcomeFail: {
          text: 'Nuotti menee pieleen. Glitch voimistuu.',
          effects: { jarki: -12, rahat: -30 },
        },
      },
    ],
  },
  {
    id: 'Yöllinen tullimies',
    triggerPhase: 'night',
    condition: (stats) => stats.rahat > 200,
    media: fallbackMedia,
    text: 'Tullimies kurkistaa takahuoneeseen ja kyselee laittomista VHS-lähetyksistä.',
    choices: [
      {
        label: 'Näytä varasto avoimesti',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Tullimies löytää vain verottajan pamfletteja. Saat kiitoksen.',
          effects: { maine: 5, jarki: 4 },
        },
        outcomeFail: {
          text: 'Hän takavarikoi pari kasettia ja laskuttaa.',
          effects: { rahat: -90, maine: -6 },
        },
      },
      {
        label: 'Tarjoa kahvi ja unohtumaton tarina',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Hän nauraa ja jättää raportin kirjoittamatta.',
          effects: { maine: 6, jarki: 3 },
        },
        outcomeFail: {
          text: 'Hän epäilee lahjontaa. Kirjoittaa muistiinpanot.',
          effects: { maine: -7, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Lumihankeen kadonnut turisti',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Eksynyt japanilainen turisti astuu sisään, kamera huurussa.',
    choices: [
      {
        label: 'Tarjoa teetä ja myy kartta',
        outcomeSuccess: {
          text: 'Hän kiittää syvästi ja jättää paksun tipin.',
          effects: { rahat: 130, maine: 7, jarki: 3 },
        },
        outcomeFail: {
          text: 'Kartta on vanha ja vie väärään kylään.',
          effects: { maine: -5, jarki: -6, rahat: -20 },
        },
      },
      {
        label: 'Kutsu taksi Nokiasta',
        cost: { rahat: 30 },
        outcomeSuccess: {
          text: 'Taksi saapuu heti. Turisti tekee sinusta legendan.',
          effects: { maine: 8, jarki: 4 },
        },
        outcomeFail: {
          text: 'Taksi ei vastaa. Turisti pettyy.',
          effects: { maine: -3, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Yön Glögi-kilpailu',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Paikalliset baarit haastavat sinut glögikaksintaisteluun.',
    choices: [
      {
        label: 'Osallistu ja mausta salmiakilla',
        skillCheck: { stat: 'pimppaus', dc: 15 },
        outcomeSuccess: {
          text: 'Voitat ja saat pokaalin sekä sponsorirahaa.',
          effects: { rahat: 160, maine: 10, jarki: 3 },
        },
        outcomeFail: {
          text: 'Juoma kiehuu yli. Yleisö viheltää.',
          effects: { rahat: -50, maine: -7, jarki: -6 },
        },
      },
      {
        label: 'Kieltäydy ja vetoa hygieniaohjeeseen',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Kilpailu perutaan. Maineesi pysyy mystisenä.',
          effects: { maine: 4, jarki: 2 },
        },
        outcomeFail: {
          text: 'He pitävät sinua pelkurina.',
          effects: { maine: -5, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Lapin noir -kirjailija',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Kirjailija etsii materiaalia synkästä Lapista. Hän nuuhkii ilmapiiriä.',
    choices: [
      {
        label: 'Myy hänelle oikeudet tarinaasi',
        outcomeSuccess: {
          text: 'Saat ennakkomaksun ja maininnan romaanissa.',
          effects: { rahat: 120, maine: 6, jarki: 2 },
        },
        outcomeFail: {
          text: 'Kustantaja peruu. Saat vain säälirahaa.',
          effects: { rahat: -20, jarki: -4 },
        },
      },
      {
        label: 'Pidä tarinat itselläsi',
        outcomeSuccess: {
          text: 'Salaperäisyys kasvattaa myyttiä.',
          effects: { maine: 5, jarki: 3 },
        },
        outcomeFail: {
          text: 'Hän kirjoittaa sinusta negatiivisen hahmon.',
          effects: { maine: -6, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Joulupukin kaksoisolento',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Joku väittää olevansa oikea Pukki ja vaatii pääsyä VIP-tilaan.',
    choices: [
      {
        label: 'Päästä sisään ja myy VIP-paketti',
        outcomeSuccess: {
          text: 'Hän jakaa karkkia ja rahaa. Lapsettomatkin innostuvat.',
          effects: { rahat: 140, maine: 8, jarki: 1 },
        },
        outcomeFail: {
          text: 'Paljastuu humalaiseksi serkuksi. Tunnelma lässähtää.',
          effects: { maine: -6, jarki: -4, rahat: -30 },
        },
      },
      {
        label: 'Testaa häntä virallisella pukki-kokeella',
        skillCheck: { stat: 'byroslavia', dc: 13 },
        outcomeSuccess: {
          text: 'Koe menee läpi. Saat sertifikaatin seinälle.',
          effects: { maine: 7, jarki: 4 },
        },
        outcomeFail: {
          text: 'Hän hermostuu ja poistuu. Asiakkaat nauravat sinulle.',
          effects: { maine: -4, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Yöllinen lumimyrsky',
    triggerPhase: 'night',
    media: fallbackMedia,
    text: 'Myrsky hakkaa ikkunoita. Sähköt välkkyvät.',
    choices: [
      {
        label: 'Sulje ovet ja tee kynttiläillallinen',
        outcomeSuccess: {
          text: 'Tunnelma muuttuu romanttiseksi. Asiakkaat viihtyvät.',
          effects: { rahat: 90, maine: 5, jarki: 3 },
        },
        outcomeFail: {
          text: 'Kynttilä palaa loppuun. Joudut korjaamaan sulakkeet.',
          effects: { jarki: -8, rahat: -30 },
        },
      },
      {
        label: 'Pidä ovet auki ja myy myrskyshotteja',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Shotit lämmittävät. Myynti kasvaa.',
          effects: { rahat: 130, maine: 4, sisu: -2 },
        },
        outcomeFail: {
          text: 'Asiakkaat liukastuvat. Joudut korvaamaan takin.',
          effects: { rahat: -70, maine: -5 },
        },
      },
    ],
  },
  {
    id: 'Sähkökatko faxissa',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Faksin näyttö pimenee. Kuuluu etäinen modemin itku.',
    choices: [
      {
        label: 'Kytke dieselgeneraattori',
        cost: { rahat: 40 },
        outcomeSuccess: {
          text: 'Kone herää ja sylkee salaisen tarjouslomakkeen.',
          effects: { rahat: 100, maine: 4, jarki: 1 },
        },
        outcomeFail: {
          text: 'Diesel vuotaa lattialle.',
          effects: { rahat: -60, jarki: -8 },
        },
      },
      {
        label: 'Korjaa sulake itse',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Pieni kipinä, mutta toimii. Saat hallinnan tunteen.',
          effects: { jarki: 7, maine: 3 },
        },
        outcomeFail: {
          text: 'Saat tärskyn. Valot välkkyvät.',
          effects: { jarki: -10, maine: -2 },
        },
      },
    ],
  },
  {
    id: 'Kuntapomo sauna',
    triggerPhase: 'day',
    media: fallbackMedia,
    text: 'Kunnanjohtaja kutsuu sinut saunaan keskustelemaan luvista.',
    choices: [
      {
        label: 'Mene ja tarjoa löylyolut',
        cost: { jarki: 4 },
        outcomeSuccess: {
          text: 'Luvat joustavat. Saat lisäaukioloajan.',
          effects: { maine: 6, rahat: 80, jarki: 2 },
        },
        outcomeFail: {
          text: 'Saunan hehku väsyttää. Et saa sovittua mitään.',
          effects: { jarki: -8, maine: -3 },
        },
      },
      {
        label: 'Kieltäydy vetoamalla kiireeseen',
        outcomeSuccess: {
          text: 'Hän arvostaa rehellisyyttä ja lähettää sihteerin myöhemmin.',
          effects: { maine: 3, jarki: 3 },
        },
        outcomeFail: {
          text: 'Pomo tulistuu. Lupien käsittely hidastuu.',
          effects: { maine: -7, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Faxista kuuluu kuoro',
    triggerPhase: 'day',
    condition: (stats) => stats.jarki < 50,
    media: fallbackMedia,
    text: 'Faksi hyräilee virsien melodioita. Paperi liikkuu ilman sähköä.',
    choices: [
      {
        label: 'Nauhoita ja myy kasettina',
        outcomeSuccess: {
          text: 'Outo soundtrack myy kuin häkä.',
          effects: { rahat: 120, maine: 5, jarki: -2 },
        },
        outcomeFail: {
          text: 'Ääni rikkoutuu. Korvasi soivat.',
          effects: { jarki: -12, maine: -3 },
        },
      },
      {
        label: 'Siunaa laite ja sammuta',
        skillCheck: { stat: 'pimppaus', dc: 11 },
        outcomeSuccess: {
          text: 'Kuoro vaikenee. Saat mielenrauhan.',
          effects: { jarki: 10, maine: 2 },
        },
        outcomeFail: {
          text: 'Laite hyräilee kovempaa.',
          effects: { jarki: -9, rahat: -20 },
        },
      },
    ],
  },
  {
    id: 'Sanity check Nokia',
    triggerPhase: 'day',
    condition: (stats) => stats.jarki <= 25,
    media: fallbackMedia,
    text: 'Nokia näyttää riimuja: "VÄÄRÄAINEISTO". Ruudun vihreä vilkkuu.',
    choices: [
      {
        label: 'Soita omaan numeroosi',
        cost: { jarki: 5 },
        outcomeSuccess: {
          text: 'Vastaat itse ja saat neuvoja tulevalle yölle.',
          effects: { byroslavia: 3, jarki: 6, maine: 2 },
        },
        outcomeFail: {
          text: 'Vastaus on vain staattista kyynelettä.',
          effects: { jarki: -12 },
        },
      },
      {
        label: 'Sulje puhelin folioon',
        outcomeSuccess: {
          text: 'Signaali vaimenee. Saat hengähdyksen.',
          effects: { jarki: 8 },
        },
        outcomeFail: {
          text: 'Folio kipinöi. Saat pienen palovamman.',
          effects: { jarki: -6, maine: -2 },
        },
      },
    ],
  },
  {
    id: 'Rahanvaihtajat',
    triggerPhase: 'day',
    condition: (stats) => stats.rahat > 150,
    media: fallbackMedia,
    text: 'Mustapörssin rahanvaihtajat ehdottavat markkojen vaihtoa kruunuihin.',
    choices: [
      {
        label: 'Hyödynnä kurssiero',
        outcomeSuccess: {
          text: 'Saat siivun voittoa ja uusia kontakteja.',
          effects: { rahat: 110, maine: 4, jarki: 1 },
        },
        outcomeFail: {
          text: 'Kurssi romahtaa. Hävität kassaa.',
          effects: { rahat: -100, maine: -5, jarki: -4 },
        },
      },
      {
        label: 'Ilmianna heidät puhelimella',
        skillCheck: { stat: 'byroslavia', dc: 11 },
        outcomeSuccess: {
          text: 'Poliisi kiittää. Saat palkkion.',
          effects: { rahat: 70, maine: 6 },
        },
        outcomeFail: {
          text: 'He kuulevat ilmiannosta. Saat uhkakirjeen.',
          effects: { maine: -7, jarki: -7 },
        },
      },
    ],
  },
  {
    id: 'NightBus takaisin',
    triggerPhase: 'night',
    condition: (stats) => stats.maine >= 30,
    media: fallbackMedia,
    text: 'Yöbussi tuo vanhat asiakkaat takaisin. He haluavat vakkari-etuja.',
    choices: [
      {
        label: 'Anna kanta-asiakasleima',
        outcomeSuccess: {
          text: 'He palaavat joka viikko. Tasainen kassavirta syntyy.',
          effects: { rahat: 120, maine: 6, jarki: 3 },
        },
        outcomeFail: {
          text: 'Leimauslaite hajoaa. He hermostuvat.',
          effects: { maine: -6, rahat: -30, jarki: -4 },
        },
      },
      {
        label: 'Pidä hinnat korkeina',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'He maksavat premiumista ja kokevat itsensä VIPiksi.',
          effects: { rahat: 170, maine: 4 },
        },
        outcomeFail: {
          text: 'He kokevat ryöstöksi ja kääntyvät pois.',
          effects: { maine: -8, rahat: -20 },
        },
      },
    ],
  },
  {
    id: 'Pimenevä hanki',
    triggerPhase: 'night',
    condition: (stats) => stats.sisu < 40,
    media: fallbackMedia,
    text: 'Kylmä puree luihin. Lumi näyttää hengittävän.',
    choices: [
      {
        label: 'Juo termarikahvi ja jatka',
        outcomeSuccess: {
          text: 'Saat hetkeksi lämpöä ja pysyt tolpillasi.',
          effects: { sisu: 8, jarki: 2 },
        },
        outcomeFail: {
          text: 'Kahvi on jäässä. Palellut sormet sattuvat.',
          effects: { jarki: -8, sisu: -6 },
        },
      },
      {
        label: 'Sulje aikaisin ja mene saunaan',
        cost: { rahat: -20 },
        outcomeSuccess: {
          text: 'Löyly palauttaa sisun.',
          effects: { sisu: 12, jarki: 6 },
        },
        outcomeFail: {
          text: 'Saunan kiuas rikkoontuu. Korjaus maksaa.',
          effects: { rahat: -60, jarki: -5 },
        },
      },
    ],
  },
  {
    id: 'Yöksi EU-vieras',
    triggerPhase: 'night',
    condition: (stats) => stats.maine > 55,
    media: fallbackMedia,
    text: 'EU-delegaation jäsen eksyy yöelämään ja istahtaa tiskille.',
    choices: [
      {
        label: 'Tarjoa tasting ja kerro Lapin tarina',
        skillCheck: { stat: 'pimppaus', dc: 16 },
        outcomeSuccess: {
          text: 'Hän hurmioituu ja lupaa tukirahaa.',
          effects: { rahat: 220, maine: 10, jarki: 3 },
        },
        outcomeFail: {
          text: 'Tarina venyy ja hän kyllästyy.',
          effects: { maine: -7, jarki: -5 },
        },
      },
      {
        label: 'Pysy hiljaa ja laskuta hillitysti',
        outcomeSuccess: {
          text: 'Hän arvostaa diskreettejä palveluja.',
          effects: { rahat: 140, maine: 4 },
        },
        outcomeFail: {
          text: 'Hän luulee sinua välinpitämättömäksi.',
          effects: { maine: -4, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Verotarkastus Encore',
    triggerPhase: 'night',
    condition: (stats) => stats.maine > 70 && stats.jarki > 40,
    media: { type: 'video', src: media.surrealVideo, alt: 'Toistuva verosilmä' },
    text: 'Hannele Krok palaa, mutta tällä kertaa hologrammina. Boss fight 2.0.',
    choices: [
      {
        label: 'Heiluta kaikkia lomakkeita rytmissä',
        skillCheck: { stat: 'byroslavia', dc: 19 },
        cost: { jarki: 10 },
        outcomeSuccess: {
          text: 'Hologrammi sulaa dataksi. Saat korvauksen liikaa maksetuista veroista.',
          effects: { rahat: 250, maine: 12, jarki: -4 },
        },
        outcomeFail: {
          text: 'Data korruptoituu. Joudut maksamaan lisäselvityksestä.',
          effects: { rahat: -180, jarki: -18, maine: -10 },
        },
      },
      {
        label: 'Tarjoa glitch-kahvi',
        skillCheck: { stat: 'pimppaus', dc: 17 },
        outcomeSuccess: {
          text: 'Krok juo pikselit ja poistuu tyytyväisenä.',
          effects: { maine: 9, jarki: 6 },
        },
        outcomeFail: {
          text: 'Kahvi kaatuu serverille. Vaatimuslista pitenee.',
          effects: { jarki: -12, rahat: -90 },
        },
      },
    ],
  },
  {
    id: 'Turistibussi',
    triggerPhase: 'night',
    media: {
      type: 'video',
      src: media.snowyStreet,
      alt: 'Turistibussi luo sumuisen valon lumelle',
    },
    text: 'Ruotsalainen turistibussi kaartaa pihaan. Neon kyltti välkkyy, porot tuijottavat.',
    choices: [
      {
        label: 'Myy kaikki Salmiakkikossut',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Jengi huutaa "skål" ja jättää tippiä. Markat kilisevät kassaan.',
          effects: { rahat: 220, maine: 6, jarki: 2, sisu: -4 },
        },
        outcomeFail: {
          text: 'Bussi huomaa verottajan lapun ovessa. Kääntyy pois, maine ratisemaan.',
          effects: { rahat: -40, maine: -8, jarki: -4 },
        },
      },
      {
        label: 'Salaa Net Monitoriin revontulikanava',
        skillCheck: { stat: 'byroslavia', dc: 10 },
        outcomeSuccess: {
          text: 'Turistit luulevat kyseessä olevan virallinen valvontakokeilu. Maine kasvaa mystisenä.',
          effects: { maine: 10, rahat: 50, jarki: -2 },
        },
        outcomeFail: {
          text: 'Signaali säröilee ja kuulet kuiskauksen: "RUN: DIE". Turistit hermostuvat.',
          effects: { jarki: -10, maine: -3 },
        },
      },
    ],
  },
  {
    id: 'Verotarkastus',
    triggerPhase: 'night',
    condition: (stats) => stats.maine > 25,
    media: {
      type: 'video',
      src: media.surrealVideo,
      alt: 'Verottaja ilmestyy lumiseen toimistoon',
    },
    text: 'Ovi paukahtaa. Hannele Krok astuu sisään paksun mapin kanssa. Boss fight: Paper War.',
    choices: [
      {
        label: 'Vastaa Lomake 5057e -kombolla',
        skillCheck: { stat: 'byroslavia', dc: 18 },
        cost: { jarki: 8 },
        outcomeSuccess: {
          text: 'Mapit sulavat. Verottaja hymyilee ja poistuu jättäen sinut rauhaan.',
          effects: { maine: 5, jarki: -5, rahat: -30 },
        },
        outcomeFail: {
          text: 'Lisäselvityspyyntö. Kirjekuori alkaa savuamaan.',
          effects: { jarki: -20, rahat: -150 },
        },
      },
      {
        label: 'Bluffaa pimppauksella ja tarjoa kahvit',
        skillCheck: { stat: 'pimppaus', dc: 16 },
        outcomeSuccess: {
          text: 'Krok hörppää ja sulaa. Saat armonaikaa ja huhun mukaan bonuspisteitä.',
          effects: { maine: 8, rahat: -20, jarki: 4 },
        },
        outcomeFail: {
          text: 'Kahvi oli kylmää. Saat merkinnän ja mieltä kiristää.',
          effects: { maine: -10, jarki: -12, rahat: -50 },
        },
      },
    ],
  },
  {
    id: 'Hiljainen tiistai',
    triggerPhase: 'day',
    tier: 1,
    media: fallbackMedia,
    text: 'Lumi narskuu hiljaa. Asiakkaat puuttuvat, mutta kahvi lämmittää.',
    choices: [
      {
        label: 'Tee paperisota kuntoon',
        outcomeSuccess: {
          text: 'Pöytä selkeytyy, mieli kirkastuu.',
          effects: { jarki: 6, byroslavia: 2 },
        },
        outcomeFail: {
          text: 'Arkistokaappi kaatuu. Parit markat menee teippiin.',
          effects: { rahat: -20, jarki: -2 },
        },
      },
    ],
  },
  {
    id: 'Posti hukkasi kirjeen',
    triggerPhase: 'day',
    tier: 1,
    media: fallbackMedia,
    text: 'Postileima on väärässä maassa. EU-kuori ei koskaan tullut perille.',
    choices: [
      {
        label: 'Soita lajittelukeskukseen',
        outcomeSuccess: {
          text: 'Saat kopion faksilla. Maine pysyy nipussa.',
          effects: { maine: 2, jarki: 3 },
        },
        outcomeFail: {
          text: 'Jonotus maksaa. Hermo palaa.',
          effects: { rahat: -30, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Hiljainen humina',
    triggerPhase: 'night',
    tier: 1,
    media: fallbackMedia,
    text: 'Venttiilit humisevat. Asiakkaat tuijottavat neonia rauhallisesti.',
    choices: [
      {
        label: 'Pienennä valoja ja säästä',
        outcomeSuccess: {
          text: 'Sähkölasku kevenee ja mieli lepää.',
          effects: { rahat: 30, jarki: 4 },
        },
        outcomeFail: {
          text: 'Hämärä tekee poroista levottomia.',
          effects: { maine: -3, jarki: -2 },
        },
      },
    ],
  },
  {
    id: 'Hilpeä puhelinkoppi',
    triggerPhase: 'night',
    tier: 2,
    media: fallbackMedia,
    text: 'Puhelinkoppi vilkkuu. Turisti pitää linjaa varattuna.',
    choices: [
      {
        label: 'Tarjoa kolikko ja juoru',
        outcomeSuccess: {
          text: 'Juoru kiertää kylällä. Saat yllättävän nosteen.',
          effects: { maine: 4, rahat: 40 },
        },
        outcomeFail: {
          text: 'Turisti haukkuu palvelun. Saat ylenpalttista palautetta.',
          effects: { maine: -4, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Hiljainen tiistaiaamu',
    triggerPhase: 'day',
    tier: 2,
    media: fallbackMedia,
    text: 'Kahvin tuoksu leijailee, mutta kirjanpito huutaa.',
    choices: [
      {
        label: 'Tee inventaario',
        outcomeSuccess: {
          text: 'Löydät ylimääräisen laatikon salmiakkikossua.',
          effects: { rahat: 60, jarki: 2 },
        },
        outcomeFail: {
          text: 'Löydät vain pölyä ja muistoja.',
          effects: { jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'Posti toi väärän laatikon',
    triggerPhase: 'day',
    tier: 2,
    media: fallbackMedia,
    text: 'Laatikossa on mystisiä kuponkeja ja yksi rikkinäinen lamppu.',
    choices: [
      {
        label: 'Hyödynnä kupongit',
        outcomeSuccess: {
          text: 'Kupongit käyvät yllättäen. Asiakkaat ilahtuvat.',
          effects: { maine: 3, rahat: 70 },
        },
        outcomeFail: {
          text: 'Kupongit ovat vanhentuneet. Joudut maksamaan palautuksen.',
          effects: { rahat: -40, jarki: -3 },
        },
      },
    ],
  },
  {
    id: 'Sähkökatkon varoitus',
    triggerPhase: 'night',
    tier: 2,
    media: fallbackMedia,
    text: 'Sähköyhtiö faksaa myrskystä. Pitääkö generaattori virittää?',
    choices: [
      {
        label: 'Käynnistä generaattori',
        cost: { rahat: 50 },
        outcomeSuccess: {
          text: 'Valot pysyvät. Asiakkaat kiittävät.',
          effects: { maine: 5, rahat: 80 },
        },
        outcomeFail: {
          text: 'Bensiini haisee ja pää särkee.',
          effects: { jarki: -6 },
        },
      },
    ],
  },
  {
    id: 'Hiljainen torstai',
    triggerPhase: 'day',
    tier: 3,
    media: fallbackMedia,
    text: 'Taivas on violetti. Kukaan ei soita. LAI värähtää.',
    choices: [
      {
        label: 'Meditoi neonin alla',
        outcomeSuccess: {
          text: 'Hallitset pelon. Järki vahvistuu.',
          effects: { jarki: 7, maine: 2 },
        },
        outcomeFail: {
          text: 'Katse eksyy kaukaiseen horisonttiin. Pää humisee.',
          effects: { jarki: -8 },
        },
      },
    ],
  },
  {
    id: 'Postin myöhästynyt paketti',
    triggerPhase: 'day',
    tier: 3,
    media: fallbackMedia,
    text: 'Paketti saapuu klo 23, väärästä ovesta. Sisällä on vain neonputkia.',
    choices: [
      {
        label: 'Vaihtoehtoinen valaistus',
        outcomeSuccess: {
          text: 'Putket laulavat kosmista säveltä. Asiakkaat viihtyvät.',
          effects: { maine: 6, rahat: 90 },
        },
        outcomeFail: {
          text: 'Putki särkyy ja kipinät pelästyttävät.',
          effects: { jarki: -7, rahat: -60 },
        },
      },
    ],
  },
  {
    id: 'Hiljainen keskiviikkoyö',
    triggerPhase: 'night',
    tier: 3,
    media: fallbackMedia,
    text: 'Pihan neonit värisevät. Staalo ei näy, mutta tunnet katseen.',
    choices: [
      {
        label: 'Soita huminaa vastameluksi',
        outcomeSuccess: {
          text: 'Ääniseinä torjuu varjon. Mieli pysyy koossa.',
          effects: { jarki: 5, sisu: 4 },
        },
        outcomeFail: {
          text: 'Ääni vääristyy. LAI kipuaa.',
          effects: { jarki: -6, maine: -2 },
        },
      },
    ],
  },
]

export const gameEvents: GameEvent[] = [...coreGameEvents, ...aiFaxEvents]
export const fallbackEventMedia = fallbackMedia
