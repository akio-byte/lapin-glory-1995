import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameEvent, Item, Stats } from '../data/gameData'
import CRTVisual from './CRTVisual'
import { canonicalStats } from '../data/statMeta'
import { MediaRegistry } from '../data/mediaRegistry'

export type PaperWarMove = 'ATTACK_FORM' | 'DEFEND_RECEIPT' | 'BLUFF'

const PAPER_WAR_BEATS: Record<PaperWarMove, PaperWarMove> = {
  ATTACK_FORM: 'BLUFF',
  BLUFF: 'DEFEND_RECEIPT',
  DEFEND_RECEIPT: 'ATTACK_FORM',
}

const getInspectorMove = () => {
  const choices = Object.keys(PAPER_WAR_BEATS) as PaperWarMove[]
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)
    crypto.getRandomValues(buffer)
    return choices[buffer[0] % choices.length]
  }
  return choices[Math.floor(Math.random() * choices.length)]
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
  ;['rahat', 'jarki', 'maine'].forEach((key) => {
    const typedKey = key as keyof Stats
    if (delta[typedKey] !== undefined) {
      next[typedKey] = (next[typedKey] ?? 0) + (delta[typedKey] ?? 0)
    }
  })
  return next
}

const formatEffectSummary = (effects: Partial<Stats>) => {
  const statLabels: Record<'rahat' | 'jarki' | 'maine', string> = {
    rahat: 'Rahat',
    jarki: 'Järki',
    maine: 'Maine',
  }

  const statKeys = ['rahat', 'jarki', 'maine'] as const

  const chunks = statKeys
    .map((typedKey) => {
      const value = effects[typedKey]
      if (value === undefined) return null
      const label = typedKey === 'rahat' ? `${statLabels.rahat} (mk)` : statLabels[typedKey]
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
  inventory: Item[]
  fallbackMedia: NonNullable<GameEvent['media']>
  locked: boolean
  outcome: string | null
  onResolve: (result: PaperWarResolution) => void
  onNextPhase: () => void
  isGlitching?: boolean
}

const PaperWar = ({
  event,
  stats,
  inventory,
  fallbackMedia,
  locked,
  outcome,
  onResolve,
  onNextPhase,
  isGlitching,
}: PaperWarProps) => {
  const media = useMemo(() => event.media ?? fallbackMedia, [event.media, fallbackMedia])
  const [rounds, setRounds] = useState<RoundLog[]>([])
  const [pendingEffects, setPendingEffects] = useState<Partial<Stats>>({})
  const [localSanity, setLocalSanity] = useState(stats.jarki)
  const [localMoney, setLocalMoney] = useState(stats.rahat)
  const [finished, setFinished] = useState(false)
  const [sanityShield, setSanityShield] = useState(0)
  const [usedSpecials, setUsedSpecials] = useState<Record<string, boolean>>({})
  const [networkPeeked, setNetworkPeeked] = useState(false)

  const activeTags = useMemo(() => new Set(inventory.flatMap((item) => item.tags ?? [])), [inventory])
  const relicGuard = useMemo(() => inventory.some((item) => item.type === 'relic'), [inventory])

  const wins = rounds.filter((entry) => entry.result === 'win').length
  const losses = rounds.filter((entry) => entry.result === 'loss').length
  const draws = rounds.filter((entry) => entry.result === 'draw').length
  const resolutionTone: RoundOutcome | null = outcome ? (wins > losses ? 'win' : losses > wins ? 'loss' : 'draw') : null
  const resultColor =
    resolutionTone === 'win' ? '#22C55E' : resolutionTone === 'loss' ? '#EF4444' : '#9CA3AF'
  const resultClassName =
    resolutionTone === 'win' ? 'paperwar-result--win' : resolutionTone === 'loss' ? 'paperwar-result--loss' : ''
  const labelForResult = resolutionTone === 'win' ? 'VOITTO' : resolutionTone === 'loss' ? 'HÄVIÖ' : 'TASAPELI'

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRounds([])
    setPendingEffects({})
    setLocalSanity(stats.jarki)
    setLocalMoney(stats.rahat)
    setFinished(false)
    setSanityShield(0)
    setUsedSpecials({})
    setNetworkPeeked(false)
  }, [event.id, stats.jarki, stats.rahat])
  /* eslint-enable react-hooks/set-state-in-effect */

  type SpecialMove = {
    id: string
    label: string
    detail: string
    icon: string
    onUse: () => void
  }

  const applyRound = useCallback(
    (
      playerMove: PaperWarMove,
      inspectorMove: PaperWarMove,
      result: RoundOutcome,
      note: string,
      effectOverride?: Partial<Stats>,
    ) => {
    if (locked || finished) return

    const eventTags = event.tags ?? []
    let resolvedResult = result
    let resolvedNote = note

    if (activeTags.has('tax') && eventTags.includes('tax') && resolvedResult === 'loss') {
      resolvedResult = 'draw'
      resolvedNote = `${resolvedNote} Verokirje pehmentää iskun.`
    }

    if (activeTags.has('network') && !networkPeeked && resolvedResult === 'loss') {
      setNetworkPeeked(true)
      resolvedResult = 'draw'
      resolvedNote = `${resolvedNote} Net Monitor paljastaa siirron.`
    }

    if (activeTags.has('form') && resolvedResult === 'draw') {
      resolvedResult = 'win'
      resolvedNote = `${resolvedNote} Lomake 5057e kääntää tilanteen.`
    }

    const roundEffect: Partial<Stats> =
      effectOverride ??
      (resolvedResult === 'win'
        ? { maine: 5, rahat: 40, jarki: -2 }
        : resolvedResult === 'loss'
          ? { jarki: -12, rahat: -50, maine: -3 }
          : { jarki: -6, rahat: -10 })

    let adjustedEffect = { ...roundEffect }
    if (adjustedEffect.jarki !== undefined && adjustedEffect.jarki < 0 && sanityShield > 0) {
      const mitigation = Math.min(sanityShield, Math.abs(adjustedEffect.jarki))
      adjustedEffect = { ...adjustedEffect, jarki: adjustedEffect.jarki + mitigation }
      setSanityShield((prev) => Math.max(prev - mitigation, 0))
    }

    if (relicGuard && resolvedResult === 'loss') {
      adjustedEffect.jarki = (adjustedEffect.jarki ?? 0) + 3
      resolvedNote = `${resolvedNote} (Relic suojaa mieltä.)`
    }

    if (activeTags.has('tourist') && resolvedResult === 'win') {
      adjustedEffect.maine = (adjustedEffect.maine ?? 0) + 2
    }

    const nextEffects = mergeEffects(pendingEffects, adjustedEffect)
    const nextRounds = [
      ...rounds,
      { round: rounds.length + 1, playerMove, inspectorMove, result: resolvedResult, note: resolvedNote },
    ]

    setPendingEffects(nextEffects)
    setRounds(nextRounds)
    setLocalSanity((prev) => clamp(prev + (adjustedEffect.jarki ?? 0), 0, 100))
    setLocalMoney((prev) => prev + (adjustedEffect.rahat ?? 0))

    if (nextRounds.length >= TOTAL_ROUNDS) {
      const wins = nextRounds.filter((entry) => entry.result === 'win').length
      const losses = nextRounds.filter((entry) => entry.result === 'loss').length
      const draws = nextRounds.length - wins - losses
      const effectText = formatEffectSummary(nextEffects)
      const summary = `Paper War ${wins}-${losses}-${draws}. Saldo: ${effectText || 'ei muutoksia'}.`

      setFinished(true)
      onResolve({ summary, appliedEffects: nextEffects, rounds: nextRounds })
    }
  },
    [activeTags, event.tags, finished, locked, networkPeeked, onResolve, pendingEffects, relicGuard, rounds, sanityShield],
  )

  const playRound = useCallback(
    (playerMove: PaperWarMove) => {
      const inspectorMove = getInspectorMove()

      let result: RoundOutcome = 'draw'
      if (PAPER_WAR_BEATS[playerMove] === inspectorMove) result = 'win'
      else if (PAPER_WAR_BEATS[inspectorMove] === playerMove) result = 'loss'

      const note =
        result === 'win'
          ? 'Krok siristää silmää ja merkitsee kohdan: "hyväksytty hermoromahdus".'
          : result === 'loss'
            ? 'Lomake muljahtaa väärinpäin. Kuulokkeissa kuuluu lisäselvityspyyntö.'
            : 'Paperit törmäävät ilmaan. Molemmat selaatte hiljaa.'

      applyRound(playerMove, inspectorMove, result, note)
    },
    [applyRound],
  )

  const hasItem = useCallback((id: string) => inventory.some((item) => item.id === id), [inventory])

  const specialMoves: SpecialMove[] = useMemo(() => {
    const moves: SpecialMove[] = []

    if (hasItem('jaloviina')) {
      moves.push({
        id: 'bribe',
        label: 'Lahjo',
        detail: 'Tarjoat jaloviinaa tarkastajalle. Voitto, mutta markat katoavat.',
        icon: '🥃',
        onUse: () => {
          if (locked || finished || usedSpecials.bribe) return
          setUsedSpecials((prev) => ({ ...prev, bribe: true }))
          applyRound(
            'BLUFF',
            'BLUFF',
            'win',
            'Jaloviina vaihtaa omistajaa. Tarkastaja hymyilee läpi viiksien.',
            { maine: 5, rahat: -40, jarki: -2 },
          )
        },
      })
    }

    if (hasItem('nokia-2110')) {
      moves.push({
        id: 'lawyer',
        label: 'Soita lakimiehelle',
        detail: 'GSM piippaa: lakimies kiillottaa hermoasi. Järki-vahinko pehmenee.',
        icon: '📞',
        onUse: () => {
          if (locked || finished || usedSpecials.lawyer) return
          setUsedSpecials((prev) => ({ ...prev, lawyer: true }))
          setSanityShield((prev) => prev + 8)
          applyRound(
            'DEFEND_RECEIPT',
            'DEFEND_RECEIPT',
            'draw',
            'Lakimies lähettää faksin: "Pidä pää kylmänä, lasken vahingot puolestasi."',
            { jarki: -1, rahat: -10, maine: 2 },
          )
        },
      })
    }

    if (hasItem('lomake-5057e')) {
      moves.push({
        id: 'form-override',
        label: 'Lisäliite 5057e',
        detail: 'Kumarrat byrokratian henkeä. Kierros kääntyy eduksesi.',
        icon: '📑',
        onUse: () => {
          if (locked || finished || usedSpecials['form-override']) return
          setUsedSpecials((prev) => ({ ...prev, 'form-override': true }))
          applyRound(
            'ATTACK_FORM',
            'DEFEND_RECEIPT',
            'win',
            'Salainen liite kolahtaa pöytään. Krok nyökkää väsyneesti.',
            { maine: 4, rahat: 25, jarki: -1 },
          )
        },
      })
    }

    if (activeTags.has('network')) {
      moves.push({
        id: 'packet-trace',
        label: 'Kuuntele linjaa',
        detail: 'Sniffaat tarkastajan makrot. Voitto pienellä rahamenolla.',
        icon: '📡',
        onUse: () => {
          if (locked || finished || usedSpecials['packet-trace']) return
          setUsedSpecials((prev) => ({ ...prev, 'packet-trace': true }))
          applyRound(
            'ATTACK_FORM',
            'BLUFF',
            'win',
            'Kuuloke rätisee: kuulet seuraavan siirron ja isket oikeaan kohtaan.',
            { rahat: -20, maine: 4, jarki: -1 },
          )
        },
      })
    }

    if (activeTags.has('occult') || relicGuard) {
      moves.push({
        id: 'staalo-sinetti',
        label: 'Staalo-sinetti',
        detail: 'Uhraat relikin. Käännät kierroksen tasapeliksi ja vahvistat mieltä.',
        icon: '🧿',
        onUse: () => {
          if (locked || finished || usedSpecials['staalo-sinetti']) return
          setUsedSpecials((prev) => ({ ...prev, 'staalo-sinetti': true }))
          applyRound(
            'BLUFF',
            'ATTACK_FORM',
            'draw',
            'Sinetti välähtää violetissa. Tarkastaja hämmentyy ja vetäytyy hetkeksi.',
            { jarki: 3, maine: -1 },
          )
        },
      })
    }

    return moves
  }, [activeTags, applyRound, finished, hasItem, locked, relicGuard, usedSpecials])

  return (
    <div
      className={`panel relative space-y-4 bg-asphalt/60 ${isGlitching ? 'glitch-veil' : ''}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5, 8, 17, 0.9), rgba(5, 8, 17, 0.82)), url(${MediaRegistry.paperWarResultBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-repeat bg-[linear-gradient(90deg,rgba(255,0,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neon/70">Byrokratia-taistelu</p>
            <h2 className="text-2xl font-bold glitch-text" data-text={event.id}>
              {event.id}
            </h2>
          </div>
          <div className="text-right text-xs text-neon uppercase tracking-[0.2em] space-y-1">
            <div>Kierros {Math.min(rounds.length + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</div>
            <div className="flex items-center gap-2 text-[10px] text-slate-200">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-300/40">W {wins}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/40">D {draws}</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-300/40">L {losses}</span>
            </div>
          </div>
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

        {specialMoves.length > 0 && (
          <div className="border border-neon/30 bg-coal/70 p-3 rounded space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neon/70">Special moves</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {specialMoves.map((move) => (
                <button
                  key={move.id}
                  className={`text-left border border-neon/50 px-3 py-2 bg-black/40 hover:bg-neon/10 transition ${
                    locked || finished || usedSpecials[move.id]
                      ? 'opacity-40 cursor-not-allowed'
                      : 'shadow-neon'
                  }`}
                  onClick={move.onUse}
                  disabled={locked || finished || usedSpecials[move.id]}
                  type="button"
                >
                  <div className="flex items-center gap-2 text-neon font-semibold">
                    <span>{move.icon}</span>
                    <span>{move.label}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">{move.detail}</p>
                  {usedSpecials[move.id] && <p className="text-[10px] text-amber-200">Käytetty</p>}
                  {sanityShield > 0 && move.id === 'lawyer' && (
                    <p className="text-[10px] text-lime-200">Järki-suoja: {sanityShield.toFixed(0)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.jarki.label}</p>
            <p className="text-lg font-semibold">{canonicalStats.jarki.format(localSanity)}</p>
            <p className="text-[11px] text-slate-300">Kestääkö järki vai viekö suljettu osasto.</p>
          </div>
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">{canonicalStats.rahat.label}</p>
            <p className="text-lg font-semibold">{canonicalStats.rahat.format(localMoney)}</p>
            <p className="text-[11px] text-slate-300">Älä anna velan upota alle -1000 mk.</p>
          </div>
          <div className="border border-neon/30 p-3 bg-coal/60 rounded">
            <p className="text-xs uppercase tracking-[0.2em] text-neon/60">Lokit</p>
            <p className="text-[11px] text-slate-300">{formatEffectSummary(pendingEffects) || 'Ei muutoksia vielä.'}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {rounds.length === 0 && <p className="text-slate-300">Paperit leijuvat ilmassa. Valitse ensimmäinen siirto.</p>}
          {rounds.map((entry) => (
            <div key={entry.round} className="border-l-2 border-neon pl-3 py-1 bg-black/30 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neon/70">Kierros {entry.round}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.25em] ${
                    entry.result === 'win'
                      ? 'bg-emerald-500/20 border border-emerald-300/50 text-emerald-100'
                      : entry.result === 'loss'
                        ? 'bg-rose-500/20 border border-rose-300/50 text-rose-100'
                        : 'bg-amber-500/20 border border-amber-300/50 text-amber-100'
                  }`}
                >
                  {entry.result}
                </span>
              </div>
              <p className="font-semibold text-slate-100">
                Sinä: {moveMeta[entry.playerMove].label} vs. Krok: {moveMeta[entry.inspectorMove].label}
              </p>
              <p className="text-xs text-slate-300">{entry.note}</p>
            </div>
          ))}
        </div>

        {outcome && (
          <div
            className="paperwar-outcome border-2 border-dashed border-neon/70 p-4 shadow-inner text-sm"
            style={{
              backgroundImage: `linear-gradient(160deg, rgba(5, 8, 17, 0.92), rgba(5, 8, 17, 0.8)), url(${MediaRegistry.paperWarResultBg})`,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon">Loppusumma</p>
            <div className="mt-3 flex flex-col items-center gap-2 text-center">
              <div className={`paperwar-result-label ${resultClassName}`} style={{ color: resultColor }}>
                {labelForResult}
              </div>
              <p
                className={`text-xl md:text-2xl font-black tracking-wide max-w-3xl ${
                  resolutionTone === 'win'
                    ? 'text-emerald-200'
                    : resolutionTone === 'loss'
                      ? 'text-rose-200'
                      : 'text-amber-100'
                }`}
              >
                {outcome}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-slate-200 uppercase tracking-[0.2em]">
                Paperit rypistyvät, faksi sylkee viimeisen kuittauksen.
              </div>
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
