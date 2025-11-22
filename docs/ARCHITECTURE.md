# Architecture Overview

## Loop rhythm: DAY → NIGHT → MORNING
- `useGameLoop` (`src/hooks/useGameLoop.ts`) drives the state machine with `PHASE_ORDER` cycling DAY → NIGHT → MORNING.
- Each phase swap can pick a new `GameEvent` via `pickEventForPhase` based on `triggerPhase` (`day` or `night`) and optional stat-based conditions.
- Morning automatically applies rent (`handleChoice({ money: -50 })`) and increments `dayCount` before returning to DAY.
- Glitching/UI distortion toggles when sanity drops under 20, and game over triggers when sanity ≤ 0 or money < -1000.

## Stats model and modifiers
- Core stats live in `Stats` (`src/data/gameData.ts`): `money`, `reputation`, `sanity`, `sisu`, `pimppaus`, `byroslavia`.
- `handleChoice` clamps most stats between 0–100 (money is unbounded) and is the single entry point for applying effects.
- Event outcomes, item purchases, and rent all route through `handleChoice`, ensuring consistent bounds and failure checks.

## Data contracts
- `GameEvent` and `GameEventChoice` (see `src/data/gameData.ts`):
  - `GameEvent` holds the narrative text, optional media, `triggerPhase`, optional `condition`, and an array of choices.
  - Each `GameEventChoice` can define a `skillCheck` (`pimppaus` or `byroslavia` against a DC), optional `cost`, and distinct success/fail outcomes with stat effects.
  - `useGameLoop.resolveChoice` executes rolls, merges costs with outcome effects, and returns the outcome text/effects for the UI.
- `Item` (same file): defines shopable objects with prices, descriptions, optional stat requirements, and effect payloads (sanity/reputation/sisu/`byroslavia_bonus`).
- `fallbackEventMedia` provides a default asset when an event lacks its own media.

## Adding new events
1. Open `src/data/gameData.ts` and append a new object to `gameEvents`.
2. Set a unique `id`, `triggerPhase` (`day` or `night`), `text`, optional `media`, and optional `condition` that inspects `Stats`.
3. Provide at least one `choices` entry with `label`, optional `skillCheck` and `cost`, and both `outcomeSuccess` and `outcomeFail` effect blocks. Effects should be small deltas that `handleChoice` can clamp.
4. Keep narrative text in suomi/Finglish per GAME_BIBLE style; keep code/keys in English.

## Adding new items
1. Open `src/data/gameData.ts` and append to the `items` array.
2. Define `id`, `name`, `price`, `description`, `type`, and an `effects` object (e.g., sanity/reputation/sisu or `byroslavia_bonus`).
3. Add `req_stats` if the item needs minimum skills (e.g., `byroslavia`).
4. Reference new media in `src/assets/` as needed and keep descriptions in the established Finglish tone.
