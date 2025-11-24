import type { Stats } from './gameData'

export type EndingType =
  | 'psychWard'
  | 'bankruptcy'
  | 'taxRaid'
  | 'vappu'
  | 'touristMogul'
  | 'taxLegend'
  | 'occultAscension'
  | 'networkProphet'
  | 'riftCollapse'

export type EndingEpilogue = {
  title: string
  description: (params: { stats: Stats; lai: number }) => string
  media?: { type: 'image' | 'video'; src: string; alt?: string }
  flavor?: string
}

export const endingEpilogues: Record<EndingType, EndingEpilogue> = {
  psychWard: {
    title: 'Game Over: Suljettu osasto',
    description: () => 'JÄRKI putosi nollaan. Neonvalot himmenivät ja OS/95 palautui tehdasasetuksiin.',
    media: { type: 'image', src: '/office_bg.png', alt: 'Tyhjä toimisto ja sammuvat monitorit' },
  },
  taxRaid: {
    title: 'Game Over: Veropetos-ratsia',
    description: () =>
      'MAINE ylitti 95. Verottajan valokuitu syöksyy sisään, faksit piipittävät ja ovet sinetöidään.',
    media: { type: 'image', src: '/fax_machine.png', alt: 'Faksikone sylkee punaisia varoituksia' },
  },
  bankruptcy: {
    title: 'Game Over: Voudin huutokauppa',
    description: () => 'RAHAT vajosi alle -1000 mk. Vouti vie neonkyltit ja kassalipas myydään pakkohuutokaupassa.',
    media: { type: 'video', src: '/Snowy_Finland_Street_VHS.mp4', alt: 'Hiljainen luminen katu' },
  },
  vappu: {
    title: 'Vappu – Laajennettu todellisuus',
    description: ({ stats }) =>
      stats.jarki > 60
        ? 'Vappu sumenee. Torin punssin seasta kuuluu maahisen nauru ja LAI kipinöi otsasuonissa.'
        : 'Vappu saapuu hiljaa. Olet pystyssä, mutta juhlinta jää sivummalle neonvalojen taakse.',
    media: { type: 'video', src: '/Surreal_Horror_Video_Generation.mp4', alt: 'Sumuinen VHS-välähdys' },
  },
  touristMogul: {
    title: 'Pohjolan turismikeisari',
    description: ({ stats }) =>
      `Rahaa ${stats.rahat.toFixed(0)} mk ja maine kiiltää. Bussit täyttyvät Lapin brändistäsi ja neon-mainokset syttyvät joka kortteliin.`,
    flavor: 'Byroslavia on myyty postikortteina – sinulla on VIP-passi suohon.',
    media: { type: 'image', src: '/office_bg.png', alt: 'Neonmainoksia täynnä oleva ikkuna' },
  },
  taxLegend: {
    title: 'Lomakejumala',
    description: ({ stats }) =>
      `Byroslavia ${stats.byroslavia.toFixed(0)} ja LAI pysyi kurissa. Verottaja kumartaa, koska lomakkeesi loitsivat uuden standardin.`,
    flavor: 'Arkistokaapit laulavat nimeäsi.',
    media: { type: 'image', src: '/fax_machine.png', alt: 'Lomakepino ja leima' },
  },
  occultAscension: {
    title: 'Staalo syö dataa',
    description: ({ lai }) =>
      `LAI ${lai.toFixed(0)} repi verhon auki. Okkultti polku avautuu ja neon-sielu sulaa verkkoon – olet enemmän aalto kuin ihminen.`,
    flavor: 'GSM-verkon kohina kutsuu sinua nimeltä.',
    media: { type: 'video', src: '/Surreal_Horror_Video_Generation.mp4', alt: 'Rätisevä VHS-glitch' },
  },
  networkProphet: {
    title: 'Verkkonäkijä',
    description: ({ stats, lai }) =>
      `LAI ${lai.toFixed(0)} ja byroslavia ${stats.byroslavia.toFixed(0)} käännettiin voitoksi. Sinusta tuli verkon oraakkeli ja Nokian antennit kumartavat.`,
    flavor: 'Jokainen ping on ennustus.',
    media: { type: 'image', src: '/office_bg.png', alt: 'Antenneja ja monitorien välke' },
  },
  riftCollapse: {
    title: 'Rift Collapse',
    description: ({ lai }) =>
      `LAI ${lai.toFixed(0)} karkasi käsistä. Staalo nielaisee OS/95:n ja ruudut mustuvat. Run päättyy repeämään.`,
    flavor: 'Todellisuus tallentui vain videon kohinaan.',
    media: { type: 'video', src: '/Snowy_Finland_Street_VHS.mp4', alt: 'Rift repeää lumisessa yössä' },
  },
}
