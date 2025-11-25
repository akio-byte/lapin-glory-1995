import { useMemo } from 'react'
import { buildPathMeta, type BuildPath, type GameEvent, type GameEventChoice } from '../data/gameData'
import type { Phase } from '../hooks/useGameLoop'
import { canonicalStats } from '../data/statMeta'
import CRTVisual from './CRTVisual'

const formatLabel = (key: string) => canonicalStats[key as keyof typeof canonicalStats]?.label ?? key.toUpperCase()

const formatValue = (key: string, value: number) => {
  const stat = canonicalStats[key as keyof typeof canonicalStats]
  if (stat) return stat.format(value)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}`
}

const summarizeEffects = (effects: Partial<Record<keyof GameEventChoice['outcomeSuccess']['effects'] | 'rahat' | 'jarki', number>>) => {
  const entries = Object.entries(effects).filter(([, value]) => value !== undefined && value !== 0)
  if (entries.length === 0) return 'Ei vaikutuksia'

  return entries
    .map(([key, value]) => {
      const numeric = value ?? 0
      const prefix = numeric > 0 ? '+' : ''
      const displayValue = canonicalStats[key as keyof typeof canonicalStats]
        ? formatValue(key, numeric)
        : `${prefix}${numeric}`
      return `${formatLabel(key)}: ${displayValue}`
    })
    .join(' | ')
}

const applyCosts = (effects: GameEventChoice['outcomeSuccess']['effects'], cost?: GameEventChoice['cost']) => {
  const merged: Partial<typeof effects & { rahat: number; jarki: number }> = { ...effects }
  if (cost?.rahat) merged.rahat = (merged.rahat ?? 0) - cost.rahat
  if (cost?.jarki) merged.jarki = (merged.jarki ?? 0) - cost.jarki
  return merged
}

const formatEffect = (choice: GameEventChoice) => {
  const success = summarizeEffects(applyCosts(choice.outcomeSuccess.effects, choice.cost))
  const failure = summarizeEffects(applyCosts(choice.outcomeFail.effects, choice.cost))

  if (success === failure) return success
  return `Onnistuu: ${success} | Epäonnistuu: ${failure}`
}

const renderPathXp = (pathXp?: GameEventChoice['pathXp']) => {
  if (!pathXp) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {(Object.keys(pathXp) as BuildPath[]).map((path) => {
        const xp = pathXp[path]
        if (!xp) return null
        const meta = buildPathMeta[path]
        return (
          <span
            key={path}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-white/5 border border-neon/30"
          >
            <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${meta.color}`} />
            {meta.label} +{xp} XP
          </span>
        )
      })}
    </div>
  )
}

type EventCardProps = {
  event: GameEvent
  locked: boolean
  outcome: string | null
  onChoice: (choice: GameEventChoice) => void
  onNextPhase: () => void
  fallbackMedia: NonNullable<GameEvent['media']>
  phase: Phase
  isGlitching?: boolean
}

const EventCard = ({ event, locked, outcome, onChoice, onNextPhase, fallbackMedia, phase, isGlitching }: EventCardProps) => {
  const media = useMemo(() => event.media ?? fallbackMedia, [event.media, fallbackMedia])

  return (
    <div className={`panel relative space-y-4 bg-asphalt/60 event-card ${isGlitching ? 'glitch-veil' : ''}`}>
      <div className="absolute inset-0 bg-repeat bg-[linear-gradient(90deg,rgba(255,0,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between border-b border-neon/30 pb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">{phase === 'DAY' ? 'Faksi' : 'Kohtaaminen'}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon/10 border border-neon/40">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              <h2 className="text-xl font-bold glitch-text" data-text={event.id}>
                {event.id}
              </h2>
            </div>
          </div>
          <div className="text-xs text-neon uppercase tracking-[0.2em]">{phase}</div>
        </div>

        <div className="rounded-lg overflow-hidden border border-neon/20 shadow-inner event-card__media">
          <CRTVisual media={media} isGlitching={isGlitching} />
        </div>
        <p className="text-sm leading-relaxed bg-coal/90 border border-neon/50 p-3 overflow-y-auto event-card__text">
          {event.text}
        </p>

        <div className="grid gap-3">
          {event.choices.map((choice) => (
            <button
              key={choice.label}
              className={`text-left border-2 border-neon px-4 py-3 uppercase tracking-[0.2em] bg-coal/60 hover:bg-neon/10 transition shadow-neon focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/80 focus-visible:ring-offset-2 focus-visible:ring-offset-coal/80 rounded-md leading-relaxed ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => onChoice(choice)}
              disabled={locked}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neon">{choice.label}</span>
                {choice.skillCheck && (
                  <span className="text-[11px] text-slate-200">
                    {choice.skillCheck.stat.toUpperCase()} DC {choice.skillCheck.dc}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 mt-1">{formatEffect(choice)}</p>
              {renderPathXp(choice.pathXp)}
            </button>
          ))}
        </div>

        {outcome && (
          <div className="border-2 border-dashed border-neon/70 bg-coal/80 p-4 shadow-inner text-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Lopputulos</p>
            <p className="mt-2">{outcome}</p>
            <div className="mt-3 text-right">
              <button
                className="button-raw bg-neon text-coal"
                onClick={onNextPhase}
              >
                Next Phase →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
