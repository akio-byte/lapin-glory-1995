import OSWindow from '../OSWindow'
import PaperWar, { type PaperWarResolution } from '../PaperWar'
import EventCard from '../EventCard'
import { MediaRegistry } from '../../data/mediaRegistry'
import { canonicalStats } from '../../data/statMeta'
import type { GameEvent, GameEventChoice, Item, Stats } from '../../data/gameData'

export type PhaseViewProps = {
  dayCount: number
  lai: number
  stats: Stats
  corruptedLabels: { rahat: string; maine: string; jarki: string }
  activeEvent: GameEvent | null
  isPaperWar: boolean
  inventory: Item[]
  locked: boolean
  outcome: string | null
  fallbackMedia: NonNullable<GameEvent['media']>
  isGlitching: boolean
  onPaperWarResolve: (result: PaperWarResolution) => void
  onEventChoice: (choice: GameEventChoice) => void
  onAdvancePhase: () => void
}

const PhaseWindow = ({
  phase,
  dayCount,
  lai,
  stats,
  corruptedLabels,
  activeEvent,
  isPaperWar,
  inventory,
  locked,
  outcome,
  fallbackMedia,
  isGlitching,
  onPaperWarResolve,
  onEventChoice,
  onAdvancePhase,
}: PhaseViewProps & { phase: 'DAY' | 'NIGHT' }) => {
  const phaseTitle = phase === 'DAY' ? 'PÄIVÄVUORO' : 'YÖVUORO'
  const quietTitle = phase === 'DAY' ? 'Hiljainen linja' : 'Staalo nukkuu'
  const quietBody =
    phase === 'DAY'
      ? 'Ei lomakkeita juuri nyt. Juot kahvin, katsot ulos ja kuuntelet neonin sirinää.'
      : 'Yövuoro nielee valot. Tietokone humisee, eikä yhtään faksia luisu pöydälle.'
  const phaseSubtitle =
    phase === 'DAY'
      ? 'Valon ja neonin saumassa byrokratia höyryää. Päivävuoron lämpö on vain kuviteltu.'
      : 'Staalo ja valokuitu ujeltavat lumen alla. Yövuoro on kylmä kuin faxin valo.'
  const phaseMedia = phase === 'DAY' ? MediaRegistry.dayViewBg : MediaRegistry.nightViewBg

  return (
    <OSWindow title={`FAKSI / TAPAHTUMA — ${phaseTitle}`} isActive size="lg">
      <div className="space-y-4">
        <div
          className="phase-banner"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(5, 9, 18, 0.92), rgba(5, 9, 18, 0.55)), url(${phaseMedia})`,
          }}
          role="presentation"
        >
          <div className="phase-banner__content">
            <p className="phase-banner__title glitch-text" data-text={phaseTitle}>
              {phaseTitle}
            </p>
            <p className="phase-banner__subtitle">{phaseSubtitle}</p>
          </div>
          <div className="phase-banner__chips">
            <span className="phase-chip">D{dayCount.toString().padStart(2, '0')}</span>
            <span className="phase-chip">{phase === 'DAY' ? '⚡ Neon shift' : '🌙 Kylmä linja'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] uppercase tracking-[0.2em]">
          <div className="glass-chip px-3 py-2">
            <p className="text-neon/80">Päivä</p>
            <p className="text-lg font-semibold">{dayCount}</p>
          </div>
          <div className="glass-chip px-3 py-2">
            <p className="text-neon/80">LAI</p>
            <p className="text-lg font-semibold">{lai.toFixed(0)}</p>
          </div>
          <div className="glass-chip px-3 py-2">
            <p className="text-neon/80">{corruptedLabels.rahat}</p>
            <p className="text-lg font-semibold">{canonicalStats.rahat.format(stats.rahat)}</p>
          </div>
          <div className="glass-chip px-3 py-2">
            <p className="text-neon/80">{corruptedLabels.jarki}</p>
            <p className="text-lg font-semibold">{canonicalStats.jarki.format(stats.jarki)}</p>
          </div>
        </div>

        {activeEvent ? (
          isPaperWar ? (
            <PaperWar
              event={activeEvent}
              stats={stats}
              inventory={inventory}
              locked={locked}
              outcome={outcome}
              fallbackMedia={fallbackMedia}
              onResolve={onPaperWarResolve}
              onNextPhase={onAdvancePhase}
              isGlitching={isGlitching}
            />
          ) : (
            <EventCard
              event={activeEvent}
              locked={locked}
              outcome={outcome}
              onChoice={onEventChoice}
              onNextPhase={onAdvancePhase}
              fallbackMedia={fallbackMedia}
              phase={phase}
              isGlitching={isGlitching}
            />
          )
        ) : (
          <div className="glass-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-neon">{quietTitle}</p>
            <p className="text-sm text-slate-200 mt-2">{quietBody}</p>
            <button className="button-raw mt-3" onClick={onAdvancePhase}>
              Pakota seuraava vaihe →
            </button>
          </div>
        )}
      </div>
    </OSWindow>
  )
}

export const DayPhaseView = (props: PhaseViewProps) => (
  <div
    className="phase-view-root day-view-root"
    style={{
      backgroundImage: `linear-gradient(160deg, rgba(5, 9, 18, 0.86), rgba(5, 9, 18, 0.78)), url(${MediaRegistry.dayViewBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className="phase-view-overlay">
      <PhaseWindow phase="DAY" {...props} />
    </div>
  </div>
)

export const NightPhaseView = (props: PhaseViewProps) => (
  <div
    className="phase-view-root night-view-root"
    style={{
      backgroundImage: `linear-gradient(180deg, rgba(5, 8, 17, 0.9), rgba(5, 8, 17, 0.82)), url(${MediaRegistry.nightViewBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className="phase-view-overlay">
      <PhaseWindow phase="NIGHT" {...props} />
    </div>
  </div>
)

export default PhaseWindow
