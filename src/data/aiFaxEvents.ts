// Auto-generated AI fax events. Run `npm run gen:fax` to add more.
import type { GameEvent } from './gameData'

export const aiFaxEvents: GameEvent[] = [
  {
    id: 'gsm-huurre-katko',
    triggerPhase: 'day',
    tier: 2,
    vibe: 'occult',
    tags: ['network', 'occult'],
    text: 'GSM-masto jäätyy ja lähettää vain outoa kohinaa. Faksi piirtää lumihuurteen läpi staattista karttaa.',
    choices: [
      {
        label: 'Sulattele hiustenkuivaajalla',
        cost: { rahat: 40 },
        outcomeSuccess: {
          text: 'Kohina väistyy ja löydät uudet taajuudet. Verkko kiittää.',
          effects: { maine: 4, byroslavia: 3, jarki: 2 },
        },
        outcomeFail: {
          text: 'Johto napsahtaa. Saat pienen iskun ja huhut lähtevät liikkeelle.',
          effects: { jarki: -6, maine: -3 },
        },
      },
      {
        label: 'Kuuntele kohinaa kuin oraakkelia',
        skillCheck: { stat: 'pimppaus', dc: 12 },
        outcomeSuccess: {
          text: 'Kohinasta irtoaa vihje tulevasta tarkastuksesta.',
          effects: { jarki: 4, maine: 2 },
        },
        outcomeFail: {
          text: 'Menet transsiin ja mokaat päivän raportit.',
          effects: { jarki: -8, rahat: -30 },
        },
      },
    ],
  },
  {
    id: 'turistien-neon-kiista',
    triggerPhase: 'night',
    tier: 1,
    tags: ['tourist'],
    text: 'Bussilastillinen turisteja vaatii neon-kylttejä palauttaakseen sisäänpääsymaksun. He kuvaavat kaiken.',
    choices: [
      {
        label: 'Maksuta lisäpalveluista',
        outcomeSuccess: {
          text: 'Neon-selfiet kääntyvät myynniksi.',
          effects: { rahat: 120, maine: 3, jarki: -2 },
        },
        outcomeFail: {
          text: 'He tinkivät ja valittavat TripFaksiin.',
          effects: { rahat: -50, maine: -4 },
        },
      },
      {
        label: 'Pyydä heitä täyttämään lomake',
        skillCheck: { stat: 'byroslavia', dc: 10 },
        outcomeSuccess: {
          text: 'Lomakeviidakko rauhoittaa tilanteen ja tuo lisäaikaa.',
          effects: { maine: 2, byroslavia: 2 },
        },
        outcomeFail: {
          text: 'He lähtevät ovet paukkuen ja vaativat hyvitystä.',
          effects: { rahat: -30, jarki: -4 },
        },
      },
    ],
  },
  {
    id: 'verkkotarkastus-ylilyonti',
    triggerPhase: 'day',
    tier: 3,
    tags: ['tax', 'network'],
    text: 'Verkkotarkastajat kytkevät koneesi eristystilaan. Jokainen paketti vaatii leiman.',
    choices: [
      {
        label: 'Ota esiin verolupakirja',
        skillCheck: { stat: 'byroslavia', dc: 14 },
        outcomeSuccess: {
          text: 'Leimat täsmäävät. Saat kiitoksen ja pieniä verohelpotuksia.',
          effects: { rahat: 140, maine: 4 },
        },
        outcomeFail: {
          text: 'Yksi leima puuttuu ja sakko napsahtaa.',
          effects: { rahat: -120, maine: -3 },
        },
      },
      {
        label: 'Voitele tarkastajat kahvilla',
        cost: { rahat: 35 },
        outcomeSuccess: {
          text: 'Kahvi pehmentää ja tarkastus nopeutuu.',
          effects: { maine: 3, jarki: 2 },
        },
        outcomeFail: {
          text: 'He kieltäytyvät lahjuksista, kahvi kaatuu papereille.',
          effects: { jarki: -6, maine: -2 },
        },
      },
    ],
  },
]
