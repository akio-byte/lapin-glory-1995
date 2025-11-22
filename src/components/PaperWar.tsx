import { useMemo, useState } from 'react'
import type { GameEvent, Stats } from '../data/gameData'
import CRTVisual from './CRTVisual'

export type PaperWarMove = 'ATTACK_FORM' | 'DEFEND_RECEIPT' | 'BLUFF'

const PAPER_WAR_BEATS: Record<PaperWarMove, PaperWarMove> = {
  ATTACK_FORM: 'BLUFF',
  BLUFF: 'DEFEND_RECEIPT',
  DEFEND_RECEIPT: 'ATTACK_FORM',
}

const moveMeta: Record<PaperWarMove, { label: string; detail: string; icon: string }> = {
  ATTACK_FORM: { label: 'Puuttuva kuitti', detail: 'Lyöt pöytään viitteettömän laskun.', icon: '📎' },
  DEFEND_RECEIPT: { label: 'Lomake 5057e', detail: 'Käytät pyhää puolustuslomaketta.', icon: '📑' },
  BLUFF: { label: 'Hypno-auditointi', detail: 'Tuijotat tarkastajaa ja mumiset asetuksia.', icon: '🌀' },
}

const TOTAL_ROUNDS = 3

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const mergeEffects = (prev: Partial<Stats>, delta: Partial<Stats>) => {
  const next: Partial<Stats> = { ...prev }
  ;['money', 'sanity', 'reputation'].forEach((key) => {
    const typedKey = key as keyof Stats
    if (delta[typedKey] !== undefined) {
      next[typedKey] = (next[typedKey] ?? 0) + (delta[typedKey] ?? 0)
    }
  })
  return next
}

const formatEffectSummary = (effects: Partial<Stats>) => {
  const chunks = ['money', 'sanity', 'reputation']
    .map((key) => {
      const typedKey = key as keyof Stats
      const value = effects[typedKey]
      if (value === undefined) return null
      const label = key === 'money' ? 'mk' : typedKey
      const prefix = value > 0 ? '+' : ''
      return `${label}: ${prefix}${value}`
    })
    .filter(Boolean)

  return chunks.join(' | ')
}

type RoundOutcome = 'win' | 'loss' | 'draw'

type RoundLog = {
  round: number
  playerMove: PaperWarMove
  inspectorMove: PaperWarMove
  result: RoundOutcome
  note: string
}

export type PaperWarResolution = {
  summary: string
  appliedEffects: Partial<Stats>
  rounds: RoundLog[]
}

type PaperWarProps = {
  event: GameEvent
  stats: Stats
  fallbackMedia: NonNullable<GameEvent['media']>
  locked: boolean
  outcome: string | null
  onResolve: (result: PaperWarResolution) => void
  onNextPhase: () => void
  isGlitching?: boolean
}

