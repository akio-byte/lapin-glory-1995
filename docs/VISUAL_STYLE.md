# Lapin Glory OS/95 – Visual Style Guide

## 1. Tone & Keywords

- Tone: **Finno-Ugri Cyberpunk 1995**, Lapland office horror.
- Keywords:
  - cold neon, CRT glow, static noise
  - late-night municipal office, paper war, fax storms
  - Lapland winter darkness, sodium street lights, teal aurora accents

## 2. Color Palette

### Core

- `bg-coal` = `#050811` (almost black, cold)
- `bg-slate` = `#111827`
- `fg-ice` = `#E5F3FF`
- `fg-muted` = `#9CA3AF`
- `accent-teal` = `#16F2D3`
- `accent-aurora` = `#60A5FA` (blue) → gradients with teal

### Semantic

- Success / “good bureaucracy”: `#22C55E`
- Danger / “paper-burnout”: `#EF4444`
- Warning / “LAI anomaly”: `#EAB308`

All UI elements should use these tokens instead of random colors.

## 3. Surfaces & Glass

- Glass panels:
  - background: `bg-coal/85` (or rgba(5,8,17,0.85))
  - subtle border: 1px solid rgba(255,255,255,0.08)
  - inner shadow / glow with teal aurora at the edges
- Use light noise / scanline textures when mahdollista (CSS only).

## 4. Typography

- Base font: system UI stack (e.g. `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`).
- Sizes:
  - Desktop title: 20–24px, semibold
  - Window title bars: 14–16px, uppercase or spaced
  - Body text: 13–14px, normal
- Feel: slightly cramped “DOS-meets-Windows 95” mutta modernilla anti-aliased renderöinnillä.

## 5. Layout Principles

- Desktop:
  - Uses a single main `OSWindow` in the center, max width ~1100px, max height ~700px on desktop.
  - Other widgets (Nokia, debug, LAI monitor) **never overlap** main window on ≥1024px width.
- Taskbar:
  - Anchored to bottom, full width.
- Nokia phone:
  - Fixed bottom-right on desktop (`z-index: 50`), small overlap only with desktop edge.

## 6. Motion & Feedback

- Jarki damage:
  - whole `<Desktop>` shakes horizontally for 150–250ms, easing in-out, 1–2 times.
- Hover states:
  - Buttons get brighter border + teal underline.
- Critical events (LAI rift, eviction, etc.):
  - short aurora flash around window border.

## 7. Mini-Games (“Paper War”)

- Win:
  - Large “WIN” or equivalent text, green, slightly overshooting scale animation.
- Loss:
  - Large “LOSS”, red, small shake downward.
- Draw:
  - Neutral grey/teal, no heavy motion.

## 8. Implementation Notes

- Use Tailwind where possible (e.g. bg-slate-950, text-slate-100) but prefer custom classes for signature elements:
  - `.glass-panel`
  - `.desktop-root`
  - `.nokia-shell`
  - `.os-window`
- Keep visual constants in one place (e.g. CSS variables or Tailwind theme extension) so future AI passes can change style centrally.
