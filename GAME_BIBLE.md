# GAME BIBLE: PIMPPISIMULAATTORI - LAPIN GLORY (TECHNICAL SPECIFICATION)

## 1. YDINIDENTITEETTI & ESTETIIKKA
**Genre:** Satirical Management RPG / Psychological Horror
**Setting:** Rovaniemi, Finland (Winter 1995). Post-depression, pre-EU integration chaos.
**Visual Style:** "Lama-Noir" meets "Vaporwave".
* **Keywords:** VHS-Gothic, Dithering, CRT Scanlines, Brutalism, Neon Pink (#FF00FF) vs. Pitch Black (#0f1118).
* **UI Philosophy:** The interface mimics a possessed Nokia 2110 screen or a crumpled tax form. It must feel "hostile" but usable.

## 2. PELILOGIIKKA & MATEMATIIKKA (GAME LOOP)

### 2.1. Core Stats (Global State)
Pelin tilaa ohjaavat seuraavat globaalit muuttujat. AI-koodin on seurattava näitä tarkasti.

| Stat | Tyyppi | Alkuarvo | Rajat | Vaikutus (Logic Hooks) |
| :--- | :--- | :--- | :--- | :--- |
| **Markat (Money)** | Float | 0 mk | -inf ... inf | **< -1000:** Game Over (Voudin Huutokauppa). Käytetään ostoksiin ja lahjontaan. |
| **Maine (Reputation)** | Int | 10 | 0-100 | **< 10:** Mafia/Rikolliset hyökkäävät. **> 90:** Verottaja/Poliisi kiinnostuu (Raid Chance). |
| **Mielenterveys (Sanity)**| Int | 100 | 0-100 | **< 20:** UI glitchaa (tekstit muuttuvat, värit vääristyvät). **= 0:** Game Over (Suljettu Osasto). |
| **Sisu** | Int | 50 | 0-100 | "Health/Stamina". Kuluu kylmässä ja byrokratiassa. Palautuu viinalla/saunalla. |
| **Byroslavia** | Int | 10 | 0-100 | "Intellect". Taito käsitellä lomakkeita ja virkamiehiä. Avaa "Bluff" -dialogit. |
| **Pimppaus** | Int | 10 | 0-100 | "Charisma". Taito puhua "Finglishiä" ja hurmata turisteja. |

### 2.2. Vuorokausisykli (The Loop)
Peli etenee vaiheissa. State Machine: `Phase = 'DAY' | 'NIGHT' | 'MORNING'`

1.  **DAY (Preparation):**
    * **Toiminnot:** Lue Faksi (Event), Osta varusteita (Shop), Soita puheluita (Nokia).
    * **Passiivinen:** Vuokra kuluu (-50mk/päivä).
2.  **NIGHT (Action):**
    * **Toiminnot:** Baari aukeaa. Satunnaiset asiakaskohtaamiset (Procedural Events).
    * **Mekaniikka:** "Risk Roll". Jos `Maine` on korkea, `TaxInspector` saattaa ilmestyä (Boss Fight).
3.  **MORNING (Report):**
    * Yhteenveto yön tuloista ja mielenterveysmuutoksista.
    * Päivämäärä etenee. (Tavoite: Selviä 30 päivää Vappuun asti).

## 3. TIETOKANTA-RAKENTEET (DATA SCHEMAS)

AI:n tulee käyttää näitä TypeScript-rajapintoja datan käsittelyyn.

### 3.1. Items (Esineet & Lomakkeet)
```typescript
type ItemType = 'consumable' | 'tool' | 'form' | 'relic';

interface Item {
  id: string;
  name: string;
  price: number;
  description: string; // Käytä Finglishiä tai Virkamieskieltä
  type: ItemType;
  effects: {
    sanity?: number; // Esim. +10 (Jaloviina)
    reputation?: number;
    byroslavia_bonus?: number; // Esim. +20 (Lomake 6B)
  };
  req_stats?: { byroslavia?: number }; // Vaatimus käytölle
}
3.2. Events (Tapahtumat)
TypeScript

interface GameEvent {
  id: string;
  triggerPhase: 'day' | 'night';
  condition?: (stats: Stats) => boolean; // Esim. (s) => s.reputation > 50
  media?: {
    type: 'image' | 'video';
    src: string; // Viittaus /assets/ kansioon
    alt: string;
  };
  text: string; // Narratiivinen kuvaus
  choices: {
    label: string;
    skillCheck?: { stat: 'pimppaus' | 'byroslavia', dc: number }; // Dice Class (Vaikeusaste)
    cost?: { money?: number, sanity?: number };
    outcomeSuccess: { text: string, effects: Partial<Stats> };
    outcomeFail: { text: string, effects: Partial<Stats> };
  }[];
}
4. ERITYISMEKANIIKAT (SPECIFIC FEATURES)
4.1. GSM-Shamanismi (Nokia 2110)
Net Monitor: Puhelimessa on salainen tila (aktivoituu koodilla tai napilla).

Logiikka: Näyttää "Henkimaailman säteilyn" (Hex-koodia).

Jos Sanity > 50: Näyttää normaaleja lukuja (esim. CellID: 48B).

Jos Sanity < 20: Näyttää riimuja tai viestejä (esim. RUN: DIE).

Soittoäänet: "Composer" -tilassa voi soittaa melodian (esim. Säkkijärven Polkka) karkottaakseen Maahisia.

4.2. Byrokratia-taistelu (Paper War)
Ei perinteistä HP-taistelua.

Vihollinen: Hannele Krok (Tarkastaja).

Mekaniikka: Kivi-Paperi-Sakset -logiikka, mutta lomakkeilla.

Hyökkäys: "Puuttuva kuitti!" -> Puolustus: "Lomake 5057e".

Väärä lomake = Sanity vaurio ("Lisäselvityspyyntö").

4.3. Sensorinen Dissonanssi (Atmosphere Engine)
Glitch-efekti: Kun pelaaja ottaa vahinkoa (Sanity/Money), ruudun on "täristävä" (CSS translate) ja värien on invertoiduttava hetkeksi (filter: invert(1)).

Audio: Taustalla on oltava matala humina (Drone). Kun Sanity laskee, huminaan sekoittuu faksilaitteen rätinää.

5. TEKSTITYYLI (TONE OF VOICE)
AI:n generoiman tekstin on noudatettava näitä sääntöjä:

Finglish: "Tää on ihan state-of-the-art, mä digaan." (Nuoret/Jupit).

Virkamieskieli: "Viitaten asetukseen 1677/88, kurkkunne kaarevuus ylittää sallitun toleranssin." (Viranomaiset).

Peräpohjola: "Ei auta itku markkinoilla. Se on jämpti." (Jorma/Paikalliset).

Absurdius: Yhdistä byrokratia ja magia. "Täytä tämä kaavake verellä."

OHJE CODEXILLE: Kun koodaat, viittaa aina tähän tiedostoon varmistaaksesi, että logiikka (esim. Sanity-rajat) ja tyyli (värit, tekstit) ovat johdonmukaisia.
