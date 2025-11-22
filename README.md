# Lapin Glory OS/95

Lapin Glory OS/95 on satiirinen management-horror, jossa pyörität rovaniemeläistä yökerhoa lama-ajan jälkeisessä 1995:ssa. Päivällä faksaat lomakkeita ja juokset byrokratiaa, yöllä pimppaat turisteja neonvalon välkkeessä, ja aamulla selviät vuokran ja mielenhapuilun kanssa. Statit, faksit ja VHS-glitchit tuuppivat sinua kohti joko Voudin huutokauppaa tai mystistä vapautta. Ruumis on kylmä, mutta Sisu palaa.

## Tech stack
- React 19 + TypeScript
- Vite + Tailwind CSS
- Component-driven UI (Nokia-tyylinen käyttöliittymä ja glitch-efektit)

## Code map
- **Game loop:** `src/hooks/useGameLoop.ts` hallitsee DAY → NIGHT → MORNING -silmukkaa, statit, inventaarion ja tapahtumavalinnat.
- **Stats & items:** `src/data/gameData.ts` määrittelee `Stats`-mallin, esineet ja fallback-medialinkit.
- **Events & narrative:** `src/data/gameData.ts` sisältää pelin `GameEvent`-pankin; `src/data/events.ts` säilyttää varhaisen event-prototyypin.
- **UI & flow:** `src/App.tsx` sitoo kaikki yhteen (StatBar, EventCard, NokiaPhone). Media-assetit löytyvät `src/assets/`-kansiosta.
- **Adding content:** Lisää uusia eventtejä ja valintoja `gameEvents`-taulukkoon, uusia esineitä `items`-taulukkoon ja uutta mediaa `src/assets/`-kansioon.

## How to run
1. `npm install`
2. `npm run dev`
3. Avaa selaimella kehityspalvelimen osoite (oletuksena http://localhost:5173).
