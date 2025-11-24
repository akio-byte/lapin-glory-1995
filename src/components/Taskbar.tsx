import { BookOpen, Cog, ShoppingBag, Sparkles, Wallet } from 'lucide-react'
import { buildPathMeta, type BuildPath, type Stats } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import '../App.css'

const StatBadge = ({ label, value }: { label: string; value: string }) => (
  <span className="taskbar-chip">
    <Sparkles size={14} className="text-neon" />
    <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80 taskbar__label">{label}</span>
    <span className="font-semibold">{value}</span>
  </span>
)

const Taskbar = ({
  stats,
  dayCount,
  lai,
  pathProgress,
  onToggleShop,
  onToggleLog,
  onToggleSettings,
}: {
  stats: Stats
  dayCount: number
  lai: number
  pathProgress: Record<BuildPath, { xp: number; milestoneIndex: number }>
  onToggleShop: () => void
  onToggleLog: () => void
  onToggleSettings: () => void
}) => {
  const orderedPaths = (Object.keys(pathProgress) as BuildPath[]).sort(
    (a, b) => (pathProgress[b]?.xp ?? 0) - (pathProgress[a]?.xp ?? 0),
  )
  const focusPath = orderedPaths[0]
  const focusMeta = focusPath ? buildPathMeta[focusPath] : null
  const focusXp = focusPath ? pathProgress[focusPath]?.xp ?? 0 : 0
  const focusMilestones = focusPath ? buildPathMeta[focusPath].milestones : []
  const next = focusMilestones.find((_, idx) => idx >= (pathProgress[focusPath]?.milestoneIndex ?? 0))
  const ratio = next ? Math.min(1, focusXp / next) : 1

  return (
    <div className="taskbar">
      <div className="taskbar-actions">
        <button className="start-btn button-raw" onClick={onToggleSettings} aria-label="Avaa asetukset">
          <Sparkles size={16} />
          <span className="taskbar__label">START</span>
        </button>
        <button className="button-raw flex items-center gap-2" onClick={onToggleShop} aria-label="Avaa kauppa">
          <ShoppingBag size={16} />
          <span className="taskbar__label">Kauppa</span>
        </button>
        <button className="button-raw flex items-center gap-2" onClick={onToggleLog} aria-label="Avaa loki">
          <BookOpen size={16} />
          <span className="taskbar__label">Loki</span>
        </button>
      </div>

      <div className="taskbar__stats">
        <StatBadge label="Rahat" value={canonicalStats.rahat.format(stats.rahat)} />
        <StatBadge label="Järki" value={canonicalStats.jarki.format(stats.jarki)} />
        <StatBadge label="Maine" value={canonicalStats.maine.format(stats.maine)} />
        <span className="taskbar-chip">
          <Wallet size={14} className="text-neon" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80 taskbar__label">Päivä</span>
          <span className="font-semibold">{dayCount}</span>
        </span>
        <span className="taskbar-chip">
          <Sparkles size={14} className="text-neon" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80 taskbar__label">LAI</span>
          <span className="font-semibold">{lai.toFixed(0)}</span>
        </span>
        {focusMeta && (
          <span className="taskbar-chip min-w-[140px]">
            <Sparkles size={14} className="text-neon" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80 taskbar__label">{focusMeta.label}</span>
            <span className="font-semibold">{focusXp.toFixed(0)} XP</span>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${focusMeta.color}`}
                style={{ width: `${Math.min(100, ratio * 100)}%` }}
              />
            </div>
          </span>
        )}
      </div>

      <div className="taskbar__settings">
        <button className="button-raw flex items-center gap-2" onClick={onToggleSettings} aria-label="Asetukset">
          <Cog size={16} />
          <span className="taskbar__label">Asetukset</span>
        </button>
      </div>
    </div>
  )
}

export default Taskbar
