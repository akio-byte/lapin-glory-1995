import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import '../App.css'
import EventCard from './EventCard'
import NokiaPhone from './NokiaPhone'
import PaperWar, { type PaperWarResolution } from './PaperWar'
import Shop from './Shop'
import StatsBar from './StatsBar'
import DebugPanel from './DebugPanel'
import type { Item, Stats } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import type { EndingType } from '../hooks/useGameLoop'
import { useGameLoop } from '../hooks/useGameLoop'
import { useAudio } from '../hooks/useAudio'

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
  80% { transform: translate(-1px, -1px) rotate(-1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
`

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`

// RunInfoBar shows the current run structure and guardrails at a glance.
const RunInfoBar = ({ dayCount, lai }: { dayCount: number; lai: number }) => (
  <div className="grid gap-3 md:grid-cols-4 bg-asphalt/70 border border-neon/40 shadow-neon px-4 py-3 rounded">
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neon/80">Run Structure</p>
      <p className="text-lg font-semibold">Päivä {Math.min(dayCount, 10)} / 10</p>
      <p className="text-[11px] text-slate-300">Seuraa sykliä ja pidä rytmi yllä.</p>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neon/80">Lapin Anomalia</p>
      <p className="text-lg font-semibold">LAI {lai.toFixed(0)} / 100</p>
      <p className="text-[11px] text-slate-300">Glitch-kanava voimistuu yli 70.</p>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Voita</p>
      <p className="text-[13px] leading-snug text-slate-100">Selviä 10 päivää, pidä LAI hallinnassa ja kassavirta plussalla.</p>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.3em] text-rose-300">Häviät jos</p>
      <p className="text-[13px] leading-snug text-slate-100">Järki 0, Rahat alle -1000 mk tai Maine yli 95 → Veropetos-ratsia.</p>
    </div>
  </div>
)

const MorningReport = ({
  stats,
  dayCount,
  rahatDelta,
  jarkiDelta,
  note,
  onAdvance,
}: {
  stats: Stats
  dayCount: number
  rahatDelta: number
  jarkiDelta: number
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
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.rahat.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.rahat.format(stats.rahat)}</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(rahatDelta)} mk</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.jarki.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.jarki.format(stats.jarki)}</p>
        <p className="text-xs text-slate-300">Eilen: {formatDelta(jarkiDelta)}</p>
      </div>
      <div className="border border-neon/30 p-3 bg-coal/60 rounded">
        <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.maine.label}</p>
        <p className="text-lg font-semibold">{canonicalStats.maine.format(stats.maine)}</p>
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
    title: 'Game Over: Suljettu osasto',
    description: () => 'JÄRKI putosi nollaan. Neonvalot himmenivät ja OS/95 palautui tehdasasetuksiin.',
  },
  taxRaid: {
    title: 'Game Over: Veropetos-ratsia',
    description: () =>
      'MAINE ylitti 95. Verottajan valokuitu syöksyy sisään, faksit piipittävät ja ovet sinetöidään.',
  },
  bankruptcy: {
    title: 'Game Over: Voudin huutokauppa',
    description: () => 'RAHAT vajosi alle -1000 mk. Vouti vie neonkyltit ja kassalipas myydään pakkohuutokaupassa.',
  },
  vappu: {
    title: 'Vappu – Laajennettu todellisuus',
    description: ({ stats }) => {
      if (stats.jarki > 60) {
        return 'Vappu sumenee. Torin punssin seasta kuuluu maahisen nauru ja LAI kipinöi otsasuonissa.'
      }
      return 'Vappu saapuu hiljaa. Olet pystyssä, mutta juhlinta jää sivummalle neonvalojen taakse.'
    },
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
        <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70 text-center">Game Over</p>
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
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.rahat.label}</p>
            <p className="text-lg font-semibold">{canonicalStats.rahat.format(ending.stats.rahat)}</p>
          </div>
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.jarki.label}</p>
            <p className="text-lg font-semibold">{canonicalStats.jarki.format(ending.stats.jarki)}</p>
          </div>
          <div className="border border-neon/30 p-3 bg-black/40 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.maine.label}</p>
            <p className="text-lg font-semibold">{canonicalStats.maine.format(ending.stats.maine)}</p>
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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }>
{
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GameShell crash', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0c14] to-[#0f111a] text-white flex items-center justify-center px-6 py-10">
          <div className="max-w-xl w-full text-center space-y-4 border border-neon/60 bg-black/70 p-6 rounded-lg shadow-[0_0_30px_rgba(255,0,255,0.35)]">
            <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">OS/95 Hätätila</p>
            <h2 className="text-3xl font-bold glitch-text" data-text="White Screen Särö">
              White Screen Särö
            </h2>
            <p className="text-sm leading-relaxed text-slate-200">
              Neon putosi hetkeksi. Pysy rauhallisena – Lama-Noir pitää valot päällä. Alla oleva virheviesti voi auttaa
              faksiverkkoa toipumaan.
            </p>
            <div className="text-left text-xs bg-[#0f1422] border border-neon/40 rounded p-3 font-mono text-neon">
              {this.state.error?.message}
            </div>
            <button
              className="button-raw"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Käynnistä OS/95 uudelleen
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const GameShell = () => {
  const {
    activeModifiers,
    stats,
    phase,
    inventory,
    dayCount,
    ending,
    isGlitching,
    currentEvent,
    fallbackMedia,
    lai,
    handleChoice: applyChoiceEffects,
    advancePhase,
    resolveChoice,
    buyItem,
    useItem,
    morningReport,
    resetGame,
    wasRestored,
    pingNetMonitor,
    nextNightEventHint,
  } = useGameLoop()

  const { muted, toggleMute, backgroundPlaying, toggleBackground, playSfx, setBackgroundMode } = useAudio()

  const [outcome, setOutcome] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [journal, setJournal] = useState<string[]>([])
  const [textSpeed, setTextSpeed] = useState(3)
  const [corruptedLabels, setCorruptedLabels] = useState({
    rahat: canonicalStats.rahat.label,
    maine: canonicalStats.maine.label,
    jarki: canonicalStats.jarki.label,
  })
  const bossIntroRef = useRef<string | null>(null)
  const sanityPrevRef = useRef(stats)
  const laiPrevRef = useRef(lai)
  const [sanityHueShift, setSanityHueShift] = useState(0)

  const activeEvent = useMemo(() => currentEvent, [currentEvent])
  const isPaperWar = activeEvent?.paperWar
  const relevantActiveMods = useMemo(
    () =>
      activeModifiers.filter((mod) => {
        if (!activeEvent) return true
        if (activeEvent.paperWar && (mod.tags.includes('tax') || mod.tags.includes('form') || mod.type === 'form')) return true
        if (activeEvent.vibe === 'occult' && mod.tags.includes('occult')) return true
        if (/turisti|bussi/i.test(activeEvent.id) && mod.tags.includes('tourist')) return true
        return mod.type === 'tool'
      }),
    [activeModifiers, activeEvent],
  )

  useEffect(() => {
    setOutcome(null)
    setLocked(false)
  }, [phase])

  useEffect(() => {
    setOutcome(null)
    setLocked(false)
  }, [activeEvent?.id])

  useEffect(() => {
    if (locked && !outcome) {
      // Fallback: avoid getting stuck in a locked state without a visible outcome
      console.warn('Locked without outcome – unlocking for safety')
      setLocked(false)
    }
  }, [locked, outcome])

  const rootStyle = useMemo(
    () => ({ '--glitch-duration': `${textSpeed}s`, '--sanity-hue': `${sanityHueShift}deg` } as CSSProperties),
    [sanityHueShift, textSpeed],
  )

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

  useEffect(() => {
    const prevStats = sanityPrevRef.current
    if (stats.rahat - prevStats.rahat > 100) {
      playSfx('cash')
    }
    if (stats.jarki < prevStats.jarki) {
      playSfx('static')
    }
    sanityPrevRef.current = stats
  }, [playSfx, stats])

  useEffect(() => {
    if (!isPaperWar) {
      setBackgroundMode('normal')
      return
    }
    setBackgroundMode('intense')
    playSfx('boss')
  }, [isPaperWar, playSfx, setBackgroundMode])

  useEffect(() => {
    const baseLabels = {
      rahat: canonicalStats.rahat.label,
      maine: canonicalStats.maine.label,
      jarki: canonicalStats.jarki.label,
    }
    if (stats.jarki < 50) {
      const options = {
        rahat: ['VELAT', 'MIINUS', 'KASSA?'],
        maine: ['TUHO', 'SKANDAALI', 'PALJASTUS'],
        jarki: ['SIRPALE', 'VÄÄRTYNYT', '???'],
      }
      const tick = () => {
        setCorruptedLabels({
          rahat: Math.random() > 0.5 ? options.rahat[Math.floor(Math.random() * options.rahat.length)] : baseLabels.rahat,
          maine: Math.random() > 0.5 ? options.maine[Math.floor(Math.random() * options.maine.length)] : baseLabels.maine,
          jarki: Math.random() > 0.5 ? options.jarki[Math.floor(Math.random() * options.jarki.length)] : baseLabels.jarki,
        })
        setSanityHueShift((prev) => (prev + 8) % 360)
      }
      tick()
      const interval = window.setInterval(tick, 3800)
      return () => window.clearInterval(interval)
    }
    setCorruptedLabels(baseLabels)
  }, [stats.jarki])

  const handleRestart = () => {
    setJournal([])
    setOutcome(null)
    setLocked(false)
    resetGame()
  }

  const pushJournal = (entry: string) => {
    setJournal((prev) => [entry, ...prev].slice(0, 12))
  }

  useEffect(() => {
    const previousLai = laiPrevRef.current
    if (lai !== previousLai) {
      const laiDelta = lai - previousLai
      pushJournal(`LAI muutos: ${formatDelta(laiDelta)} → ${lai.toFixed(0)}`)
      laiPrevRef.current = lai
    }
  }, [lai])

  useEffect(() => {
    if (!morningReport) return
    pushJournal(
      `Aamuraportti D${morningReport.day}: Raha ${formatDelta(morningReport.rahatDelta)} mk, Järki ${formatDelta(morningReport.jarkiDelta)}`,
    )
  }, [morningReport])

  if (ending) {
    return <RunOverScreen ending={ending} onRestart={handleRestart} />
  }

  const handleEventChoice = (choice: Parameters<typeof resolveChoice>[0]) => {
    if (locked || !activeEvent) return
    playSfx('choice')
    const result = resolveChoice(choice)
    setOutcome(result.outcomeText)
    setLocked(true)
    pushJournal(`Tapahtuma ${activeEvent.id}: ${choice.label} → ${result.outcomeText}`)
  }

  const handlePaperWarResolve = (result: PaperWarResolution) => {
    if (locked || !activeEvent) return
    playSfx('choice')
    applyChoiceEffects(result.appliedEffects)
    setOutcome(result.summary)
    setLocked(true)
    pushJournal(`PaperWar ${activeEvent.id}: ${result.summary}`)
  }

  const handleBuy = (item: Item) => {
    const success = buyItem(item)
    if (success) {
      pushJournal(`Osto: ${item.name} (${item.price} mk)`)
    }
  }

  const wrapperGlitchClass = isGlitching ? 'glitch-wrapper invert' : ''
  const lowSanity = stats.jarki < 50

  const report =
    morningReport ?? ({ rahatDelta: 0, jarkiDelta: 0, note: 'Raportti latautuu...', day: dayCount } as const)

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen bg-[#0f1118] text-white relative overflow-hidden ${wrapperGlitchClass} ${isGlitching ? 'glitch-veil' : ''} ${lowSanity ? 'low-sanity' : ''}`}
        style={rootStyle}
      >
        <style>{shakeStyles}</style>
        {lowSanity && <div className="hcr-noise" aria-hidden />}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,140,222,0.12),transparent_35%)]" />

        <NokiaPhone
          jarki={stats.jarki}
          lai={lai}
          onPing={() => {
            const reading = pingNetMonitor()
            playSfx('nokia')
            return reading
          }}
          nextNightEventHint={nextNightEventHint}
        />

        <main className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
          <header className="space-y-2">
            <p className="text-xs tracking-[0.35em] text-neon">Pimppisimulaattori: Lapin Glory</p>
            <h1 className="text-4xl font-bold glitch-text" data-text="Lapin Glory OS/95">
              Lapin Glory OS/95
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Lama-Noir managerointi: faksaa päivällä, pimppaa yöllä, toivo aamulla. Neon pinkki vastaan harmaa byrokratia.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {wasRestored && (
                <span className="px-3 py-1 rounded-full border border-neon/40 bg-neon/10 text-neon">
                  Ladattu tallennettu run
                </span>
              )}
              <button className="button-raw px-3 py-1" onClick={handleRestart}>
                Aloita uusi run
              </button>
            </div>
          </header>

          <RunInfoBar dayCount={dayCount} lai={lai} />

          <StatsBar stats={stats} phase={phase} dayCount={dayCount} lai={lai} labelOverrides={corruptedLabels} />

          <section className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              {phase !== 'MORNING' && activeEvent && (
                isPaperWar ? (
                  <PaperWar
                    event={activeEvent}
                    stats={stats}
                    inventory={inventory}
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
                  rahatDelta={report.rahatDelta}
                  jarkiDelta={report.jarkiDelta}
                  note={report.note}
                  onAdvance={advancePhase}
                />
              )}
            </div>

            <aside className="space-y-4">
              <Shop phase={phase} inventory={inventory} stats={stats} onBuy={handleBuy} onUse={useItem} />

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
                <p className="text-[11px] text-slate-300 mt-1">
                  Seuraa Rahat, Maine ja Järki -merkinnät faksien välistä.
                </p>
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
                  Päivä: Leimaa faksit ja uhraa markkoja. Yö: kohtaa bussit tai tarkastajat. Aamu: maksa indeksikorotettu vuokra ja jatka, jos mielenterveys sallii.
                </p>
              </div>
            </aside>
          </section>
        </main>
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 text-[11px] bg-black/80 border border-neon/40 rounded-md p-3 w-64 shadow-[0_0_20px_rgba(255,0,255,0.25)] space-y-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neon">Active Mods</p>
            <p className="text-[10px] text-slate-300">Työkalut ja lomakkeet, jotka vaikuttavat tämänhetkiseen event-mathiin.</p>
            <ul className="space-y-1">
              {relevantActiveMods.length === 0 && <li className="text-slate-400">Ei aktiivisia modifikaattoreita.</li>}
              {relevantActiveMods.map((mod) => (
                <li key={mod.id} className="border-l-2 border-neon pl-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{mod.name}</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-neon/80">{mod.type}</span>
                  </div>
                  <p className="text-slate-200">{mod.summary}</p>
                  {mod.tags.length > 0 && (
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">{mod.tags.join(', ')}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DebugPanel
          phase={phase}
          currentEventId={activeEvent?.id}
          stats={stats}
          isGlitching={isGlitching}
        />
      </div>
    </ErrorBoundary>
  )
}

export default GameShell
