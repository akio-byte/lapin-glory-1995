import { BookOpen, Cog, ShoppingBag, Sparkles, Wallet } from 'lucide-react'
import type { Stats } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import '../App.css'

const StatBadge = ({ label, value }: { label: string; value: string }) => (
  <span className="taskbar-chip">
    <Sparkles size={14} className="text-neon" />
    <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80">{label}</span>
    <span className="font-semibold">{value}</span>
  </span>
)

const Taskbar = ({
  stats,
  dayCount,
  lai,
  onToggleShop,
  onToggleLog,
  onToggleSettings,
}: {
  stats: Stats
  dayCount: number
  lai: number
  onToggleShop: () => void
  onToggleLog: () => void
  onToggleSettings: () => void
}) => {
  return (
    <div className="taskbar">
      <div className="taskbar-actions">
        <button className="start-btn button-raw" onClick={onToggleSettings}>
          START
        </button>
        <button className="button-raw flex items-center gap-2" onClick={onToggleShop}>
          <ShoppingBag size={16} />
          Kauppa
        </button>
        <button className="button-raw flex items-center gap-2" onClick={onToggleLog}>
          <BookOpen size={16} />
          Loki
        </button>
      </div>

      <div className="taskbar__stats">
        <StatBadge label="Rahat" value={canonicalStats.rahat.format(stats.rahat)} />
        <StatBadge label="Järki" value={canonicalStats.jarki.format(stats.jarki)} />
        <StatBadge label="Maine" value={canonicalStats.maine.format(stats.maine)} />
        <span className="taskbar-chip">
          <Wallet size={14} className="text-neon" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80">Päivä</span>
          <span className="font-semibold">{dayCount}</span>
        </span>
        <span className="taskbar-chip">
          <Sparkles size={14} className="text-neon" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-neon/80">LAI</span>
          <span className="font-semibold">{lai.toFixed(0)}</span>
        </span>
      </div>

      <div className="taskbar__settings">
        <button className="button-raw flex items-center gap-2" onClick={onToggleSettings}>
          <Cog size={16} />
          Asetukset
        </button>
      </div>
    </div>
  )
}

export default Taskbar
