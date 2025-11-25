# Lapin Glory OS/95 Audit Snapshot

This document summarizes the observed architecture, gameplay loop, UI wiring, data integrity, testing coverage, and DX/performance findings for the current build. It is a companion to the full auditor response.

## Architecture Overview
- Core game state is managed by `useGameLoop` (stats, phase machine, persistence, LAI, path XP, history). Views consume this via `GameShell`.
- `GameShell` orchestrates desktop chrome (Taskbar/Desktop/OSWindow), phase views, and auxiliary windows (Shop, Journal, Settings).
- Day/Night/Morning phases render mutually exclusive views that mount `EventCard`/`PaperWar` or the morning report.
- Content and tuning live in `src/data` (events, endings, media registry, stat metadata). Tests validate data integrity and ending selection.

## Key Risks Highlighted
- Morning reports use last known day history and are created inside a `useEffect`, which can double-render if React strict effects are re-run, potentially emitting duplicate morning reports or stale deltas.
- Phase advancement is time-of-check/time-of-use sensitive: `advancePhase` and the event-rolling effect both rely on refs; stale refs can briefly expose mismatched `phase`/`currentEvent` combinations if React batches updates unexpectedly.
- Persistence migration accepts any object with expected keys but does not validate nested value ranges, so corrupted saves with absurd numbers can survive and break balance.

## Testing Gaps
- No regression coverage for UI lock states (e.g., clicking choices multiple times, PaperWar resolution toggles).
- Simulations do not exercise the rent deduction/jarki tension that runs at the DAY rollover; edge-day (30) behavior is untested beyond ending selection.
- Rendering logic for overlapping windows (Shop/Log/Settings) and background overlays lacks snapshot or accessibility tests.
