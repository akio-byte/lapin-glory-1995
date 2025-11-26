# Lapin Glory 1995 – purku ja uusi pohja

## Pelin perusidea ja looppi
- Peli kiertää vaiheita **DAY → NIGHT → MORNING**. Päivä- ja yövuoroissa arvotaan tapahtuma (event) ja pelaaja tekee valinnan; aamulla raportoidaan edellisen kierroksen taloudet/LAI ja siirrytään seuraavaan päivään. Vuokran maksu ja mahdollinen järki-drifti tapahtuvat päivän vaihtuessa, ja jaksot jatkuvat enintään 30 päivään asti.【F:src/hooks/useGameLoop.ts†L658-L724】【F:src/hooks/useGameLoop.ts†L387-L425】
- **LAI (Lapin Anomalian Indeksi)** on 0–100 mittari, joka reagoi pingiin ja sanityyn; korkea LAI lisää okkulttien eventtien todennäköisyyttä ja voi tiputtaa järkeä, matala LAI rauhoittaa. Visuaalinen glitch laukeaa, kun LAI > 70 tai JÄRKI < 20.【F:src/hooks/useGameLoop.ts†L354-L385】【F:src/hooks/useGameLoop.ts†L600-L707】

## Resurssit ja niiden muutokset
- Päästatsit: **rahat**, **maine**, **jarki**, **sisu**, **pimppaus**, **byroslavia**. Rahat ovat rajattomat, muut clampataan 0–100:een. Statsit kulkevat eventeissä, esineissä ja aamuraporteissa.【F:src/data/gameData.ts†L35-L142】【F:src/hooks/useGameLoop.ts†L654-L739】
- Päivän alku (DAY) vähentää vuokran (kasvaa viikoittain) ja voi säätää JÄRKEÄ LAI:n ääripäissä; LAI:n taso vaikuttaa myös järki-driftiin päivän vaihteessa.【F:src/data/gameData.ts†L123-L135】【F:src/hooks/useGameLoop.ts†L694-L709】
- **Path XP** neljään rakentamispolkuun (tourist/tax/occult/network) kertyy valinnoista; tasot antavat pieniä stat-bonuksia ja vaikuttavat loppuratkaisuun.【F:src/data/gameData.ts†L4-L30】【F:src/hooks/useGameLoop.ts†L608-L649】【F:src/hooks/useGameLoop.ts†L387-L425】

## Eventit ja valinnat
- Tapahtumadata on kovakoodattu TypeScript-taulukoksi `coreGameEvents` + generoitu `aiFaxEvents`; jokaisessa on `triggerPhase` (day/night), teksti, valinnat ja mahdolliset tagit/skill checkit/kustannukset. Valinnoissa käytetään statteihin sidottuja heittoja ja kustannuksia, ja ne voivat antaa Path XP:tä.【F:src/data/gameData.ts†L65-L111】【F:src/hooks/useGameLoop.ts†L469-L520】【F:src/data/aiFaxEvents.ts†L1-L71】
- Eventtien arpominen käyttää `pickEventForPhase`, joka suodattaa päivän mukaan, tierin (päiväluku) ja ehtofunktiot. LAI kallistaa valintaa okkulttien tai arkisten eventtien pooliin, joten resurssit ja tunnelma reagoivat indeksiin.【F:src/hooks/useGameLoop.ts†L354-L385】
- **PaperWar**-lippu pakottaa eventin lomake-minipeliin; muuten EventCard näyttää valinnat. UI on pääosin dataohjattu, mutta ehto- ja mediakentät ovat silti koodissa, eivät erillisessä JSON:ssa.【F:src/components/views/PhaseWindow.tsx†L24-L93】

## Endingit
- Loppuskenaariot laukeavat tarkistusfunktiossa, joka katsoo JÄRKI ≤ 0, rahat < -1000, MAINE > 95 tai 30 päivän jälkeen polkujen tason ja LAI:n yhdistelmän. Turisti/tax/occult/network -polkujen korkein taso valitsee lopun, ja korkea LAI voi aiheuttaa rift-luokan game overin.【F:src/hooks/useGameLoop.ts†L387-L425】
- Varsinaiset epilogit ovat datassa, joka määrittää otsikon, kuvauksen ja valinnaisen median jokaiselle ending-tyypille.【F:src/data/endingData.ts†L1-L62】

## Tärkeimmät bugit ja rakenteelliset ongelmat
- Aamuraportti syntyy `useEffect`-kutsussa ja tukeutuu päivä-historiaan; Reactin Strict Mode voi ajaa efektin kahdesti ja synnyttää tuplaraportin tai väärän delta-laskelman.【F:docs/audit-notes.md†L11-L13】
- Vaiheenvaihto ja eventin arpominen käyttävät ref-arvoja; jos React batchaa tilapäivityksiä eri tavalla, voi hetkellisesti renderöityä väärä `phase`/`currentEvent` yhdistelmä tai lukkiutunut UI.【F:docs/audit-notes.md†L12-L13】
- Tallennemigraatio hyväksyy muodollisesti oikeat avaimet muttei validoi arvojen järkevyyttä; rikkinäinen save voi rikkoa tasapainon ilman varoitusta.【F:docs/audit-notes.md†L13-L14】
- Eventtien data ja logiikka elävät samassa jättitiedostossa; ehto-funktiot estävät helpon sisällön editoinnin tai lokalisaation, ja skill check -tasot ovat hajautettuina, mikä vaikeuttaa säätöä.【F:src/data/gameData.ts†L65-L111】【F:src/hooks/useGameLoop.ts†L469-L520】
- UI on raskas monipaneelinen desktop-jäljitelmä (Taskbar/OSWindow), joka ei skaalaudu pieniin näyttöihin ilman kollapsointia; EventCardin/paperisodan lukitukset eivät ole testatuilla regressiotesteillä.【F:src/components/views/PhaseWindow.tsx†L24-L93】【F:docs/audit-notes.md†L16-L19】