const PaperWar = ({ event, stats, fallbackMedia, locked, outcome, onResolve, onNextPhase, isGlitching }: PaperWarProps) => {
  const media = useMemo(() => event.media ?? fallbackMedia, [event.media, fallbackMedia])
  const [rounds, setRounds] = useState<RoundLog[]>([])
  const [pendingEffects, setPendingEffects] = useState<Partial<Stats>>({})
  const [localSanity, setLocalSanity] = useState(stats.sanity)
  const [localMoney, setLocalMoney] = useState(stats.money)
  const [finished, setFinished] = useState(false)

  const playRound = (playerMove: PaperWarMove) => {
    if (locked || finished) return

    const inspectorMove = (Object.keys(PAPER_WAR_BEATS) as PaperWarMove[])[
      Math.floor(Math.random() * Object.keys(PAPER_WAR_BEATS).length)
    ]

    let result: RoundOutcome = 'draw'
    if (PAPER_WAR_BEATS[playerMove] === inspectorMove) result = 'win'
    else if (PAPER_WAR_BEATS[inspectorMove] === playerMove) result = 'loss'

    const roundEffect: Partial<Stats> =
      result === 'win'
        ? { reputation: 5, money: 40, sanity: -2 }
        : result === 'loss'
          ? { sanity: -12, money: -50, reputation: -3 }
          : { sanity: -6, money: -10 }

    const note =
      result === 'win'
        ? 'Krok siristää silmää ja merkitsee kohdan: "hyväksytty hermoromahdus".'
        : result === 'loss'
          ? 'Lomake muljahtaa väärinpäin. Kuulokkeissa kuuluu lisäselvityspyyntö.'
          : 'Paperit törmäävät ilmaan. Molemmat selaatte hiljaa.'

    const nextEffects = mergeEffects(pendingEffects, roundEffect)
    const nextRounds = [
      ...rounds,
      { round: rounds.length + 1, playerMove, inspectorMove, result, note },
    ]

    setPendingEffects(nextEffects)
    setRounds(nextRounds)
    setLocalSanity((prev) => clamp(prev + (roundEffect.sanity ?? 0), 0, 100))
    setLocalMoney((prev) => prev + (roundEffect.money ?? 0))

    if (nextRounds.length >= TOTAL_ROUNDS) {
      const wins = nextRounds.filter((entry) => entry.result === 'win').length
      const losses = nextRounds.filter((entry) => entry.result === 'loss').length
      const draws = nextRounds.length - wins - losses
      const effectText = formatEffectSummary(nextEffects)
      const summary = `Paper War ${wins}-${losses}-${draws}. Saldo: ${effectText || 'ei muutoksia'}.`

      setFinished(true)
      onResolve({ summary, appliedEffects: nextEffects, rounds: nextRounds })
    }
  }

  return (
    <div className={`panel relative space-y-4 bg-asphalt/60 ${isGlitching ? 'glitch-veil' : ''}`}>
      <div className="absolute inset-0 bg-repeat bg-[linear-gradient(90deg,rgba(255,0,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">Byrokratia-taistelu</p>
            <h2 className="text-2xl font-bold glitch-text" data-text={event.id}>
              {event.id}
            </h2>
          </div>
          <div className="text-xs text-neon uppercase tracking-[0.2em]">Kierros {Math.min(rounds.length + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</div>
        </div>

        <CRTVisual media={media} isGlitching={isGlitching} />
        <p className="text-sm leading-relaxed bg-coal/70 border border-neon/40 p-3">{event.text}</p>

        <div className="grid md:grid-cols-3 gap-3">
          {Object.keys(moveMeta).map((key) => {
            const move = key as PaperWarMove
            const meta = moveMeta[move]
            return (
              <button
                key={move}
                className={`text-left border-2 border-neon px-4 py-3 uppercase tracking-[0.2em] bg-coal/60 hover:bg-neon/10 transition shadow-neon ${locked || finished ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => playRound(move)}
                disabled={locked || finished}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neon flex items-center gap-2">
                    <span>{meta.icon}</span>
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-slate-200">{PAPER_WAR_BEATS[move] === 'BLUFF' ? '↑' : PAPER_WAR_BEATS[move] === 'DEFEND_RECEIPT' ? '→' : '↺'}</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-snug">{meta.detail}</p>
              </button>
            )
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Mielenterveys</p>
            <p className="text-lg font-semibold">{localSanity.toFixed(0)} / 100</p>
            <p className="text-[11px] text-slate-300">Jäljellä kun ruudukko täyttyy.</p>
          </div>
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Markat</p>
            <p className="text-lg font-semibold">{localMoney.toFixed(0)} mk</p>
            <p className="text-[11px] text-slate-300">Lomakekirjojen kipuraja.</p>
          </div>
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Lokit</p>
            <p className="text-[11px] text-slate-300">{formatEffectSummary(pendingEffects) || 'Ei muutoksia vielä.'}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {rounds.length === 0 && <p className="text-slate-300">Paperit leijuvat ilmassa. Valitse ensimmäinen siirto.</p>}
          {rounds.map((entry) => (
            <div key={entry.round} className="border-l-2 border-neon pl-3 py-1 bg-black/30">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neon/70">Kierros {entry.round}</p>
              <p className="font-semibold text-slate-100">
                Sinä: {moveMeta[entry.playerMove].label} vs. Krok: {moveMeta[entry.inspectorMove].label}
              </p>
              <p className="text-xs text-slate-300">{entry.note}</p>
            </div>
          ))}
        </div>

        {outcome && (
          <div className="border-2 border-dashed border-neon/70 bg-coal/80 p-4 shadow-inner text-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Loppusumma</p>
            <p className="mt-2">{outcome}</p>
            <div className="mt-3 text-right">
              <button className="button-raw bg-neon text-coal" onClick={onNextPhase}>
                Next Phase →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaperWar
