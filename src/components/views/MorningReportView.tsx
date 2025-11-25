import { canonicalStats } from '../../data/statMeta'
import { MediaRegistry } from '../../data/mediaRegistry'
import type { Stats } from '../../data/gameData'
import type { DaySnapshot } from '../../hooks/useGameLoop'

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`

const MorningReportView = ({
  stats,
  dayCount,
  rahatDelta,
  jarkiDelta,
  laiDelta,
  note,
  history,
  onAdvance,
}: {
  stats: Stats
  dayCount: number
  rahatDelta: number
  jarkiDelta: number
  laiDelta: number
  note: string
  history: DaySnapshot[]
  onAdvance: () => void
}) => (
  <div
    className="glass-panel space-y-4 morning-report-panel"
    style={{
      backgroundImage: `linear-gradient(160deg, rgba(5, 8, 17, 0.92), rgba(5, 8, 17, 0.75)), url(${MediaRegistry.morningReportBg})`,
    }}
  >
    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-neon/70">
      <span>OS/95 Raportti</span>
      <span className="text-[11px]">Päivä {dayCount} →</span>
    </div>
    <h2 className="text-2xl font-bold glitch-text" data-text="Aamuraportti">
      Aamuraportti
    </h2>
    <p className="text-sm leading-relaxed text-slate-200">
      Yö vaihtuu siniseen hetkeen. Lomakkeet kuivuvat, kassalipas jäätyy. Pidä mieli kasassa ennen seuraavaa faksia.
    </p>
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.rahat.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.rahat.format(stats.rahat)}</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(rahatDelta)} mk</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.jarki.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.jarki.format(stats.jarki)}</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(jarkiDelta)}</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.maine.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.maine.format(stats.maine)}</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Sisu</p>
        <p className="text-lg font-semibold">{stats.sisu} / 100</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-black/40 border border-neon/30 rounded text-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-neon/70 uppercase tracking-[0.2em]">
          <span>Raha / LAI trendi</span>
          <span>Päivät -3 → -1</span>
        </div>
        <div className="space-y-1">
          {[...history]
            .filter((entry) => entry.day < dayCount)
            .slice(-3)
            .map((entry) => {
              const prev = history.find((h) => h.day === entry.day - 1)
              const profit = prev ? entry.rahat - prev.rahat : 0
              const deltaLai = prev ? entry.lai - prev.lai : 0
              return (
                <div key={entry.day} className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-200">D{entry.day}</span>
                  <span className="text-emerald-200">{formatDelta(profit)} mk</span>
                  <span className="text-sky-200">LAI {formatDelta(deltaLai)}</span>
                </div>
              )
            })}
          {history.filter((entry) => entry.day < dayCount).length === 0 && (
            <p className="text-slate-300">Ei vielä aiempia päiviä.</p>
          )}
        </div>
      </div>
      <div className="p-3 bg-black/40 border border-neon/30 rounded text-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-neon/70 uppercase tracking-[0.2em]">
          <span>LAI muutos</span>
          <span>Tämän aamun lukema</span>
        </div>
        <p className="text-slate-100">LAI {formatDelta(laiDelta)} → {stats.jarki < 30 ? 'Ole varovainen' : 'Hallinnassa'}</p>
        <p className="text-xs text-slate-300">Raportti huomioi eilisillan päätöksen ja tämän aamun tilan.</p>
      </div>
    </div>
    <div className="p-3 bg-black/40 border border-neon/30 text-sm rounded italic text-slate-100">{note}</div>
    <div className="text-right">
      <button className="button-raw" onClick={onAdvance}>
        Hyväksy raportti →
      </button>
    </div>
  </div>
)

export default MorningReportView
