import faxMachine from '../assets/fax_machine.png.png'
import snowyStreet from '../assets/Snowy_Finland_Street_VHS.mp4'
import surrealVideo from '../assets/Surreal_Horror_Video_Generation.mp4'
import fallbackImage from '../assets/react.svg'

export type ItemType = 'consumable' | 'tool' | 'form' | 'relic'

export interface Stats {
  money: number // RAHAT (mk)
  reputation: number // MAINE
  sanity: number // JÄRKI
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
  vibe?: 'occult' | 'mundane'
  media?: {
    type: 'image' | 'video'
    src: string
    alt: string
  }
  text: string
  paperWar?: boolean
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
          effects: { sanity: 2, reputation: 1 },
        },
        outcomeFail: {
          text: 'Piikki särähtää hermoihin. Maine kasvaa, mutta uni häiriintyy.',
          effects: { sanity: -4, reputation: 3 },
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
          effects: { sanity: 3, money: 30 },
        },
        outcomeFail: {
          text: 'Puhelu katkeaa, mutta korvissa soi. Järki rätisee.',
          effects: { sanity: -6 },
        },
      },
      {
        label: 'Katkaise virta',
        outcomeSuccess: {
          text: 'Linja hiljenee. LAI laskee hetkeksi, mutta et saa tietoa.',
          effects: { sanity: 1 },
        },
        outcomeFail: {
          text: 'Virta palaa itsekseen. Staalo nauraa jossain kaukana.',
          effects: { sanity: -2, money: -10 },
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
          effects: { money: 90, reputation: 4 },
        },
        outcomeFail: {
          text: 'Sähkökatko. Faksi sulaa, joudut maksamaan korjaukset.',
          effects: { money: -60, sanity: -3 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Paluu Lappiin',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation <= 15,
    media: fallbackMedia,
    text: 'Saavut Rovaniemelle. Vanha neon-kyltti välähtää ja kylmä huuru lyö kasvoille.',
    choices: [
      {
        label: 'Avataan ovi ja laitetaan kahvi tippumaan',
        outcomeSuccess: {
          text: 'Tila tuoksuu tutulta. Olet taas kotona.',
          effects: { sanity: 6, money: 20 },
        },
        outcomeFail: {
          text: 'Sulakkeet kärähtävät. Ensimmäinen päivä alkaa hermoillen.',
          effects: { sanity: -8, money: -40 },
        },
      },
      {
        label: 'Soita Kallelle ja pyydä vanhaa kassakonetta',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Kalle lupaa tukea. Kassakone kilahtaa vanhaan malliin.',
          effects: { money: 80, reputation: 2 },
        },
        outcomeFail: {
          text: 'Kalle ei vastaa. Kuuntelet vain pohjoistuulta.',
          effects: { sanity: -4 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Ensimmäinen EU-faksi',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation <= 18,
    media: { type: 'image', src: faxMachine, alt: 'Ensimmäinen neon-faksi' },
    text: 'Brysselistä jyrähtää neonilla korostettu faksi: "Poro migreenit neonvaloista".',
    choices: [
      {
        label: 'Himmennä kyltit ja allekirjoita vastaanotto',
        cost: { money: 50 },
        outcomeSuccess: {
          text: 'Poro kiittää nyökkäyksellä ikkunan takaa.',
          effects: { reputation: 6, sanity: 3 },
        },
        outcomeFail: {
          text: 'Valot välähtävät uudelleen. Poro soittaa lehdistöä.',
          effects: { reputation: -6, sanity: -6 },
        },
      },
      {
        label: 'Teippaa faksin kiinni ja kirjoita vastine',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Perustelusi menevät läpi. Saat jatkoaikaa.',
          effects: { money: 60, reputation: 3 },
        },
        outcomeFail: {
          text: 'Teksti jää musteläiskäksi. EU-tiskillä pudistellaan päätä.',
          effects: { sanity: -10, reputation: -4 },
        },
      },
    ],
  },
  {
    id: 'Prologi: Krok esittäytyy',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation >= 12 && stats.reputation <= 30,
    media: { type: 'video', src: surrealVideo, alt: 'Krok hologrammina' },
    text: 'Verotarkastaja Krok välähtää hologrammina: "Näen teidät pian".',
    choices: [
      {
        label: 'Valmistele kahvit ja kansiot',
        cost: { sanity: 5 },
        outcomeSuccess: {
          text: 'Krok arvostaa valmistelua. Saat hetken rauhan.',
          effects: { reputation: 5, sanity: 2 },
        },
        outcomeFail: {
          text: 'Kansiot sekaisin, kahvi läikkyy. Krok hymähtää kylmästi.',
          effects: { reputation: -5, sanity: -7 },
        },
      },
      {
        label: 'Uhmaa ja laita VHS-suoja oveen',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Hologrammi säröytyy. Saat lisäaikaa veroihin.',
          effects: { money: 90, sanity: 4 },
        },
        outcomeFail: {
          text: 'Särö kääntyy takaisin. Krok merkitsee nimesi punaiseen.',
          effects: { reputation: -8, money: -40 },
        },
      },
    ],
  },
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
    id: 'Kurkkudirektiivi iskee',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation >= 10,
    media: fallbackMedia,
    text: 'Saapuu faksi: "Kurkkudirektiivi – jokainen drinkki mitattava 11,3 cm kurkulla".',
    choices: [
      {
        label: 'Tilaa laatikollinen kurkkuja',
        cost: { money: 70 },
        outcomeSuccess: {
          text: 'Drinkit näyttävät standardilta. EU-virkailija hymyilee.',
          effects: { reputation: 7, sanity: 2 },
        },
        outcomeFail: {
          text: 'Kurkkujen hinta räjähtää. Asiakkaat nauravat sinulle.',
          effects: { money: -80, reputation: -5 },
        },
      },
      {
        label: 'Vetoa poikkeuslupaan, Lapin valo-olosuhteet',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        outcomeSuccess: {
          text: 'Poikkeuslupa myönnetään. Säästät rahat.',
          effects: { money: 120, reputation: 4 },
        },
        outcomeFail: {
          text: 'Hakemus katoaa. Saat sakon.',
          effects: { money: -120, sanity: -8 },
        },
      },
      {
        label: 'Juo kaikki kurkut itse protestina',
        outcomeSuccess: {
          text: 'Outo energia valtaa sinut. Tarinat leviävät.',
          effects: { sanity: -4, reputation: 5, sisu: 6 },
        },
        outcomeFail: {
          text: 'Suola kuivattaa. Menet shokkiin hetkeksi.',
          effects: { sanity: -10, reputation: -3 },
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
          effects: { money: 170, reputation: 8, sanity: -2 },
        },
        outcomeFail: {
          text: 'Hän kaataa glögin mikseriin. Kaikki piippaa.',
          effects: { money: -90, sanity: -7 },
        },
      },
      {
        label: 'Peru esitys ja myy t-paita matkamuistona',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Shamaani ostaa kolme. Hän mainitsee sinut blogissa.',
          effects: { money: 110, reputation: 4 },
        },
        outcomeFail: {
          text: 'Hän suuttuu ja kiroaa tiskin.',
          effects: { reputation: -6, sanity: -5 },
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
        cost: { money: 30 },
        outcomeSuccess: {
          text: 'Talvi-hipstereitä valuu sisään. Lippuja myydään.',
          effects: { money: 180, reputation: 10, sanity: -4 },
        },
        outcomeFail: {
          text: 'Algoritmi ei näytä mainosta. Hiljainen ilta.',
          effects: { money: -30, sanity: 2 },
        },
      },
      {
        label: 'Salli vain paikallisille legendat',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'Tunnelma tiivistyy. Maine kasvaa legendaarisena.',
          effects: { reputation: 12, sanity: 3 },
        },
        outcomeFail: {
          text: 'Ulkopaikkakuntalaiset boikotoivat.',
          effects: { money: -60, reputation: -5 },
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
        cost: { sanity: 6 },
        outcomeSuccess: {
          text: 'Vanha konjakki avaa tarinoita. Saat yhteyksiä.',
          effects: { reputation: 7, money: 90, sisu: 8 },
        },
        outcomeFail: {
          text: 'Heräät aamulla varastossa. Kukkaro keventynyt.',
          effects: { money: -100, sanity: -8 },
        },
      },
      {
        label: 'Kieltäydy ja lähetä lahjakori',
        outcomeSuccess: {
          text: 'Mestari arvostaa kohteliaisuutta.',
          effects: { reputation: 5, sanity: 4 },
        },
        outcomeFail: {
          text: 'Lahjakori tippuu portaisiin. Mestari suuttuu.',
          effects: { reputation: -7, money: -40 },
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
          effects: { reputation: 9, money: 120, sanity: 2 },
        },
        outcomeFail: {
          text: 'Valot vilkkuvat. Poro törmää ikkunaan.',
          effects: { money: -70, sanity: -6 },
        },
      },
      {
        label: 'Sulje ovet ja kuuntele sumun huminaa',
        cost: { sanity: 4 },
        outcomeSuccess: {
          text: 'Humina rauhoittaa. Säästät sähkön.',
          effects: { sanity: 10, money: 40 },
        },
        outcomeFail: {
          text: 'Humina muuttuu kuiskauksiksi. Pelko hiipii.',
          effects: { sanity: -12, reputation: -3 },
        },
      },
    ],
  },
  {
    id: 'Staalo varjosta',
    triggerPhase: 'night',
    media: { type: 'video', src: snowyStreet, alt: 'Varjo liikkuu kadulla' },
    text: 'Staalo ilmestyy varjona oven taakse. Sarvet piirtyvät valoon.',
    choices: [
      {
        label: 'Tarjoa hopeinen shottilasi',
        cost: { money: 40 },
        outcomeSuccess: {
          text: 'Staalo tyyntyy ja katoaa lumeen.',
          effects: { sanity: 8, reputation: 6 },
        },
        outcomeFail: {
          text: 'Staalo murskaa lasin. Pelko leviää asiakkaisiin.',
          effects: { sanity: -14, reputation: -7 },
        },
      },
      {
        label: 'Pelaa säkkijärven polkkaa kovalla',
        skillCheck: { stat: 'pimppaus', dc: 15 },
        outcomeSuccess: {
          text: 'Rytmi ajaa varjon kauemmas.',
          effects: { reputation: 5, sanity: 6 },
        },
        outcomeFail: {
          text: 'Rytmi ärsyttää. Varjo paiskoo roskiksen.',
          effects: { money: -60, sanity: -10 },
        },
      },
    ],
  },
  {
    id: 'Maahisen diili',
    triggerPhase: 'night',
    condition: (stats) => stats.money < 100,
    media: fallbackMedia,
    text: 'Pöydän alta kurkistaa maahinen ja tarjoaa: "Kaksi kasettia, yksi sielu".',
    choices: [
      {
        label: 'Ota diili, pyydä kuitit',
        outcomeSuccess: {
          text: 'Maahinen leimaa kuittisi. Rahaa löytyy lattianraoista.',
          effects: { money: 140, reputation: 3, sanity: -4 },
        },
        outcomeFail: {
          text: 'Kuitit palavat kädessä. Varjo nauraa.',
          effects: { sanity: -12, reputation: -4 },
        },
      },
      {
        label: 'Kieltäydy ja lähetä hänet metsänpeittoon',
        skillCheck: { stat: 'byroslavia', dc: 11 },
        outcomeSuccess: {
          text: 'Maahinen häipyy mutisten säädöksiä.',
          effects: { sanity: 6, reputation: 2 },
        },
        outcomeFail: {
          text: 'Hän kiroaa tilikirjan. Numerot pomppivat.',
          effects: { money: -50, sanity: -8 },
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
        cost: { money: 40 },
        outcomeSuccess: {
          text: 'Räntä pysyy ulkona. Saat kiitoksen palokunnalta.',
          effects: { reputation: 6, sanity: 3 },
        },
        outcomeFail: {
          text: 'Pressu repeää. Paperit liukuvat viemäriin.',
          effects: { money: -70, reputation: -6 },
        },
      },
      {
        label: 'Anna räntäsateen täyttää ämpärit',
        outcomeSuccess: {
          text: 'Keksit myydä räntäjuomia. Hullu idea toimii.',
          effects: { money: 130, reputation: 5, sanity: -3 },
        },
        outcomeFail: {
          text: 'Ämpärit homehtuvat. Kukaan ei osta.',
          effects: { money: -20, sanity: -6 },
        },
      },
    ],
  },
  {
    id: 'Verottajan Paper War',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation > 12,
    paperWar: true,
    media: { type: 'video', src: surrealVideo, alt: 'Krok-tarkastajan hologrammi' },
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
          effects: { reputation: 5, sanity: -2, money: 40 },
        },
        outcomeFail: {
          text: 'Sormi jää väliin ja muste imeytyy ihoon. Päätä jomottaa.',
          effects: { sanity: -10, money: -20 },
        },
      },
      {
        label: 'Kääri paperi ja tee siitä origami-lomake',
        outcomeSuccess: {
          text: 'Virkailija näkee taideteoksen ja antaa sinulle pienen avustuksen.',
          effects: { money: 60, reputation: 3, sanity: 2 },
        },
        outcomeFail: {
          text: 'Origami näyttää uhkauskirjeeltä. Saat huomautuksen.',
          effects: { reputation: -5, sanity: -4 },
        },
      },
    ],
  },
  {
    id: 'Lapin Posti',
    triggerPhase: 'day',
    condition: (stats) => stats.money >= -200,
    media: fallbackMedia,
    text: 'Postin setä tuo paketin, jonka päällä on poron kavion jälki. Hän tuijottaa merkkejä.',
    choices: [
      {
        label: 'Maksa tullimaksu heti',
        cost: { money: 50 },
        outcomeSuccess: {
          text: 'Paketissa on uusia kuitteja ja tarrat. Paperisota helpottuu.',
          effects: { reputation: 6, byroslavia: 2, sanity: 4 },
        },
        outcomeFail: {
          text: 'Posti hukkaa kuitin ja veloittaa uudestaan.',
          effects: { money: -80, sanity: -6 },
        },
      },
      {
        label: 'Kieltäydy ja viittaa asetukseen 1677/88',
        skillCheck: { stat: 'byroslavia', dc: 13 },
        outcomeSuccess: {
          text: 'Virkailija perääntyy ja mutisee. Saat paketin ilmaiseksi.',
          effects: { money: 90, reputation: 2 },
        },
        outcomeFail: {
          text: 'Setä suuttuu ja jättää paketin lumeen. Sisältö kastuu.',
          effects: { sanity: -8, reputation: -3 },
        },
      },
    ],
  },
  {
    id: 'Nokia Net Monitor',
    triggerPhase: 'day',
    condition: (stats) => stats.sanity > 30,
    media: fallbackMedia,
    text: 'Nokia piippaa koodia: 48B... 48C... Viesti näyttää runoilevan heksaa.',
    choices: [
      {
        label: 'Syötä Composerilla Säkkijärven Polkka',
        outcomeSuccess: {
          text: 'Taajuus rauhoittuu. Kuulit kaukaisen "kiitos"-kuiskauksen.',
          effects: { sanity: 10, reputation: 4 },
        },
        outcomeFail: {
          text: 'Polkka menee väärin. Kuulee vain staattista uhkaa.',
          effects: { sanity: -12, reputation: -2 },
        },
      },
      {
        label: 'Kuuntele koko sekvenssi',
        cost: { sanity: 6 },
        outcomeSuccess: {
          text: 'Salainen numero paljastuu: porofarmari tilaa VIP-bileet.',
          effects: { money: 130, reputation: 5 },
        },
        outcomeFail: {
          text: 'Numero olikin teleoperaattorin lasku.',
          effects: { money: -90, sanity: -4 },
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
        cost: { money: 100 },
        outcomeSuccess: {
          text: 'Kaseteista löytyy retro-mainoksia, jotka vetävät hipsterit puoleen.',
          effects: { reputation: 7, money: 140, sanity: -2 },
        },
        outcomeFail: {
          text: 'Kasetit homeessa. TV:stä tulee vain huminaa.',
          effects: { sanity: -10, money: -100 },
        },
      },
      {
        label: 'Vaihtokauppa: tarjoa salmiakkikossu',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Kauppias pehmenee. Saat kasetit ja vielä lisäjutun Lapin legendoista.',
          effects: { reputation: 5, sanity: 3 },
        },
        outcomeFail: {
          text: 'Hän loukkaantuu ja lähtee. Mainetta ropisee pois.',
          effects: { reputation: -7, sanity: -3 },
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
          effects: { reputation: 6, sanity: -3, money: 50 },
        },
        outcomeFail: {
          text: 'Virheellinen viittaus pykälään. Sinut huudetaan käytävällä.',
          effects: { reputation: -6, sanity: -8 },
        },
      },
      {
        label: 'Lainaa sivu verotoimiston seinältä',
        outcomeSuccess: {
          text: 'Sivu irtoaa helposti. Kukaan ei huomaa katoamista.',
          effects: { byroslavia: 2, sanity: 4 },
        },
        outcomeFail: {
          text: 'Alarma käynnistyy. Saat nuhteet.',
          effects: { reputation: -4, sanity: -5 },
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
          effects: { money: 160, reputation: 5, sanity: 1 },
        },
        outcomeFail: {
          text: 'Kauppias haukkuu hinnat ja levittää juorua.',
          effects: { money: -30, reputation: -6 },
        },
      },
      {
        label: 'Kieltäydy ja viittaa omaan brändiin',
        outcomeSuccess: {
          text: 'Itsenäisyys tuo karismaa. Paikalliset arvostavat.',
          effects: { reputation: 4, sanity: 3 },
        },
        outcomeFail: {
          text: 'Kioski aloittaa hintasodan. Kukaan ei voita.',
          effects: { money: -40, sanity: -5 },
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
          effects: { money: 120, reputation: 8, sanity: 2 },
        },
        outcomeFail: {
          text: 'Tilaisuus venyy. Hiljaisuussääntö rikkoo mielesi.',
          effects: { sanity: -9, money: 10 },
        },
      },
      {
        label: 'Kieltäydy kohteliaasti',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Hän ymmärtää ja suosittelee silti kirjoja sinulle.',
          effects: { sanity: 5, reputation: 3 },
        },
        outcomeFail: {
          text: 'Hän sulkee korttisi. Et saa lainata VHS:ää.',
          effects: { sanity: -4, reputation: -3 },
        },
      },
    ],
  },
  {
    id: 'Sattuuko vuokra',
    triggerPhase: 'day',
    condition: (stats) => stats.money < 200,
    media: fallbackMedia,
    text: 'Vuokranantaja kolkuttaa. Kirjekuoressa punainen merkintä.',
    choices: [
      {
        label: 'Maksa osa ja lupaa loput',
        cost: { money: 80 },
        outcomeSuccess: {
          text: 'Hän mutisee, mutta hyväksyy. Saat yön rauhan.',
          effects: { reputation: 2, sanity: 4 },
        },
        outcomeFail: {
          text: 'Hän ei usko sinua ja laittaa muistutuksen.',
          effects: { reputation: -5, sanity: -7 },
        },
      },
      {
        label: 'Tarjoa talkootyötä',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Pihatyöt sulattavat sydämen. Vuokra lykkääntyy.',
          effects: { sanity: 6, reputation: 4 },
        },
        outcomeFail: {
          text: 'Hän naureskelee ja korottaa vuokraa.',
          effects: { money: -60, reputation: -4, sanity: -3 },
        },
      },
    ],
  },
  {
    id: 'EU tarkastaja',
    triggerPhase: 'day',
    condition: (stats) => stats.reputation >= 50,
    media: fallbackMedia,
    text: 'Brysselistä saapuu kylmä katseinen tarkastaja. Hän haistelee ilmapiiriä.',
    choices: [
      {
        label: 'Näytä kaikki kuitit ja leimat',
        skillCheck: { stat: 'byroslavia', dc: 17 },
        outcomeSuccess: {
          text: 'Hän nyökkää tyytyväisenä ja jättää hyväksyntäleiman.',
          effects: { reputation: 10, money: 100, sanity: -4 },
        },
        outcomeFail: {
          text: 'Yksi leima puuttuu. Hän kirjoittaa raportin.',
          effects: { reputation: -12, sanity: -15, money: -80 },
        },
      },
      {
        label: 'Bluffaa että kaikki on pilot-projekti',
        skillCheck: { stat: 'pimppaus', dc: 18 },
        outcomeSuccess: {
          text: 'Hän vaikuttuu innovatiivisuudesta. Saat avustuksen.',
          effects: { money: 200, reputation: 6, sanity: 2 },
        },
        outcomeFail: {
          text: 'Hän ei naura. Dokumentit takavarikoidaan.',
          effects: { reputation: -15, sanity: -12, money: -120 },
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
        cost: { money: 70 },
        outcomeSuccess: {
          text: 'Poro poseeraa neonvalojen edessä. Somehype kasvaa.',
          effects: { reputation: 9, money: 140, sanity: 3 },
        },
        outcomeFail: {
          text: 'Poro karkaa Keskuskadulle ja poliisi soittaa.',
          effects: { reputation: -6, money: -60, sanity: -5 },
        },
      },
      {
        label: 'Torju kohteliaasti',
        skillCheck: { stat: 'pimppaus', dc: 10 },
        outcomeSuccess: {
          text: 'Hän ymmärtää ja lupaa alen ensi viikolla.',
          effects: { money: 40, sanity: 4 },
        },
        outcomeFail: {
          text: 'Hän loukkaantuu ja varoittaa muille yrittäjille.',
          effects: { reputation: -5, sanity: -4 },
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
        cost: { money: 15 },
        outcomeSuccess: {
          text: 'Saat tarkat kellonajat. Voit valmistautua.',
          effects: { reputation: 3, sanity: 2, byroslavia: 2 },
        },
        outcomeFail: {
          text: 'Pulla ei riitä. Hän myy tiedon kilpailijalle.',
          effects: { reputation: -4, sanity: -3 },
        },
      },
      {
        label: 'Ignoraa ja jatka kahvin keittoa',
        outcomeSuccess: {
          text: 'Rauha säilyy, mutta jää epävarmuus.',
          effects: { sanity: 5 },
        },
        outcomeFail: {
          text: 'Saat jälkeenpäin tietää että ratsia olisi vältetty.',
          effects: { reputation: -3, sanity: -6 },
        },
      },
    ],
  },
  {
    id: 'Yökelkkailijat',
    triggerPhase: 'night',
    media: { type: 'video', src: snowyStreet, alt: 'Lumessa jyrisevät kelkat' },
    text: 'Saksalaiset moottorikelkkailijat parkkeeraavat neonin alle ja huutavat "LÄMPIMÄÄ GLÖG!!"',
    choices: [
      {
        label: 'Myy erikoisdrinkki ja selfie-passit',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Glögi loppuu ja tippiä sataa. Kelkkailijat mainitsevat sinut foorumilla.',
          effects: { money: 200, reputation: 9, sanity: 1, sisu: -3 },
        },
        outcomeFail: {
          text: 'Yksi kaataa drinkin printeriin. Laitteet savuaa.',
          effects: { money: -70, sanity: -8, reputation: -5 },
        },
      },
      {
        label: 'Pidä ovella pääsyrajoitus',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Paperi ja järjestys kunniaan. He jonottavat kiltisti.',
          effects: { reputation: 5, sanity: 4 },
        },
        outcomeFail: {
          text: 'He hermostuvat ja lähtevät toiseen paikkaan.',
          effects: { money: -40, reputation: -4 },
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
          effects: { money: 150, reputation: 6, sanity: 2 },
        },
        outcomeFail: {
          text: 'Mikki oikosulussa. Hiljaisuus on kiusallinen.',
          effects: { money: -30, reputation: -5, sanity: -4 },
        },
      },
      {
        label: 'Piilota mikki ja vedä VHS-baariteema',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'Improvisointi toimii. He luulevat sen olevan konsepti.',
          effects: { reputation: 8, money: 90 },
        },
        outcomeFail: {
          text: 'He pettyvät ja lähtevät.',
          effects: { reputation: -6, money: -20, sanity: -2 },
        },
      },
    ],
  },
  {
    id: 'MafiaKeruu',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation < 20,
    media: fallbackMedia,
    text: 'Pimeä BMW pysähtyy. Velan perijä koputtaa tiskin kylkeen.',
    choices: [
      {
        label: 'Maksa osa rahana',
        cost: { money: 120 },
        outcomeSuccess: {
          text: 'Hän hyväksyy ja lähtee savuten.',
          effects: { sanity: 3, reputation: 2 },
        },
        outcomeFail: {
          text: 'Rahat ei riitä. Hän uhkaa paluulla.',
          effects: { money: -80, sanity: -12, reputation: -4 },
        },
      },
      {
        label: 'Bluffaa poliisiyhteyksillä',
        skillCheck: { stat: 'pimppaus', dc: 15 },
        outcomeSuccess: {
          text: 'Kerääjä hämmentyy ja vetäytyy.',
          effects: { reputation: 6, sanity: 5 },
        },
        outcomeFail: {
          text: 'Bluffi paljastuu. Saat varoituksen.',
          effects: { reputation: -7, sanity: -10 },
        },
      },
    ],
  },
  {
    id: 'PoliisiRatsia',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation > 40 || stats.money > 300,
    media: fallbackMedia,
    text: 'Siniset valot heijastuvat ikkunaan. Poliisi haluaa tarkistaa paperit.',
    choices: [
      {
        label: 'Anna kaikki luvat',
        skillCheck: { stat: 'byroslavia', dc: 15 },
        outcomeSuccess: {
          text: 'Paperit kunnossa. He poistuvat, ja maine nousee.',
          effects: { reputation: 7, sanity: 2 },
        },
        outcomeFail: {
          text: 'Lupa puuttuu. Saat sakon.',
          effects: { money: -100, reputation: -8, sanity: -6 },
        },
      },
      {
        label: 'Järjestä viivyttely kahvilla',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'He jäävät rupattelemaan ja unohtavat tarkistaa kaiken.',
          effects: { reputation: 4, sanity: 5 },
        },
        outcomeFail: {
          text: 'He hermostuvat ja tarkistavat kaksin verroin.',
          effects: { money: -60, reputation: -5, sanity: -5 },
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
          effects: { money: 170, reputation: 10, sanity: 2 },
        },
        outcomeFail: {
          text: 'Pilvi peittää taivaan. Kaikki oli turhaa.',
          effects: { money: -20, reputation: -4 },
        },
      },
      {
        label: 'Kerro että katto on EU-suojelussa',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Hän kunnioittaa kieltoa ja silti mainitsee mystisen paikan.',
          effects: { reputation: 5, sanity: 3 },
        },
        outcomeFail: {
          text: 'Hän suuttuu ja tekee haukkuvideon.',
          effects: { reputation: -8, sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'Keskiyön nettilinja',
    triggerPhase: 'night',
    condition: (stats) => stats.sanity < 60,
    media: fallbackMedia,
    text: 'Nokia vilkuttaa sanoja joita et muista ohjelmoineesi. Linja humisee.',
    choices: [
      {
        label: 'Kirjoita viesti takaisin',
        cost: { sanity: 5 },
        outcomeSuccess: {
          text: 'Saat numeerisen arpalipun. Se tuo yön jackpotin.',
          effects: { money: 140, sanity: -2 },
        },
        outcomeFail: {
          text: 'Vastaus laukaisee outoja ääniä. Valot vilkkuu.',
          effects: { sanity: -12, reputation: -2 },
        },
      },
      {
        label: 'Katkaise virta',
        outcomeSuccess: {
          text: 'Hiljaisuus palautuu. Lepäät hetken.',
          effects: { sanity: 8 },
        },
        outcomeFail: {
          text: 'Akku purkautuu ja tarvitset uuden.',
          effects: { money: -60, sanity: -3 },
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
        cost: { sanity: 6 },
        outcomeSuccess: {
          text: 'Löydät unohtuneita markkoja ja turistin kameran.',
          effects: { money: 110, reputation: 2 },
        },
        outcomeFail: {
          text: 'Kuulet kaiun menneistä asiakkaista. Mieli särähtää.',
          effects: { sanity: -14, reputation: -3 },
        },
      },
      {
        label: 'Sulje ovet ja siunaa',
        outcomeSuccess: {
          text: 'Bussi haihtuu sumuun. Sinusta tulee urbaani legenda.',
          effects: { reputation: 7, sanity: 4 },
        },
        outcomeFail: {
          text: 'Siunaus kajahtaa takaisin. Korvissa soi.',
          effects: { sanity: -8 },
        },
      },
    ],
  },
  {
    id: 'ReindeerMafia',
    triggerPhase: 'night',
    condition: (stats) => stats.money > 100,
    media: fallbackMedia,
    text: 'Porot ilmestyvät mustissa takeissa. Ne kolkuttavat sarvilla oveen.',
    choices: [
      {
        label: 'Ruoki heidät jalluporkkanoilla',
        cost: { money: 40 },
        outcomeSuccess: {
          text: 'Porot rauhoittuvat ja vartioivat ovea.',
          effects: { reputation: 6, sanity: 5, sisu: 3 },
        },
        outcomeFail: {
          text: 'Porkkanat olivat pilaantuneita. Ne pillastuvat.',
          effects: { sanity: -10, reputation: -5 },
        },
      },
      {
        label: 'Lukitse ovet ja laita faksi soimaan',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Byrokraattinen ääni karkottaa lauman.',
          effects: { sanity: 4, reputation: 3 },
        },
        outcomeFail: {
          text: 'Ne oppivat käyttämään nenäänsä ovenpainikkeena.',
          effects: { sanity: -9, money: -50 },
        },
      },
    ],
  },
  {
    id: 'GlitchyTaxSpirit',
    triggerPhase: 'night',
    condition: (stats) => stats.sanity < 35,
    media: { type: 'video', src: surrealVideo, alt: 'Glitchaava tarkastus' },
    text: 'Faksi kirjoittaa itseään: "RUN: FORM". Näet Krok-avarion varjon.',
    choices: [
      {
        label: 'Täytä lomake verellä',
        cost: { sanity: 8 },
        outcomeSuccess: {
          text: 'Varjo tyyntyy ja jättää kasan hyväksyntämerkkejä.',
          effects: { reputation: 9, money: 90, sanity: -4 },
        },
        outcomeFail: {
          text: 'Lomake palaa. Mielesi rasahtaa.',
          effects: { sanity: -16, reputation: -6 },
        },
      },
      {
        label: 'Soita säkkijärven polkka Nokiasta',
        skillCheck: { stat: 'pimppaus', dc: 13 },
        outcomeSuccess: {
          text: 'Sävel resonoi ja henki poistuu sähkölinjoja pitkin.',
          effects: { sanity: 12, reputation: 4 },
        },
        outcomeFail: {
          text: 'Nuotti menee pieleen. Glitch voimistuu.',
          effects: { sanity: -12, money: -30 },
        },
      },
    ],
  },
  {
    id: 'Yöllinen tullimies',
    triggerPhase: 'night',
    condition: (stats) => stats.money > 200,
    media: fallbackMedia,
    text: 'Tullimies kurkistaa takahuoneeseen ja kyselee laittomista VHS-lähetyksistä.',
    choices: [
      {
        label: 'Näytä varasto avoimesti',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Tullimies löytää vain verottajan pamfletteja. Saat kiitoksen.',
          effects: { reputation: 5, sanity: 4 },
        },
        outcomeFail: {
          text: 'Hän takavarikoi pari kasettia ja laskuttaa.',
          effects: { money: -90, reputation: -6 },
        },
      },
      {
        label: 'Tarjoa kahvi ja unohtumaton tarina',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Hän nauraa ja jättää raportin kirjoittamatta.',
          effects: { reputation: 6, sanity: 3 },
        },
        outcomeFail: {
          text: 'Hän epäilee lahjontaa. Kirjoittaa muistiinpanot.',
          effects: { reputation: -7, sanity: -5 },
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
          effects: { money: 130, reputation: 7, sanity: 3 },
        },
        outcomeFail: {
          text: 'Kartta on vanha ja vie väärään kylään.',
          effects: { reputation: -5, sanity: -6, money: -20 },
        },
      },
      {
        label: 'Kutsu taksi Nokiasta',
        cost: { money: 30 },
        outcomeSuccess: {
          text: 'Taksi saapuu heti. Turisti tekee sinusta legendan.',
          effects: { reputation: 8, sanity: 4 },
        },
        outcomeFail: {
          text: 'Taksi ei vastaa. Turisti pettyy.',
          effects: { reputation: -3, sanity: -4 },
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
          effects: { money: 160, reputation: 10, sanity: 3 },
        },
        outcomeFail: {
          text: 'Juoma kiehuu yli. Yleisö viheltää.',
          effects: { money: -50, reputation: -7, sanity: -6 },
        },
      },
      {
        label: 'Kieltäydy ja vetoa hygieniaohjeeseen',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Kilpailu perutaan. Maineesi pysyy mystisenä.',
          effects: { reputation: 4, sanity: 2 },
        },
        outcomeFail: {
          text: 'He pitävät sinua pelkurina.',
          effects: { reputation: -5, sanity: -3 },
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
          effects: { money: 120, reputation: 6, sanity: 2 },
        },
        outcomeFail: {
          text: 'Kustantaja peruu. Saat vain säälirahaa.',
          effects: { money: -20, sanity: -4 },
        },
      },
      {
        label: 'Pidä tarinat itselläsi',
        outcomeSuccess: {
          text: 'Salaperäisyys kasvattaa myyttiä.',
          effects: { reputation: 5, sanity: 3 },
        },
        outcomeFail: {
          text: 'Hän kirjoittaa sinusta negatiivisen hahmon.',
          effects: { reputation: -6, sanity: -5 },
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
          effects: { money: 140, reputation: 8, sanity: 1 },
        },
        outcomeFail: {
          text: 'Paljastuu humalaiseksi serkuksi. Tunnelma lässähtää.',
          effects: { reputation: -6, sanity: -4, money: -30 },
        },
      },
      {
        label: 'Testaa häntä virallisella pukki-kokeella',
        skillCheck: { stat: 'byroslavia', dc: 13 },
        outcomeSuccess: {
          text: 'Koe menee läpi. Saat sertifikaatin seinälle.',
          effects: { reputation: 7, sanity: 4 },
        },
        outcomeFail: {
          text: 'Hän hermostuu ja poistuu. Asiakkaat nauravat sinulle.',
          effects: { reputation: -4, sanity: -3 },
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
          effects: { money: 90, reputation: 5, sanity: 3 },
        },
        outcomeFail: {
          text: 'Kynttilä palaa loppuun. Joudut korjaamaan sulakkeet.',
          effects: { sanity: -8, money: -30 },
        },
      },
      {
        label: 'Pidä ovet auki ja myy myrskyshotteja',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Shotit lämmittävät. Myynti kasvaa.',
          effects: { money: 130, reputation: 4, sisu: -2 },
        },
        outcomeFail: {
          text: 'Asiakkaat liukastuvat. Joudut korvaamaan takin.',
          effects: { money: -70, reputation: -5 },
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
        cost: { money: 40 },
        outcomeSuccess: {
          text: 'Kone herää ja sylkee salaisen tarjouslomakkeen.',
          effects: { money: 100, reputation: 4, sanity: 1 },
        },
        outcomeFail: {
          text: 'Diesel vuotaa lattialle.',
          effects: { money: -60, sanity: -8 },
        },
      },
      {
        label: 'Korjaa sulake itse',
        skillCheck: { stat: 'byroslavia', dc: 12 },
        outcomeSuccess: {
          text: 'Pieni kipinä, mutta toimii. Saat hallinnan tunteen.',
          effects: { sanity: 7, reputation: 3 },
        },
        outcomeFail: {
          text: 'Saat tärskyn. Valot välkkyvät.',
          effects: { sanity: -10, reputation: -2 },
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
        cost: { sanity: 4 },
        outcomeSuccess: {
          text: 'Luvat joustavat. Saat lisäaukioloajan.',
          effects: { reputation: 6, money: 80, sanity: 2 },
        },
        outcomeFail: {
          text: 'Saunan hehku väsyttää. Et saa sovittua mitään.',
          effects: { sanity: -8, reputation: -3 },
        },
      },
      {
        label: 'Kieltäydy vetoamalla kiireeseen',
        outcomeSuccess: {
          text: 'Hän arvostaa rehellisyyttä ja lähettää sihteerin myöhemmin.',
          effects: { reputation: 3, sanity: 3 },
        },
        outcomeFail: {
          text: 'Pomo tulistuu. Lupien käsittely hidastuu.',
          effects: { reputation: -7, sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'Faxista kuuluu kuoro',
    triggerPhase: 'day',
    condition: (stats) => stats.sanity < 50,
    media: fallbackMedia,
    text: 'Faksi hyräilee virsien melodioita. Paperi liikkuu ilman sähköä.',
    choices: [
      {
        label: 'Nauhoita ja myy kasettina',
        outcomeSuccess: {
          text: 'Outo soundtrack myy kuin häkä.',
          effects: { money: 120, reputation: 5, sanity: -2 },
        },
        outcomeFail: {
          text: 'Ääni rikkoutuu. Korvasi soivat.',
          effects: { sanity: -12, reputation: -3 },
        },
      },
      {
        label: 'Siunaa laite ja sammuta',
        skillCheck: { stat: 'pimppaus', dc: 11 },
        outcomeSuccess: {
          text: 'Kuoro vaikenee. Saat mielenrauhan.',
          effects: { sanity: 10, reputation: 2 },
        },
        outcomeFail: {
          text: 'Laite hyräilee kovempaa.',
          effects: { sanity: -9, money: -20 },
        },
      },
    ],
  },
  {
    id: 'Sanity check Nokia',
    triggerPhase: 'day',
    condition: (stats) => stats.sanity <= 25,
    media: fallbackMedia,
    text: 'Nokia näyttää riimuja: "VÄÄRÄAINEISTO". Ruudun vihreä vilkkuu.',
    choices: [
      {
        label: 'Soita omaan numeroosi',
        cost: { sanity: 5 },
        outcomeSuccess: {
          text: 'Vastaat itse ja saat neuvoja tulevalle yölle.',
          effects: { byroslavia: 3, sanity: 6, reputation: 2 },
        },
        outcomeFail: {
          text: 'Vastaus on vain staattista kyynelettä.',
          effects: { sanity: -12 },
        },
      },
      {
        label: 'Sulje puhelin folioon',
        outcomeSuccess: {
          text: 'Signaali vaimenee. Saat hengähdyksen.',
          effects: { sanity: 8 },
        },
        outcomeFail: {
          text: 'Folio kipinöi. Saat pienen palovamman.',
          effects: { sanity: -6, reputation: -2 },
        },
      },
    ],
  },
  {
    id: 'Rahanvaihtajat',
    triggerPhase: 'day',
    condition: (stats) => stats.money > 150,
    media: fallbackMedia,
    text: 'Mustapörssin rahanvaihtajat ehdottavat markkojen vaihtoa kruunuihin.',
    choices: [
      {
        label: 'Hyödynnä kurssiero',
        outcomeSuccess: {
          text: 'Saat siivun voittoa ja uusia kontakteja.',
          effects: { money: 110, reputation: 4, sanity: 1 },
        },
        outcomeFail: {
          text: 'Kurssi romahtaa. Hävität kassaa.',
          effects: { money: -100, reputation: -5, sanity: -4 },
        },
      },
      {
        label: 'Ilmianna heidät puhelimella',
        skillCheck: { stat: 'byroslavia', dc: 11 },
        outcomeSuccess: {
          text: 'Poliisi kiittää. Saat palkkion.',
          effects: { money: 70, reputation: 6 },
        },
        outcomeFail: {
          text: 'He kuulevat ilmiannosta. Saat uhkakirjeen.',
          effects: { reputation: -7, sanity: -7 },
        },
      },
    ],
  },
  {
    id: 'NightBus takaisin',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation >= 30,
    media: fallbackMedia,
    text: 'Yöbussi tuo vanhat asiakkaat takaisin. He haluavat vakkari-etuja.',
    choices: [
      {
        label: 'Anna kanta-asiakasleima',
        outcomeSuccess: {
          text: 'He palaavat joka viikko. Tasainen kassavirta syntyy.',
          effects: { money: 120, reputation: 6, sanity: 3 },
        },
        outcomeFail: {
          text: 'Leimauslaite hajoaa. He hermostuvat.',
          effects: { reputation: -6, money: -30, sanity: -4 },
        },
      },
      {
        label: 'Pidä hinnat korkeina',
        skillCheck: { stat: 'pimppaus', dc: 14 },
        outcomeSuccess: {
          text: 'He maksavat premiumista ja kokevat itsensä VIPiksi.',
          effects: { money: 170, reputation: 4 },
        },
        outcomeFail: {
          text: 'He kokevat ryöstöksi ja kääntyvät pois.',
          effects: { reputation: -8, money: -20 },
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
          effects: { sisu: 8, sanity: 2 },
        },
        outcomeFail: {
          text: 'Kahvi on jäässä. Palellut sormet sattuvat.',
          effects: { sanity: -8, sisu: -6 },
        },
      },
      {
        label: 'Sulje aikaisin ja mene saunaan',
        cost: { money: -20 },
        outcomeSuccess: {
          text: 'Löyly palauttaa sisun.',
          effects: { sisu: 12, sanity: 6 },
        },
        outcomeFail: {
          text: 'Saunan kiuas rikkoontuu. Korjaus maksaa.',
          effects: { money: -60, sanity: -5 },
        },
      },
    ],
  },
  {
    id: 'Yöksi EU-vieras',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation > 55,
    media: fallbackMedia,
    text: 'EU-delegaation jäsen eksyy yöelämään ja istahtaa tiskille.',
    choices: [
      {
        label: 'Tarjoa tasting ja kerro Lapin tarina',
        skillCheck: { stat: 'pimppaus', dc: 16 },
        outcomeSuccess: {
          text: 'Hän hurmioituu ja lupaa tukirahaa.',
          effects: { money: 220, reputation: 10, sanity: 3 },
        },
        outcomeFail: {
          text: 'Tarina venyy ja hän kyllästyy.',
          effects: { reputation: -7, sanity: -5 },
        },
      },
      {
        label: 'Pysy hiljaa ja laskuta hillitysti',
        outcomeSuccess: {
          text: 'Hän arvostaa diskreettejä palveluja.',
          effects: { money: 140, reputation: 4 },
        },
        outcomeFail: {
          text: 'Hän luulee sinua välinpitämättömäksi.',
          effects: { reputation: -4, sanity: -3 },
        },
      },
    ],
  },
  {
    id: 'Verotarkastus Encore',
    triggerPhase: 'night',
    condition: (stats) => stats.reputation > 70 && stats.sanity > 40,
    media: { type: 'video', src: surrealVideo, alt: 'Toistuva verosilmä' },
    text: 'Hannele Krok palaa, mutta tällä kertaa hologrammina. Boss fight 2.0.',
    choices: [
      {
        label: 'Heiluta kaikkia lomakkeita rytmissä',
        skillCheck: { stat: 'byroslavia', dc: 19 },
        cost: { sanity: 10 },
        outcomeSuccess: {
          text: 'Hologrammi sulaa dataksi. Saat korvauksen liikaa maksetuista veroista.',
          effects: { money: 250, reputation: 12, sanity: -4 },
        },
        outcomeFail: {
          text: 'Data korruptoituu. Joudut maksamaan lisäselvityksestä.',
          effects: { money: -180, sanity: -18, reputation: -10 },
        },
      },
      {
        label: 'Tarjoa glitch-kahvi',
        skillCheck: { stat: 'pimppaus', dc: 17 },
        outcomeSuccess: {
          text: 'Krok juo pikselit ja poistuu tyytyväisenä.',
          effects: { reputation: 9, sanity: 6 },
        },
        outcomeFail: {
          text: 'Kahvi kaatuu serverille. Vaatimuslista pitenee.',
          effects: { sanity: -12, money: -90 },
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
