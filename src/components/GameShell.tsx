import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import '../App.css'
import EventCard from './EventCard'
import NokiaPhone from './NokiaPhone'
import PaperWar, { type PaperWarResolution } from './PaperWar'
import Shop from './Shop'
import DebugPanel from './DebugPanel'
import { buildPathMeta, type BuildPath, type Item, type Stats } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import { endingEpilogues, type EndingType } from '../data/endingData'
import { useGameLoop, type DaySnapshot } from '../hooks/useGameLoop'
import { useAudio } from '../hooks/useAudio'
import Desktop from './Desktop'
import OSWindow from './OSWindow'
import Taskbar from './Taskbar'
import JournalWindow from './JournalWindow'
import SettingsWindow from './SettingsWindow'

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

const RUN_HISTORY_KEY = 'lapin-glory-runs'

type RunSummary = {
  id: string
  endedAt: number
  ending: EndingType
  dayCount: number
  stats: Stats
  lai: number
  focusPath: BuildPath | null
}

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`

type PathProgressChipsProps = {
  progress: Record<BuildPath, { xp: number; milestoneIndex: number }>
}

const PathProgressChips = ({ progress }: PathProgressChipsProps) => {
  const paths = Object.keys(buildPathMeta) as BuildPath[]

  return (
    <div className="glass-panel px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neon/80">
        <span>Build Paths</span>
        <span className="text-[11px] text-slate-300">Tourist / Tax / Occult / Network</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {paths.map((path) => {
          const meta = buildPathMeta[path]
          const xp = progress[path]?.xp ?? 0
          const index = progress[path]?.milestoneIndex ?? 0
          const milestones = meta.milestones
          const next = milestones[index] ?? milestones[milestones.length - 1]
          const prev = index === 0 ? 0 : milestones[index - 1]
          const ratio = next ? Math.min(1, (xp - prev) / (next - prev)) : 1
          const cappedRatio = Number.isFinite(ratio) ? ratio : 0
          const stageLabel = index >= milestones.length ? 'Valmis' : `Taso ${index + 1}`

          return (
            <div key={path} className="bg-black/40 border border-neon/30 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-neon/70">{meta.label}</p>
                  <p className="text-xs text-slate-300">{meta.description}</p>
                </div>
                <span className="text-[11px] text-neon/80">{stageLabel}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${meta.color}`}
                  style={{ width: `${Math.min(100, cappedRatio * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-200">
                <span>XP {xp.toFixed(0)}</span>
                <span>
                  {index >= milestones.length ? 'Max' : `Seuraava @ ${next} XP`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MorningReport = ({
  stats,
  dayCount,
  rahatDelta,
  jarkiDelta,
  laiDelta,
  note,
  history,
  onAdvance,
}: {
  stats: Stats
  dayCount: number
  rahatDelta: number
  jarkiDelta: number
  laiDelta: number
  note: string
  history: DaySnapshot[]
  onAdvance: () => void
}) => (
  <div className="glass-panel space-y-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-black/40 border border-neon/30 rounded text-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-neon/70 uppercase tracking-[0.2em]">
          <span>Raha / LAI trendi</span>
          <span>Päivät -3 → -1</span>
        </div>
        <div className="space-y-1">
          {[...history]
            .filter((entry) => entry.day < dayCount)
            .slice(-3)
            .map((entry) => {
              const prev = history.find((h) => h.day === entry.day - 1)
              const profit = prev ? entry.rahat - prev.rahat : 0
              const deltaLai = prev ? entry.lai - prev.lai : 0
              return (
                <div key={entry.day} className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-200">D{entry.day}</span>
                  <span className="text-emerald-200">{formatDelta(profit)} mk</span>
                  <span className="text-sky-200">LAI {formatDelta(deltaLai)}</span>
                </div>
              )
            })}
          {history.filter((entry) => entry.day < dayCount).length === 0 && (
            <p className="text-slate-300">Ei vielä aiempia päiviä.</p>
          )}
        </div>
      </div>
      <div className="p-3 bg-black/40 border border-neon/30 rounded text-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-neon/70 uppercase tracking-[0.2em]">
          <span>LAI muutos</span>
          <span>Tämän aamun lukema</span>
        </div>
        <p className="text-slate-100">LAI {formatDelta(laiDelta)} → {stats.jarki < 30 ? 'Ole varovainen' : 'Hallinnassa'}</p>
        <p className="text-xs text-slate-300">Raportti huomioi eilisillan päätöksen ja tämän aamun tilan.</p>
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

const RunOverScreen = ({
  ending,
  onRestart,
}: {
  ending: { type: EndingType; stats: Stats; dayCount: number; lai: number }
  onRestart: () => void
}) => {
  const copy = endingEpilogues[ending.type]

  return (
    <div className="min-h-screen bg-[#0f1118] text-white flex items-center justify-center px-6 py-10">
      <div className="panel max-w-xl w-full space-y-4 bg-coal/80 border-2 border-neon/50">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70 text-center">Game Over</p>
        <h2 className="text-3xl font-bold glitch-text text-center" data-text={copy.title}>
          {copy.title}
        </h2>
        <p className="text-sm text-slate-200 text-center">{copy.description({ stats: ending.stats, lai: ending.lai })}</p>
        {copy.flavor && <p className="text-[12px] text-neon/80 text-center">{copy.flavor}</p>}
        {copy.media && (
          <div className="rounded overflow-hidden border border-neon/30">
            {copy.media.type === 'image' ? (
              <img src={copy.media.src} alt={copy.media.alt} className="w-full h-40 object-cover" />
            ) : (
              <video src={copy.media.src} autoPlay loop muted className="w-full h-48 object-cover" />
            )}
          </div>
        )}
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
    pathProgress,
    dayHistory,
    handleChoice: applyChoiceEffects,
    advancePhase,
    resolveChoice,
    buyItem,
    consumeItem,
    morningReport,
    resetGame,
    wasRestored,
    pingNetMonitor,
    nextNightEventHint,
    grantPathXp,
  } = useGameLoop()

  const {
    muted,
    toggleMute,
    backgroundPlaying,
    toggleBackground,
    backgroundVolume,
    setBackgroundVolume,
    sfxVolume,
    setSfxVolume,
    playSfx,
    setBackgroundMode,
  } = useAudio()

  const [outcome, setOutcome] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [journal, setJournal] = useState<string[]>([])
  const [runHistory, setRunHistory] = useState<RunSummary[]>([])
  const [textSpeed, setTextSpeed] = useState(3)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [corruptedLabels, setCorruptedLabels] = useState({
    rahat: canonicalStats.rahat.label,
    maine: canonicalStats.maine.label,
    jarki: canonicalStats.jarki.label,
  })
  const bossIntroRef = useRef<string | null>(null)
  const sanityPrevRef = useRef(stats)
  const laiPrevRef = useRef(lai)
  const endingLoggedRef = useRef(false)
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
  const runHistoryLines = useMemo(
    () =>
      runHistory.map((entry) => {
        const time = new Date(entry.endedAt)
        const focus = entry.focusPath ? ` • ${buildPathMeta[entry.focusPath].label}` : ''
        const laiText = `LAI ${entry.lai.toFixed(0)}`
        return `${time.toLocaleDateString()} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${
          entry.ending
        } D${entry.dayCount} ${canonicalStats.rahat.format(entry.stats.rahat)} ${laiText}${focus}`
      }),
    [runHistory],
  )

  const resetInteraction = useCallback(() => {
    setOutcome(null)
    setLocked(false)
  }, [])

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCorruptedLabels(baseLabels)
  }, [stats.jarki])

  const handleRestart = useCallback(() => {
    setJournal([])
    resetInteraction()
    resetGame()
  }, [resetGame, resetInteraction])

  const pushJournal = useCallback((entry: string) => {
    setJournal((prev) => [entry, ...prev].slice(0, 12))
  }, [])

  useEffect(() => {
    const previousLai = laiPrevRef.current
    if (lai !== previousLai) {
      const laiDelta = lai - previousLai
      pushJournal(`LAI muutos: ${formatDelta(laiDelta)} → ${lai.toFixed(0)}`)
      laiPrevRef.current = lai
    }
  }, [lai, pushJournal])

  useEffect(() => {
    if (!morningReport) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pushJournal(
      `Aamuraportti D${morningReport.day}: Raha ${formatDelta(morningReport.rahatDelta)} mk, Järki ${formatDelta(morningReport.jarkiDelta)}`,
    )
  }, [morningReport, pushJournal])

  useEffect(() => {
    if (!ending) {
      endingLoggedRef.current = false
      return
    }
    if (endingLoggedRef.current) return

    const focusPath = (Object.keys(pathProgress) as BuildPath[])
      .map((path) => ({ path, xp: pathProgress[path]?.xp ?? 0 }))
      .sort((a, b) => b.xp - a.xp)[0]?.path

    const entry: RunSummary = {
      id: `${ending.type}-${Date.now()}`,
      endedAt: Date.now(),
      ending: ending.type,
      dayCount: ending.dayCount,
      stats: ending.stats,
      lai,
      focusPath: focusPath ?? null,
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRunHistory((prev) => {
      const next = [entry, ...prev].slice(0, 8)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(next))
      }
      return next
    })

    endingLoggedRef.current = true
  }, [ending, lai, pathProgress])

    const handleEventChoice = useCallback(
      (choice: Parameters<typeof resolveChoice>[0]) => {
        if (locked || !activeEvent) return
      playSfx('choice')
      const result = resolveChoice(choice)
      setOutcome(result.outcomeText)
      setLocked(true)
      pushJournal(`Tapahtuma ${activeEvent.id}: ${choice.label} → ${result.outcomeText}`)
    },
    [activeEvent, locked, playSfx, pushJournal, resolveChoice],
  )

  const handlePaperWarResolve = useCallback(
    (result: PaperWarResolution) => {
      if (locked || !activeEvent) return
      playSfx('choice')
      applyChoiceEffects(result.appliedEffects)
      setOutcome(result.summary)
      setLocked(true)
      pushJournal(`PaperWar ${activeEvent.id}: ${result.summary}`)

      if (activeEvent.paths?.length) {
        const wins = result.rounds.filter((r) => r.result === 'win').length
        const xpPerPath: Partial<Record<BuildPath, number>> = {}
        activeEvent.paths.forEach((path) => {
          xpPerPath[path] = (xpPerPath[path] ?? 0) + Math.max(2, wins + 1)
        })
        grantPathXp(xpPerPath, `paperwar:${activeEvent.id}`)
      }
    },
    [activeEvent, applyChoiceEffects, grantPathXp, locked, playSfx, pushJournal],
  )

  const handleBuy = useCallback(
    (item: Item) => {
      const success = buyItem(item)
      if (success) {
        pushJournal(`Osto: ${item.name} (${item.price} mk)`)
        playSfx('cash')
      }
    },
    [buyItem, playSfx, pushJournal],
  )

  const handleAdvancePhase = useCallback(() => {
    resetInteraction()
    advancePhase()
  }, [advancePhase, resetInteraction])

  const toggleShop = useCallback(() => {
    playSfx('choice')
    setIsShopOpen((prev) => !prev)
  }, [playSfx])

  const toggleLog = useCallback(() => {
    playSfx('choice')
    setIsLogOpen((prev) => !prev)
  }, [playSfx])

  const toggleSettings = useCallback(() => {
    playSfx('choice')
    setIsSettingsOpen((prev) => !prev)
  }, [playSfx])

  const closeShop = useCallback(() => {
    playSfx('choice')
    setIsShopOpen(false)
  }, [playSfx])

  const closeLog = useCallback(() => {
    playSfx('choice')
    setIsLogOpen(false)
  }, [playSfx])

  const closeSettings = useCallback(() => {
    playSfx('choice')
    setIsSettingsOpen(false)
  }, [playSfx])

  const wrapperGlitchClass = isGlitching ? 'glitch-wrapper invert' : ''
  const lowSanity = stats.jarki < 50

  const report =
    morningReport ?? ({ rahatDelta: 0, jarkiDelta: 0, laiDelta: 0, note: 'Raportti latautuu...', day: dayCount } as const)

  if (ending) {
    return <RunOverScreen ending={ending} onRestart={handleRestart} />
  }

  return (
    <ErrorBoundary>
      <Desktop>
        <div
          className={`h-full w-full text-white relative overflow-hidden bg-[#050912]/70 backdrop-blur-sm ${wrapperGlitchClass} ${isGlitching ? 'glitch-veil' : ''} ${lowSanity ? 'low-sanity' : ''}`}
          style={rootStyle}
        >
          <style>{shakeStyles}</style>
          {lowSanity && <div className="hcr-noise" aria-hidden />}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,140,222,0.12),transparent_35%)]" />

          <div className="h-full w-full flex items-start justify-center pt-6 pb-24">
            <div className="w-full max-w-6xl flex flex-col gap-4 items-center">
              <div className="flex items-center justify-between w-full text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 border border-neon/50 bg-neon/10 uppercase tracking-[0.3em] text-[11px]">Lapin Glory OS/95</span>
                  {wasRestored && (
                    <span className="px-3 py-1 rounded-full border border-neon/40 bg-neon/10 text-neon text-[11px] uppercase tracking-[0.2em]">Ladattu tallennus</span>
                  )}
                </div>
                <button className="button-raw px-3 py-1" onClick={handleRestart}>
                  Aloita uusi run
                </button>
              </div>

              <PathProgressChips progress={pathProgress} />

              <OSWindow title="FAKSI / TAPAHTUMA" isActive size="lg">
                <div className="space-y-4">
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

                  {phase === 'MORNING' && (
                    <MorningReport
                      stats={stats}
                      dayCount={report.day}
                      rahatDelta={report.rahatDelta}
                      jarkiDelta={report.jarkiDelta}
                      laiDelta={report.laiDelta}
                      history={dayHistory}
                      note={report.note}
                      onAdvance={handleAdvancePhase}
                    />
                  )}

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
                        onNextPhase={handleAdvancePhase}
                        isGlitching={isGlitching}
                      />
                    ) : (
                      <EventCard
                        event={activeEvent}
                        locked={locked}
                        outcome={outcome}
                        onChoice={handleEventChoice}
                        onNextPhase={handleAdvancePhase}
                        fallbackMedia={fallbackMedia}
                        phase={phase}
                        isGlitching={isGlitching}
                      />
                    )
                  )}

                  {phase !== 'MORNING' && !activeEvent && (
                    <div className="glass-panel">
                      <p className="text-xs uppercase tracking-[0.3em] text-neon">Hiljainen linja</p>
                      <p className="text-sm text-slate-200 mt-2">Ei tapahtumia juuri nyt. Avaa ovi ja kuuntele huminaa.</p>
                      <button className="button-raw mt-3" onClick={handleAdvancePhase}>
                        Pakota seuraava vaihe →
                      </button>
                    </div>
                  )}
                </div>
              </OSWindow>

              <NokiaPhone
                className="nokia-shell"
                jarki={stats.jarki}
                lai={lai}
                onPing={() => {
                  const reading = pingNetMonitor()
                  playSfx('nokia')
                  return reading
                }}
                nextNightEventHint={nextNightEventHint}
              />

              {isShopOpen && (
                <OSWindow title="SALKKUKAUPPA" isActive size="md" onClose={closeShop}>
              <Shop phase={phase} inventory={inventory} stats={stats} onBuy={handleBuy} onUse={consumeItem} />
                </OSWindow>
              )}

              {isLogOpen && (
                <OSWindow title="LOKIKONE" isActive size="sm" onClose={closeLog}>
                  <JournalWindow entries={journal} runHistory={runHistoryLines} />
                </OSWindow>
              )}

              {isSettingsOpen && (
                <OSWindow title="ASETUKSET" isActive size="sm" onClose={closeSettings}>
                  <SettingsWindow
                    muted={muted}
                    toggleMute={toggleMute}
                    backgroundPlaying={backgroundPlaying}
                    toggleBackground={toggleBackground}
                    backgroundVolume={backgroundVolume}
                    sfxVolume={sfxVolume}
                    onBackgroundVolumeChange={setBackgroundVolume}
                    onSfxVolumeChange={setSfxVolume}
                    textSpeed={textSpeed}
                    onTextSpeedChange={setTextSpeed}
                  />
                </OSWindow>
              )}
            </div>
          </div>

          {import.meta.env.DEV && (
            <div className="fixed dev-panel text-[11px] bg-black/80 border border-neon/40 rounded-md p-3 w-64 shadow-[0_0_20px_rgba(255,0,255,0.25)] space-y-1">
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
        <Taskbar
          stats={stats}
          dayCount={dayCount}
          lai={lai}
          pathProgress={pathProgress}
          onToggleShop={toggleShop}
          onToggleLog={toggleLog}
          onToggleSettings={toggleSettings}
        />
      </Desktop>
    </ErrorBoundary>
  )
}

export default GameShell
