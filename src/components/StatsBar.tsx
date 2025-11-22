import type { JSX } from 'react'
import { Antenna, Brain, Coins, Sparkles } from 'lucide-react'
import type { Stats } from '../data/gameData'
import type { Phase } from '../hooks/useGameLoop'
import { canonicalStats } from '../data/statMeta'

const StatChip = ({
  label,
  value,
  icon,
  accent,
  subtitle,
}: {
  label: string
  value: string
  icon: JSX.Element
  accent?: string
  subtitle?: string
}) => (
  <div className={`flex items-center gap-3 bg-asphalt/80 border border-neon px-4 py-3 shadow-neon ${accent ?? ''}`}>
    <div className="p-2 bg-coal text-neon border border-neon/60 shadow-[0_0_12px_rgba(255,0,255,0.35)]">{icon}</div>
    <div className="leading-tight">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neon/80">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {subtitle && <p className="text-[10px] text-slate-300 uppercase tracking-[0.18em]">{subtitle}</p>}
    </div>
  </div>
)

const getLaiMood = (lai: number) => {
  if (lai > 60) return { label: 'LAI: staalo-häiriö', accent: 'text-rose-200' }
  if (lai > 20) return { label: 'LAI: outo humina', accent: 'text-amber-200' }
  return { label: 'LAI: tyyni kenttä', accent: 'text-emerald-200' }
}

const StatsBar = ({ stats, phase, dayCount, lai }: { stats: Stats; phase: Phase; dayCount: number; lai: number }) => {
  const laiMood = getLaiMood(lai)

  return (
  <div className="grid md:grid-cols-4 gap-3 items-center">
    <div className="md:col-span-3 grid md:grid-cols-3 gap-3">
      <StatChip
        label={canonicalStats.money.label}
        subtitle={canonicalStats.money.short}
        value={canonicalStats.money.format(stats.money)}
        icon={<Coins />}
      />
      <StatChip
        label={canonicalStats.sanity.label}
        subtitle={canonicalStats.sanity.short}
        value={canonicalStats.sanity.format(stats.sanity)}
        icon={<Brain />}
      />
      <StatChip
        label={canonicalStats.reputation.label}
        subtitle={canonicalStats.reputation.short}
        value={canonicalStats.reputation.format(stats.reputation)}
        icon={<Sparkles />}
      />
    </div>
    <div className="text-right text-xs uppercase tracking-[0.2em] bg-coal border border-neon text-neon px-4 py-3 shadow-neon">
      <p>Phase: {phase}</p>
      <p>Päivä: {dayCount}</p>
      <p className={`flex items-center justify-end gap-1 ${laiMood.accent}`}>
        <Antenna size={14} /> {laiMood.label} ({lai})
      </p>
    </div>
  </div>
  )
}

export default StatsBar
