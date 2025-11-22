import type { JSX } from 'react'
import { Brain, Coins, Sparkles } from 'lucide-react'
import type { Stats } from '../data/gameData'
import type { Phase } from '../hooks/useGameLoop'

const StatChip = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: JSX.Element
  accent?: string
}) => (
  <div className={`flex items-center gap-3 bg-asphalt/80 border border-neon px-4 py-3 shadow-neon ${accent ?? ''}`}>
    <div className="p-2 bg-coal text-neon border border-neon/60 shadow-[0_0_12px_rgba(255,0,255,0.35)]">{icon}</div>
    <div className="leading-tight">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neon/80">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
)

const StatsBar = ({ stats, phase, dayCount }: { stats: Stats; phase: Phase; dayCount: number }) => (
  <div className="grid md:grid-cols-4 gap-3 items-center">
    <div className="md:col-span-3 grid md:grid-cols-3 gap-3">
      <StatChip label="Markat" value={`${stats.money.toFixed(0)} mk`} icon={<Coins />} />
      <StatChip label="Mielenterveys" value={`${stats.sanity} / 100`} icon={<Brain />} />
      <StatChip label="Maine" value={`${stats.reputation} / 100`} icon={<Sparkles />} />
    </div>
    <div className="text-right text-xs uppercase tracking-[0.2em] bg-coal border border-neon text-neon px-4 py-3 shadow-neon">
      <p>Phase: {phase}</p>
      <p>Päivä: {dayCount}</p>
    </div>
  </div>
)

export default StatsBar
