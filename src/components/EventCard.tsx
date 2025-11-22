import { useMemo } from 'react'
import type { GameEvent, GameEventChoice } from '../data/gameData'
import type { Phase } from '../hooks/useGameLoop'
import { canonicalStats } from '../data/statMeta'
import CRTVisual from './CRTVisual'

const formatEffect = (choice: GameEventChoice) => {
  const deltas = choice.outcomeSuccess.effects
  const summary = (['money', 'sanity', 'reputation'] as const)
    .map((key) => {
      const value = deltas[key]
      if (value === undefined) return null
      const prefix = value > 0 ? '+' : ''
      const displayLabel = canonicalStats[key]?.label ?? key
      const formatted =
        key === 'money'
          ? `${prefix}${value.toFixed(0)} mk`
          : `${prefix}${value}`
      return `${displayLabel}: ${formatted}`
    })
    .filter(Boolean)

  return summary.join(' | ')
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
    <div className={`panel relative space-y-4 bg-asphalt/60 ${isGlitching ? 'glitch-veil' : ''}`}>
      <div className="absolute inset-0 bg-repeat bg-[linear-gradient(90deg,rgba(255,0,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">{phase === 'DAY' ? 'Faksi' : 'Kohtaaminen'}</p>
            <h2 className="text-2xl font-bold glitch-text" data-text={event.id}>
              {event.id}
            </h2>
          </div>
          <div className="text-xs text-neon uppercase tracking-[0.2em]">{phase}</div>
        </div>

        <CRTVisual media={media} isGlitching={isGlitching} />
        <p className="text-sm leading-relaxed bg-coal/70 border border-neon/40 p-3">
          {event.text}
        </p>

        <div className="grid gap-3">
          {event.choices.map((choice) => (
            <button
              key={choice.label}
              className={`text-left border-2 border-neon px-4 py-3 uppercase tracking-[0.2em] bg-coal/60 hover:bg-neon/10 transition shadow-neon ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
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
