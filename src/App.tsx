import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, Brain, Coins, MoonStar, Sparkles, Sun } from 'lucide-react'
import './App.css'
import type { Event } from './data/events'
import { INITIAL_EVENTS } from './data/events'
import CRTVisual from './components/CRTVisual'

type Phase = 'day' | 'night' | 'morning'

type Stats = {
  money: number
  reputation: number
  sanity: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const PHASE_SEQUENCE: Record<Phase, Phase> = {
  day: 'night',
  night: 'morning',
  morning: 'day',
}

const phaseMeta: Record<Phase, { label: string; icon: JSX.Element; accent: string }> = {
  day: { label: 'PÄIVÄ / VIRKAKONE', icon: <Sun className="h-5 w-5" />, accent: 'border-neon' },
  night: { label: 'YÖ / BAARI', icon: <MoonStar className="h-5 w-5" />, accent: 'border-glitch' },
  morning: { label: 'AAMU / RAPORTTI', icon: <AlarmClock className="h-5 w-5" />, accent: 'border-white' },
}

const formatDelta = (value: number) => (value > 0 ? `+${value}` : `${value}`)

const StatBadge = ({ label, value, icon, tone }: { label: string; value: string; icon: JSX.Element; tone: string }) => (
  <div className={`panel flex items-center gap-3 bg-gradient-to-br from-asphalt to-coal ${tone}`}>
    <div className="p-3 bg-coal border-2 border-neon text-neon shadow-neon">{icon}</div>
    <div>
      <p className="text-xs tracking-[0.2em] text-glitch">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
)

const EventCard = ({ event, onChoice }: { event: Event; onChoice: (effect: Event['choices'][number]) => void }) => (
  <div className="panel relative overflow-hidden">
    <div className="absolute inset-0 opacity-5 bg-repeat bg-grid bg-[length:40px_40px]" />
    {event.media && <CRTVisual media={event.media} />}
    <p className="text-xs tracking-[0.3em] text-glitch">{event.id}</p>
    <h2 className="text-2xl font-bold mb-2 glitch-text" data-text={event.title}>
      {event.title}
    </h2>
    <p className="text-sm leading-relaxed mb-6 text-slate-200">{event.description}</p>
    <div className="space-y-3">
      {event.choices.map((choice) => (
        <button
          key={choice.text}
          className="button-raw w-full text-left"
          onClick={() => onChoice(choice)}
        >
          <span className="block text-sm">{choice.text}</span>
          <span className="block text-xs text-coal mt-1">
            RAHAT {formatDelta(choice.effect.money ?? 0)} mk | MAINE {formatDelta(choice.effect.reputation ?? 0)} | MIELI{' '}
            {formatDelta(choice.effect.sanity ?? 0)}
          </span>
        </button>
      ))}
    </div>
  </div>
)

const PhaseTicker = ({ phase }: { phase: Phase }) => {
  const meta = phaseMeta[phase]
  return (
    <div className={`panel flex items-center gap-3 border-2 ${meta.accent}`}>
      <div className="flex items-center gap-2 text-neon">
        {meta.icon}
        <span className="text-sm tracking-[0.25em]">{meta.label}</span>
      </div>
      <div className="ml-auto text-xs uppercase bg-neon text-coal px-3 py-1">Lapin Glory OS/95</div>
    </div>
  )
}

const NightCard = ({ report }: { report: string }) => (
  <div className="panel space-y-3">
    <p className="text-xs tracking-[0.3em] text-glitch">YÖSIMULAATTORI</p>
    <h2 className="text-2xl font-bold">Neon pölyää ja kassakone yskii</h2>
    <p className="text-sm text-slate-200 leading-relaxed">{report}</p>
    <div className="text-xs uppercase tracking-[0.2em] text-neon">Tulokset päivittyvät automaattisesti</div>
  </div>
)

const MorningCard = ({ stats }: { stats: Stats }) => (
  <div className="panel space-y-3">
    <p className="text-xs tracking-[0.3em] text-glitch">AAMURAPORTTI</p>
    <h2 className="text-2xl font-bold">Sininen hetki, vihreä verokirje</h2>
    <ul className="text-sm text-slate-200 space-y-2">
      <li>Rahat: {stats.money} mk</li>
      <li>Maine: {stats.reputation} / 100</li>
      <li>Mielenterveys: {stats.sanity} / 100</li>
    </ul>
    <p className="text-xs uppercase tracking-[0.2em] text-neon">Paina NEXT aloittaaksesi seuraavan kierroksen</p>
  </div>
)

function App() {
  const [phase, setPhase] = useState<Phase>('day')
  const [stats, setStats] = useState<Stats>({ money: 0, reputation: 0, sanity: 100 })
  const [outcome, setOutcome] = useState('Valitse kohtalosi Lapissa.')
  const [nightReport, setNightReport] = useState('Jono ulottuu pakkaseen. Kassakone pitää metallista ääntä kuin kairan terä.')
  const [journal, setJournal] = useState<string[]>([])

  const activeEvent = useMemo(() => INITIAL_EVENTS.find((evt) => evt.triggerPhase === phase), [phase])

  const isBankrupt = stats.money < -1000
  const isBroken = stats.sanity <= 0
  const isGameOver = isBankrupt || isBroken

  const pushLog = (entry: string) => setJournal((prev) => [entry, ...prev].slice(0, 6))

  const applyEffect = (effect: Event['choices'][number]['effect']) => {
    setStats((prev) => ({
      money: prev.money + (effect.money ?? 0),
      reputation: clamp(prev.reputation + (effect.reputation ?? 0), 0, 100),
      sanity: clamp(prev.sanity + (effect.sanity ?? 0), 0, 100),
    }))
  }

  const handleChoice = (choice: Event['choices'][number]) => {
    applyEffect(choice.effect)
    setOutcome(choice.outcomeText)
    pushLog(`${phase.toUpperCase()}: ${choice.text}`)
  }

  const rollNight = () => {
    const vignettes = [
      'EU-tarkastaja eksyy porokämpälle ja maksaa laskun vahingossa kahdesti.',
      'Joku tanssii yksin VHS-karaoken edessä. Juomatuloissa outo piikki.',
      'Sähkökatko pimentää baarin. Fluoresoivat tarrat hohtavat kuin revontulet.',
    ]
    const blip = vignettes[Math.floor(Math.random() * vignettes.length)]
    const cash = Math.round(Math.random() * 200 - 80)
    const rep = Math.round(Math.random() * 10 - 3)
    const sanity = Math.round(Math.random() * 8 - 4)
    setNightReport(`${blip} Kassavirta ${formatDelta(cash)} mk, maine ${formatDelta(rep)}, mieli ${formatDelta(sanity)}.`)
    applyEffect({ money: cash, reputation: rep, sanity })
    pushLog(`YÖ: ${blip}`)
  }

  const nextPhase = () => {
    const upcoming = PHASE_SEQUENCE[phase]
    if (phase === 'day') {
      rollNight()
    }
    if (phase === 'night') {
      pushLog('AAMU: Lasketaan kierroksen tulokset')
    }
    if (upcoming === 'day') {
      setOutcome('Uusi faksi särisee linjalla. Päivä on jälleen käsillä.')
    }
    setPhase(upcoming)
  }

  useEffect(() => {
    if (phase === 'day' && activeEvent) {
      setOutcome(activeEvent.description)
    }
  }, [phase, activeEvent])

  const sanityGlitch = stats.sanity < 20

  return (
    <div className="relative min-h-screen bg-coal text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-grid bg-[length:60px_60px]" />
      <main className="relative max-w-6xl mx-auto px-6 py-10 crt-overlay">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] text-glitch">Pimppisimulaattori: Lapin Glory</p>
            <h1 className={`text-4xl font-bold mt-2 ${sanityGlitch ? 'glitch-text' : ''}`} data-text="LAPIN GLORY OS/95">
              LAPIN GLORY OS/95
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Lama-Noir managerointi: päivästä yöhön, yöhön aamuun. Neon pinkki vastaan harmaa byrokratia.
            </p>
          </div>
          <PhaseTicker phase={phase} />
        </header>

        <section className="grid md:grid-cols-3 gap-4 mt-8">
          <StatBadge label="Rahat" value={`${stats.money} mk`} icon={<Coins />} tone="" />
          <StatBadge label="Maine" value={`${stats.reputation} / 100`} icon={<Sparkles />} tone="" />
          <StatBadge label="Mielenterveys" value={`${stats.sanity} / 100`} icon={<Brain />} tone={sanityGlitch ? 'animate-pulse' : ''} />
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-10 items-start">
          <div className="md:col-span-2 space-y-4">
            {phase === 'day' && activeEvent && <EventCard event={activeEvent} onChoice={handleChoice} />}
            {phase === 'night' && <NightCard report={nightReport} />}
            {phase === 'morning' && <MorningCard stats={stats} />}

            <div className="panel bg-coal/70 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="text-sm text-slate-200">
                <p className="font-semibold text-neon">Outcome</p>
                <p>{outcome}</p>
              </div>
              <button className="button-raw" onClick={nextPhase}>
                Next Phase →
              </button>
            </div>

            {isGameOver && (
              <div className="panel border-4 border-red-500 text-red-200">
                <p className="text-xl font-bold">GAME OVER</p>
                <p>
                  {isBankrupt && 'Velkakello soi liian kovaa. '} {isBroken && 'Mielenterveys suli neonin alle.'}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="panel">
              <p className="text-xs tracking-[0.3em] text-glitch">LOKIKONE</p>
              <ul className="mt-3 space-y-2 text-sm max-h-64 overflow-y-auto pr-2">
                {journal.length === 0 && <li className="text-slate-400">Ei merkintöjä vielä.</li>}
                {journal.map((entry, idx) => (
                  <li key={idx} className="border-l-2 border-neon pl-2">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel text-sm text-slate-200">
              <p className="text-xs tracking-[0.3em] text-glitch">FAKSILINJA</p>
              <p className="mt-2">
                Päivävaihe: vastaa byrokraattisiin fakseihin ja tee valinnat. Yö: tulos simuloidaan automaattisesti. Aamu: tarkista
                tilanne ja jatka sykliä.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