## Toimivat ratkaisut (reuse)
- **Päivä–yö–aamu -rytmi ja vuokra + LAI -jännite** toimii selkeänä resource loopina: kassa hupenee vuokrasta, LAI ruokkii tapahtumapoolin sävyä. Uudessa projektissa kannattaa mallintaa tämä `useGameEngine`-hookilla, jossa on selkeä state machine ja erillinen `laiSystem` util, jotta UI pysyy ohuena.【F:src/hooks/useGameLoop.ts†L354-L425】【F:src/hooks/useGameLoop.ts†L658-L724】
- **Path XP + milestone -palkinnot** tuovat metapolun ja pienet stat-boostit. Tämä voi siirtyä lähes sellaisenaan datavetoisena konfigina (taulukko polkujen tasoista ja palkinnoista) ja generoituna UI-chipinä (vrt. nykyinen PathProgressChips).【F:src/hooks/useGameLoop.ts†L608-L649】
- **Event choice -mekaniikka (skill check + cost + success/fail tekstit)** on hyvä muotti: valinnat määritellään datassa ja resoluutio-funktio palauttaa lopputuloksen. Uudessa koodissa kannattaa erottaa `resolveChoice` puhtaaksi palveluksi ja pitää eventti-JSON erillään mediasta; UI lukee vain palautetun outcome-olion.【F:src/hooks/useGameLoop.ts†L469-L520】
- **Media/teema-registry** yhdestä paikasta (MediaRegistry) helpottaa placeholderien vaihtoa. Uudessa projektissa voi säilyttää registry-mallin, mutta ladata mediat lazy-tyyppisesti tai CDN:ltä.【F:src/components/views/DayPhaseView.tsx†L1-L15】

## Rakennettava uusiksi
- **GameLoop-monoliitti**: kaikki logiikka (persistenssi, LAI, event-poolit, itemit) on yhdessä hookissa, mikä vaikeuttaa testejä ja debuggausta. Ratkaisu: erottele `useGameEngine` (tilakone + tallennus), `eventService` (event pool + filtteri), `laiService`, ja `inventoryService` omiksi moduleiksi + unit-testit.【F:src/hooks/useGameLoop.ts†L354-L739】
- **Data + logiikka sekaisin**: eventit määritellään TS-koodissa ja sisältävät funktioita (`condition`), mikä estää no-code -sisällön. Ratkaisu: määritä puhdas dataskaala (JSON/Firestore) ja aja ehdot DSL/flag-tyyppisesti (esim. min/max statit), jolloin sisältötiimi voi editoida ilman buildia.【F:src/data/gameData.ts†L65-L111】
- **UI-responsiivisuus ja saavutettavuus**: desktop-metafora ei skaalannu mobiiliin; ikkunat pinoutuvat eikä fokusjärjestys ole selvä. Ratkaisu: suunnittele modulaarinen layout (paneeli + modaalit), käytä CSS grid/flex -breakpointteja ja lisää keyboard-fokus + ruudunlukija-tekstit EventCardiin/PaperWariin.【F:src/components/views/PhaseWindow.tsx†L24-L93】
- **Tallennusten validointi**: migraatio hyväksyy arvot sokkona. Ratkaisu: schema-validointi (zod/io-ts) ja raja-arvojen korjaus ennen persistointia; virhetiloissa reset tai safe mode.【F:docs/audit-notes.md†L11-L14】
- **Testikattavuuden puute**: valintojen lukitukset, PaperWar ja 30. päivän käyttäytyminen ovat vailla regressiotestejä. Ratkaisu: kirjoita yksikkötestit valintojen idempotenssille ja integraatiotesti simuloidulle 30 päivän runille, joka varmistaa ending-valinnan ja vuokran kertymän.【F:docs/audit-notes.md†L16-L19】

## Seuraavat sprintit (uusi peli)
1. **Bootstrap & engine**: Luo Vite + React + TS -projekti, rakenna ohut `useGameEngine` (phase machine, persistenssi, LAI) ja perus UI-paneeli ilman retro-desktopia.
2. **Event/ending datamalli**: Viimeistele JSON/TS-tyypit eventeille ja endingeille, irrota ehdot DSL/flag-formaatiksi, ja tuo 3–5 vanhaa eventtiä proof-of-conceptina.
3. **UI/UX modernisointi**: Toteuta responsiivinen, tumma Lapland AI Lab -teema (grid-paneelit, mobiiliystävällinen action-bar, animaatiot varoen). Lisätään saavutettavuus (fokusjärjestys, ARIA-labelit).
4. **Sisältömigraatio & balanssi**: Porttaa keskeiset eventit/items/path-palkkiot uuteen dataformaattiin, säädä DC:t/palkinnot testisimulaatioilla.
5. **(Valinnainen) Telemetria-backend**: Kytke Firebase/Cloudflare Worker, joka loggaa run-historian (dayCount, ending, polku) ja mahdollistaa tulevan analytiikan sekä leaderboardsin.
