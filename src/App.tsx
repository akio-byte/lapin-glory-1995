import { useEffect, useMemo, useState } from 'react'
import './App.css'
import EventCard from './components/EventCard'
import NokiaPhone from './components/NokiaPhone'
import StatsBar from './components/StatsBar'
import type { Stats } from './data/gameData'
import { useGameLoop } from './hooks/useGameLoop'

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

const MorningReport = ({ stats, dayCount, onAdvance }: { stats: Stats; dayCount: number; onAdvance: () => void }) => (
  <div className="panel space-y-3 bg-asphalt/70">
    <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">Aamuraportti</p>
    <h2 className="text-2xl font-bold glitch-text" data-text="Raportti">
      Raportti
    </h2>
    <p className="text-sm leading-relaxed text-slate-200">
      Yö vaihtuu siniseen hetkeen. Lomakkeet kuivuvat, kassalipas jäätyy. Pidä mieli kasassa ennen seuraavaa faksia.
    </p>
    <ul className="text-sm text-slate-100 space-y-1 border border-neon/30 p-3 bg-coal/60">
      <li>Markat: {stats.money.toFixed(0)} mk</li>
      <li>Maine: {stats.reputation} / 100</li>
      <li>Mielenterveys: {stats.sanity} / 100</li>
      <li>Sisu: {stats.sisu} / 100</li>
      <li>Päivä: {dayCount}</li>
    </ul>
    <div className="text-right">
      <button className="button-raw" onClick={onAdvance}>
        Seuraava vaihe →
      </button>
    </div>
  </div>
)

function App() {
  const { stats, phase, dayCount, isGameOver, isGlitching, currentEvent, fallbackMedia, advancePhase, resolveChoice } =
    useGameLoop()

  const [outcome, setOutcome] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [journal, setJournal] = useState<string[]>([])

  useEffect(() => {
    setOutcome(null)
    setLocked(false)
  }, [phase])

  const activeEvent = useMemo(() => currentEvent, [currentEvent])

  const handleChoice = (choice: Parameters<typeof resolveChoice>[0]) => {
    if (locked || !activeEvent) return
    const result = resolveChoice(choice)
    setOutcome(result.outcomeText)
    setLocked(true)
    setJournal((prev) => [`${phase}: ${choice.label} -> ${result.outcomeText}`, ...prev].slice(0, 6))
  }

  const wrapperGlitchClass = isGlitching ? 'animate-[shake_0.6s_linear_infinite] invert' : ''

  // TODO: Play "Humina" drone sound loop here when audio pipeline is connected.

  return (
    <div className={`min-h-screen bg-[#0f1118] text-white relative overflow-hidden ${wrapperGlitchClass}`}>
      <style>{shakeStyles}</style>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,140,222,0.12),transparent_35%)]" />

      <NokiaPhone sanity={stats.sanity} />

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
              <EventCard
                event={activeEvent}
                locked={locked}
                outcome={outcome}
                onChoice={handleChoice}
                onNextPhase={advancePhase}
                fallbackMedia={fallbackMedia}
                phase={phase}
              />
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

            {phase === 'MORNING' && <MorningReport stats={stats} dayCount={dayCount} onAdvance={advancePhase} />}

            {isGameOver && (
              <div className="panel border-4 border-red-500 bg-red-900/20 text-red-200">
                <p className="text-xl font-bold">Game Over</p>
                <p>Voudin huutokauppa tai suljettu osasto. Mieli {stats.sanity}, markat {stats.money.toFixed(0)} mk.</p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
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
