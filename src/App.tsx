import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import EventCard from './components/EventCard'
import NokiaPhone from './components/NokiaPhone'
import PaperWar, { type PaperWarResolution } from './components/PaperWar'
import Shop from './components/Shop'
import StatsBar from './components/StatsBar'
import type { Stats } from './data/gameData'
import type { EndingType } from './hooks/useGameLoop'
import { useGameLoop } from './hooks/useGameLoop'
import { useAudio } from './hooks/useAudio'

const shakeStyles = `
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
`

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`

const MorningReport = ({
  stats,
  dayCount,
  moneyDelta,
  sanityDelta,
  note,
  onAdvance,
}: {
  stats: Stats
  dayCount: number
  moneyDelta: number
  sanityDelta: number
  note: string
  onAdvance: () => void
}) => (
  <div className="panel space-y-4 bg-asphalt/70 border border-neon/40">
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
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Markat</p>
        <p className="text-lg font-semibold">{stats.money.toFixed(0)} mk</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(moneyDelta)} mk</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Mielenterveys</p>
        <p className="text-lg font-semibold">{stats.sanity} / 100</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(sanityDelta)}</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Maine</p>
        <p className="text-lg font-semibold">{stats.reputation} / 100</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Sisu</p>
        <p className="text-lg font-semibold">{stats.sisu} / 100</p>
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

const endingCopy: Record<EndingType, { title: string; description: (params: { stats: Stats }) => string }> = {
  psychWard: {
    title: 'Suljettu osasto',
    description: () => 'Mielenterveys romahti. Neonvalot himmenivät ja OS/95 palautui tehdasasetuksiin.',
  },
  bankruptcy: {
    title: 'Voudin Huutokauppa',
    description: () => 'Markat katosivat kuin revontulet. Faksi laulaa ulosmittaus-iskelmiä.',
  },
  vappu: {
    title: 'Vappu vapauttaa',
    description: ({ stats }) =>
      stats.sanity > 60 && stats.reputation > 40
        ? 'Selvisit 30 päivää. Torilla soi humina ja velhot nostavat sinut juhlapöytään.'
        : 'Vappu saapuu sumuisena. Olet yhä pystyssä, mutta hörpit simaa yksin neonvalossa.',
  },
}

const RunOverScreen = ({
  ending,
  onRestart,
}: {
  ending: { type: EndingType; stats: Stats; dayCount: number }
  onRestart: () => void
}) => {
  const copy = endingCopy[ending.type]

  return (
    <div className="min-h-screen bg-[#0f1118] text-white flex items-center justify-center px-6 py-10">
      <div className="panel max-w-xl w-full space-y-4 bg-coal/80 border-2 border-neon/50">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70 text-center">Run over</p>
        <h2 className="text-3xl font-bold glitch-text text-center" data-text={copy.title}>
          {copy.title}
        </h2>
        <p className="text-sm text-slate-200 text-center">{copy.description({ stats: ending.stats })}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Päiviä selvittiin</p>
            <p className="text-lg font-semibold">{ending.dayCount}</p>
          </div>
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Markat</p>
            <p className="text-lg font-semibold">{ending.stats.money.toFixed(0)} mk</p>
          </div>
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Mielenterveys</p>
            <p className="text-lg font-semibold">{ending.stats.sanity} / 100</p>
          </div>
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Maine</p>
            <p className="text-lg font-semibold">{ending.stats.reputation} / 100</p>
          </div>
        </div>
        <div className="text-center pt-2">
          <button className="button-raw" onClick={onRestart}>
            Aloita uusi run →
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const {
    stats,
    phase,
    inventory,
    dayCount,
    ending,
    isGlitching,
    currentEvent,
    fallbackMedia,
    handleChoice: applyChoiceEffects,
    advancePhase,
    resolveChoice,
    buyItem,
    useItem,
    morningReport,
    resetGame,
  } = useGameLoop()

  const { muted, toggleMute, backgroundPlaying, toggleBackground, playSfx } = useAudio()

  const [outcome, setOutcome] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [journal, setJournal] = useState<string[]>([])
  const [textSpeed, setTextSpeed] = useState(3)
  const bossIntroRef = useRef<string | null>(null)

  useEffect(() => {
    setOutcome(null)
    setLocked(false)
  }, [phase])

  const activeEvent = useMemo(() => currentEvent, [currentEvent])
  const isPaperWar = activeEvent?.paperWar

  const rootStyle = useMemo(() => ({ '--glitch-duration': `${textSpeed}s` } as CSSProperties), [textSpeed])

  useEffect(() => {
    if (activeEvent && (activeEvent.paperWar || activeEvent.id.toLowerCase().includes('verottaja'))) {
      if (bossIntroRef.current !== activeEvent.id) {
        playSfx('boss')
        bossIntroRef.current = activeEvent.id
      }
    }

    if (!activeEvent) {
      bossIntroRef.current = null
    }
  }, [activeEvent, playSfx])

  const handleRestart = () => {
    setJournal([])
    setOutcome(null)
    setLocked(false)
    resetGame()
  }

  if (ending) {
    return <RunOverScreen ending={ending} onRestart={handleRestart} />
  }

  const handleEventChoice = (choice: Parameters<typeof resolveChoice>[0]) => {
    if (locked || !activeEvent) return
    playSfx('choice')
    const result = resolveChoice(choice)
    setOutcome(result.outcomeText)
    setLocked(true)
    setJournal((prev) => [`${phase}: ${choice.label} -> ${result.outcomeText}`, ...prev].slice(0, 6))
  }

  const handlePaperWarResolve = (result: PaperWarResolution) => {
    if (locked || !activeEvent) return
    playSfx('choice')
    applyChoiceEffects(result.appliedEffects)
    setOutcome(result.summary)
    setLocked(true)
    setJournal((prev) => [`${phase}: ${activeEvent.id} -> ${result.summary}`, ...prev].slice(0, 6))
  }

  const wrapperGlitchClass = isGlitching ? 'glitch-wrapper invert' : ''

  const report =
    morningReport ?? ({ moneyDelta: 0, sanityDelta: 0, note: 'Raportti latautuu...', day: dayCount } as const)

  return (
    <div
      className={`min-h-screen bg-[#0f1118] text-white relative overflow-hidden ${wrapperGlitchClass} ${isGlitching ? 'glitch-veil' : ''}`}
      style={rootStyle}
    >
      <style>{shakeStyles}</style>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,140,222,0.12),transparent_35%)]" />

      <NokiaPhone sanity={stats.sanity} onPing={() => playSfx('nokia')} />

      <main className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.35em] text-neon">Pimppisimulaattori: Lapin Glory</p>
          <h1 className="text-4xl font-bold glitch-text" data-text="Lapin Glory OS/95">
            Lapin Glory OS/95
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Lama-Noir managerointi: faksaa päivällä, pimppaa yöllä, toivo aamulla. Neon pinkki vastaan harmaa byrokratia.
          </p>
        </header>

        <StatsBar stats={stats} phase={phase} dayCount={dayCount} />

        <section className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
            {phase !== 'MORNING' && activeEvent && (
              isPaperWar ? (
                <PaperWar
                  event={activeEvent}
                  stats={stats}
                  locked={locked}
                  outcome={outcome}
                  fallbackMedia={fallbackMedia}
                  onResolve={handlePaperWarResolve}
                  onNextPhase={advancePhase}
                  isGlitching={isGlitching}
                />
              ) : (
                <EventCard
                  event={activeEvent}
                  locked={locked}
                  outcome={outcome}
                  onChoice={handleEventChoice}
                  onNextPhase={advancePhase}
                  fallbackMedia={fallbackMedia}
                  phase={phase}
                  isGlitching={isGlitching}
                />
              )
            )}

            {phase !== 'MORNING' && !activeEvent && (
              <div className="panel bg-coal/70">
                <p className="text-xs uppercase tracking-[0.3em] text-neon">Hiljainen linja</p>
                <p className="text-sm text-slate-200 mt-2">Ei tapahtumia juuri nyt. Avaa ovi ja kuuntele huminaa.</p>
                <button className="button-raw mt-3" onClick={advancePhase}>
                  Pakota seuraava vaihe →
                </button>
              </div>
            )}

            {phase === 'MORNING' && (
              <MorningReport
                stats={stats}
                dayCount={report.day}
                moneyDelta={report.moneyDelta}
                sanityDelta={report.sanityDelta}
                note={report.note}
                onAdvance={advancePhase}
              />
            )}
          </div>

          <aside className="space-y-4">
            <Shop phase={phase} inventory={inventory} stats={stats} onBuy={buyItem} onUse={useItem} />

            <div className="panel bg-coal/80 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-neon">Asetukset</p>
              <div className="flex items-center justify-between text-sm">
                <span>{muted ? 'Äänet: mykistetty' : 'Äänet: päällä'}</span>
                <button className="button-raw px-3 py-1" onClick={toggleMute}>
                  {muted ? 'Poista mykistys' : 'Mykistä'}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Humina-loop</span>
                <button
                  className={`button-raw px-3 py-1 ${muted ? 'opacity-40 cursor-not-allowed' : ''}`}
                  onClick={toggleBackground}
                  disabled={muted}
                >
                  {backgroundPlaying ? 'Tauko' : 'Soita hiljaa'}
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <label className="flex items-center justify-between gap-3" htmlFor="textSpeed">
                  <span>Tekstin glitch-tahti</span>
                  <span className="text-xs text-neon">{textSpeed.toFixed(1)}s</span>
                </label>
                <input
                  id="textSpeed"
                  type="range"
                  min={1.2}
                  max={4}
                  step={0.2}
                  value={textSpeed}
                  onChange={(event) => setTextSpeed(parseFloat(event.target.value))}
                  className="w-full accent-neon"
                />
                <p className="text-xs text-slate-300">Hidasta jos silmät väsyy, nopeuta jos faksi palaa.</p>
              </div>
            </div>

            <div className="panel bg-asphalt/70">
              <p className="text-xs uppercase tracking-[0.3em] text-neon">Lokikone</p>
              <ul className="mt-3 space-y-2 text-sm max-h-72 overflow-y-auto pr-2">
                {journal.length === 0 && <li className="text-slate-400">Ei merkintöjä vielä.</li>}
                {journal.map((entry, idx) => (
                  <li key={idx} className="border-l-2 border-neon pl-2">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel text-sm text-slate-200 bg-coal/70">
              <p className="text-xs uppercase tracking-[0.3em] text-neon">Ohje</p>
              <p className="mt-2">
                Päivä: Leimaa faksit ja uhraa markkoja. Yö: kohtaa bussit tai tarkastajat. Aamu: maksa vuokra (-50 mk) ja jatka,
                jos mielenterveys sallii.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
