import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Antenna, Brain, Coins, Sparkles } from 'lucide-react'
import type { Stats } from '../data/gameData'
import type { Phase } from '../hooks/useGameLoop'
import { canonicalStats } from '../data/statMeta'

const statDeltaStyles = `
@keyframes statFade {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-8px); }
}
`

// StatDelta renders a brief neon flash whenever a stat shifts.
const StatDelta = ({ delta }: { delta: number }) => (
  <span
    className={`text-xs font-semibold drop-shadow-sm transition-opacity duration-700 ease-out ${
      delta > 0 ? 'text-emerald-200' : 'text-rose-300'
    }`}
    style={{ animation: 'statFade 0.8s ease-out forwards' }}
  >
    {delta > 0 ? '+' : ''}
    {delta.toFixed(0)}
  </span>
)

const StatChip = ({
  label,
  value,
  icon,
  accent,
  subtitle,
  delta,
}: {
  label: string
  value: string
  icon: JSX.Element
  accent?: string
  subtitle?: string
  delta?: number
}) => (
  <div className={`flex items-center gap-3 bg-asphalt/80 border border-neon px-4 py-3 shadow-neon ${accent ?? ''}`}>
    <div className="p-2 bg-coal text-neon border border-neon/60 shadow-[0_0_12px_rgba(255,0,255,0.35)]">{icon}</div>
    <div className="leading-tight relative w-full">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neon/80">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-semibold">{value}</p>
        {typeof delta === 'number' && delta !== 0 && <StatDelta delta={delta} />}
      </div>
      {subtitle && <p className="text-[10px] text-slate-300 uppercase tracking-[0.18em]">{subtitle}</p>}
    </div>
  </div>
)

const getLaiMood = (lai: number) => {
  if (lai >= 80) return { label: 'LAI: staalo-häiriö', accent: 'text-rose-200' }
  if (lai >= 50) return { label: 'LAI: glitch-kanava', accent: 'text-amber-200' }
  if (lai >= 20) return { label: 'LAI: outo humina', accent: 'text-amber-200' }
  return { label: 'LAI: tyyni kenttä', accent: 'text-emerald-200' }
}

const StatsBar = ({
  stats,
  phase,
  dayCount,
  lai,
  labelOverrides,
}: {
  stats: Stats
  phase: Phase
  dayCount: number
  lai: number
  labelOverrides?: Partial<Record<'rahat' | 'maine' | 'jarki', string>>
}) => {
  const laiMood = getLaiMood(lai)
  const prevStatsRef = useRef(stats)
  const prevLaiRef = useRef(lai)
  const [deltas, setDeltas] = useState<Partial<Record<'rahat' | 'maine' | 'jarki' | 'lai', { value: number; key: string }>>>(
    {},
  )

  useEffect(() => {
    const prevStats = prevStatsRef.current
    const prevLai = prevLaiRef.current
    const changes: [keyof Stats | 'lai', number][] = []

    if (stats.rahat !== prevStats.rahat) changes.push(['rahat', stats.rahat - prevStats.rahat])
    if (stats.maine !== prevStats.maine) changes.push(['maine', stats.maine - prevStats.maine])
    if (stats.jarki !== prevStats.jarki) changes.push(['jarki', stats.jarki - prevStats.jarki])
    if (lai !== prevLai) changes.push(['lai', lai - prevLai])

    prevStatsRef.current = stats
    prevLaiRef.current = lai

    const timers: number[] = []

    changes.forEach(([key, delta]) => {
      if (delta === 0) return
      const marker = `${key}-${Date.now()}-${Math.random()}`
      setDeltas((prev) => ({ ...prev, [key]: { value: delta, key: marker } }))
      const timeout = window.setTimeout(() => {
        setDeltas((prev) => {
          const current = prev[key]
          if (!current || current.key !== marker) return prev
          const next = { ...prev }
          delete next[key]
          return next
        })
      }, 800)
      timers.push(timeout)
    })

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [lai, stats])

  const rahatLabel = labelOverrides?.rahat ?? canonicalStats.rahat.label
  const maineLabel = labelOverrides?.maine ?? canonicalStats.maine.label
  const jarkiLabel = labelOverrides?.jarki ?? canonicalStats.jarki.label

  return (
    <>
      <style>{statDeltaStyles}</style>
      <div className="grid md:grid-cols-4 gap-3 items-center">
        <div className="md:col-span-3 grid md:grid-cols-3 gap-3">
          <StatChip
            label={rahatLabel}
            value={canonicalStats.rahat.format(stats.rahat)}
            icon={<Coins size={20} />}
            delta={deltas.rahat?.value}
            subtitle="Vuokra -50 mk joka aamu"
          />
          <StatChip
            label={maineLabel}
            value={canonicalStats.maine.format(stats.maine)}
            icon={<Sparkles size={20} />}
            delta={deltas.maine?.value}
            subtitle="Yli 95 → Veropetos-ratsia"
          />
          <StatChip
            label={jarkiLabel}
            value={canonicalStats.jarki.format(stats.jarki)}
            icon={<Brain size={20} />}
            delta={deltas.jarki?.value}
            subtitle="0 → Suljettu osasto"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          <StatChip
            label={`Päivä ${dayCount}`}
            value={phase}
            icon={<Sparkles size={18} />}
            subtitle="Sykli: Päivä → Yö → Aamu"
          />
          <StatChip
            label={laiMood.label}
            value={`${lai.toFixed(0)} / 100`}
            icon={<Antenna size={18} />}
            delta={deltas.lai?.value}
            accent={laiMood.accent}
            subtitle="Lapin Anomalia Indeksi"
          />
        </div>
      </div>
    </>
  )
}

export default StatsBar
