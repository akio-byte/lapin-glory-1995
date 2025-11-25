import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import '../App.css'
import NokiaPhone from './NokiaPhone'
import type { PaperWarResolution } from './PaperWar'
import Shop from './Shop'
import DebugPanel from './DebugPanel'
import {
  buildPathMeta,
  type BuildPath,
  type Item,
  type Stats,
} from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import type { EndingType } from '../data/endingData'
import { MediaRegistry } from '../data/mediaRegistry'
import { useGameLoop } from '../hooks/useGameLoop'
import { useAudio } from '../hooks/useAudio'
import Desktop from './Desktop'
import OSWindow from './OSWindow'
import Taskbar from './Taskbar'
import JournalWindow from './JournalWindow'
import SettingsWindow from './SettingsWindow'
import MorningReportView from './views/MorningReportView'
import { DayPhaseView, NightPhaseView, type PhaseViewProps } from './views/PhaseWindow'
import RunOverScreen from './views/RunOverScreen'

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

type ErrorBoundaryState = { hasError: boolean; error?: Error }

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(0)}`

type PathProgressChipsProps = {
  progress: Record<BuildPath, { xp: number; milestoneIndex: number }>
}

const PathProgressChips = ({ progress }: PathProgressChipsProps) => {
  const [isCompact, setIsCompact] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const paths = Object.keys(buildPathMeta) as BuildPath[]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-height: 850px)')
    let previousMatch = false

    const applyMatch = (matches: boolean) => {
      setIsCompact(matches)
      if (!matches) {
        setCollapsed(false)
      } else if (!previousMatch) {
        setCollapsed(true)
      }
      previousMatch = matches
    }

    applyMatch(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      applyMatch(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="glass-panel px-4 py-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.3em] text-neon/80">
        <span>Build Paths</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-300">Tourist / Tax / Occult / Network</span>
          {isCompact && (
            <button
              type="button"
              className="button-raw px-3 py-1 text-[10px] tracking-[0.2em]"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? 'Show progress' : 'Hide progress'}
            </button>
          )}
        </div>
      </div>
      <div className={`grid md:grid-cols-2 gap-3 ${isCompact && collapsed ? 'hidden' : ''}`}>
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


class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
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
  const [desktopJarkiHit, setDesktopJarkiHit] = useState(false)

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

  const phaseBackground = useMemo(() => {
    if (phase === 'MORNING') return MediaRegistry.morningReportBg
    if (phase === 'NIGHT') return MediaRegistry.nightViewBg
    return MediaRegistry.dayViewBg
  }, [phase])

  const rootStyle = useMemo(
    () =>
      ({
        '--glitch-duration': `${textSpeed}s`,
        '--sanity-hue': `${sanityHueShift}deg`,
        backgroundImage: `linear-gradient(180deg, rgba(5, 9, 18, 0.92), rgba(5, 9, 18, 0.82)), url(${phaseBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      } as CSSProperties),
    [phaseBackground, sanityHueShift, textSpeed],
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
    let shakeTimer: number | null = null
    if (stats.rahat - prevStats.rahat > 100) {
      playSfx('cash')
    }
    if (stats.jarki < prevStats.jarki) {
      playSfx('static')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDesktopJarkiHit(true)
      shakeTimer = window.setTimeout(() => setDesktopJarkiHit(false), 260)
    }
    sanityPrevRef.current = stats
    return () => {
      if (shakeTimer) {
        window.clearTimeout(shakeTimer)
      }
    }
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

  const phaseViewProps: PhaseViewProps = {
    dayCount,
    lai,
    stats,
    corruptedLabels,
    activeEvent,
    isPaperWar: Boolean(isPaperWar),
    inventory,
    locked,
    outcome,
    fallbackMedia: fallbackMedia!,
    isGlitching,
    onPaperWarResolve: handlePaperWarResolve,
    onEventChoice: handleEventChoice,
    onAdvancePhase: handleAdvancePhase,
  }

  const phaseView =
    phase === 'MORNING' ? (
      <MorningReportView
        stats={stats}
        dayCount={report.day}
        rahatDelta={report.rahatDelta}
        jarkiDelta={report.jarkiDelta}
        laiDelta={report.laiDelta}
        history={dayHistory}
        note={report.note}
        onAdvance={handleAdvancePhase}
      />
    ) : phase === 'DAY' ? (
      <DayPhaseView {...phaseViewProps} />
    ) : (
      <NightPhaseView {...phaseViewProps} />
    )

  if (ending) {
    return <RunOverScreen ending={ending} onRestart={handleRestart} />
  }

  return (
    <ErrorBoundary>
      <Desktop
        isJarkiHit={desktopJarkiHit}
        taskbar={
          <Taskbar
            stats={stats}
            dayCount={dayCount}
            lai={lai}
            pathProgress={pathProgress}
            onToggleShop={toggleShop}
            onToggleLog={toggleLog}
            onToggleSettings={toggleSettings}
            jarkiHit={desktopJarkiHit}
          />
        }
      >
        <div
          className={`w-full min-h-screen text-white relative overflow-hidden bg-[#050912]/70 backdrop-blur-sm ${wrapperGlitchClass} ${isGlitching ? 'glitch-veil' : ''} ${lowSanity ? 'low-sanity' : ''} max-[900px]:max-h-[100%] max-[900px]:min-h-[auto]`}
          style={rootStyle}
        >
          {lowSanity && <div className="hcr-noise" aria-hidden />}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,140,222,0.12),transparent_35%)]" />

          <div className="w-full flex items-start justify-center pt-6 pb-24 max-[900px]:pt-4 max-[900px]:pb-16">
            <div className="w-full max-w-6xl flex flex-col gap-4 items-stretch lg:pr-64">
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

              {phaseView}

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
      </Desktop>
    </ErrorBoundary>
  )
}

export default GameShell
