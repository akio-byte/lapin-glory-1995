import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NetMonitorReading } from '../hooks/useGameLoop'

const pixelVibes = `
@keyframes jitter {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-1px, 0); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(0, 1px); }
  80% { transform: translate(1px, 1px); }
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}`

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const stageMessages = {
  calm: ['Verkko ok. Turistiystävällinen latenssi.', 'Kenttä: tyyni. Tukiasemat humisevat kuin hiljainen suo.'],
  weird: ['Revontuli-kanava auki. Linjassa kuiskitaan.', 'Net Monitor kuiskaa: LAI aaltoilee kuin Lapinmeri.'],
  glitch: ['Häiriöitä: signaali nykii kuin VHS-lumi. LAI aaltoilee.', 'Signaali vääristyy, maahinen rummuttaa antennia.'],
  severe: ['Staalo häiritsee. Todellisuus repeää.', 'Staalo syöttää outoa puhetta. GSM-kanava välkkyy verenpunaisena.'],
}

type NokiaPhoneProps = {
  lai: number
  jarki?: number
  onPing?: () => NetMonitorReading | void
  nextNightEventHint?: string | null
  className?: string
}

type Stage = 'calm' | 'weird' | 'glitch' | 'severe'

const stageFromLai = (lai: number): Stage => {
  if (lai >= 80) return 'severe'
  if (lai >= 50) return 'glitch'
  if (lai >= 20) return 'weird'
  return 'calm'
}

const NokiaPhone = ({ lai, jarki = 100, onPing, nextNightEventHint, className }: NokiaPhoneProps) => {
  const [localLai, setLocalLai] = useState(lai)
  const [readout, setReadout] = useState('Verkko ok. Turistiystävällinen latenssi.')
  const [lastDelta, setLastDelta] = useState<number | null>(null)
  const [signalDbm, setSignalDbm] = useState(-92)
  const [pingMs, setPingMs] = useState(120)
  const [prophecy, setProphecy] = useState<string | null>(nextNightEventHint ?? null)
  const [isCompact, setIsCompact] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    setLocalLai(lai)
  }, [lai])

  useEffect(() => {
    setProphecy(nextNightEventHint ?? null)
  }, [nextNightEventHint])

  const stage = useMemo(() => stageFromLai(localLai), [localLai])
  const isGlitch = stage === 'glitch' || stage === 'severe' || jarki < 20

  const uiState: Record<Stage, { label: string; hint: string; color: string }> = {
    calm: { label: 'Kenttä tyyni', hint: 'Maahiset nukkuu', color: 'text-emerald-200' },
    weird: { label: 'Outo humina', hint: 'Revontuli-taajuus heiluu', color: 'text-amber-200' },
    glitch: { label: 'Glitch-kanava', hint: 'Signaali vääristyy', color: 'text-amber-100' },
    severe: { label: 'Staalo-linja', hint: 'Rituaalinen häiriö', color: 'text-rose-200' },
  }

  const glitchSalt = 404
  const glitchify = useCallback((message: string) => {
    return isGlitch ? `${message} // ${glitchSalt}Hz` : message
  }, [isGlitch])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncCompact = () => {
      setIsCompact(window.innerHeight < 780)
    }
    syncCompact()
    window.addEventListener('resize', syncCompact)
    return () => window.removeEventListener('resize', syncCompact)
  }, [])

  useEffect(() => {
    if (isCompact) {
      setIsMinimized(true)
    }
  }, [isCompact])

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev)
  }, [])

  const containerClass = ['fixed z-50 nokia-shell', className, isCompact ? 'nokia-shell--compact' : '']
    .filter(Boolean)
    .join(' ')

  const handlePing = () => {
    const result = onPing?.()
    const fallbackLai = clamp(localLai + (Math.random() * 6 - 2), 0, 100)
    const nextLai = result && 'newLai' in result ? result.newLai : fallbackLai
    const nextStage = stageFromLai(nextLai)

    setLocalLai(nextLai)
    setSignalDbm(result && 'signalDbm' in result ? result.signalDbm : Math.floor(-108 + Math.random() * 24))
    setPingMs(result && 'pingMs' in result ? result.pingMs : Math.round(40 + Math.random() * 200))
    setLastDelta(result && 'laiDelta' in result ? result.laiDelta : Math.round(nextLai - localLai))
    if (result && 'hint' in result && result.hint) {
      setProphecy(result.hint)
    }

    const pool = stageMessages[nextStage]
    const baseMessage = (result && 'message' in result ? result.message : pool[Math.floor(Math.random() * pool.length)]) ??
      stageMessages.calm[0]
    setReadout(glitchify(baseMessage))
  }

  return (
    <div className={containerClass} style={{ fontFamily: '"VT323", "IBM Plex Mono", monospace' }}>
      <style>{pixelVibes}</style>
      <div
        className={`bg-lime-900/80 text-green-200 border-4 border-lime-700 rounded-2xl shadow-[0_0_22px_rgba(110,130,0,0.6)] ${
          isCompact ? 'w-56' : 'w-64'
        }`}
        style={{ maxHeight: 'calc(100vh - var(--taskbar-height, 58px) - 1rem)' }}
      >
        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-[0.25em] bg-lime-800/70 border-b border-lime-700 gap-2">
          <span>Net Monitor</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isGlitch ? 'animate-[jitter_0.6s_infinite]' : ''}`}>
              LAI {localLai.toFixed(0)}
            </span>
            <button
              className="px-2 py-0.5 text-[11px] rounded bg-lime-900/80 border border-lime-700 hover:bg-lime-800"
              onClick={toggleMinimize}
              type="button"
              aria-label={isMinimized ? 'Avaa Net Monitor' : 'Pienennä Net Monitor'}
            >
              {isMinimized ? '▢' : '–'}
            </button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-lime-950/50 text-sm leading-tight space-y-2">
            <div className={`${isGlitch ? 'animate-[jitter_0.5s_infinite] text-lime-200' : 'text-lime-100'}`}>
              <p>{readout}</p>
              <p className={`text-xs uppercase tracking-[0.2em] ${uiState[stage].color}`}>
                LAI {localLai.toFixed(0)} — {uiState[stage].label}
              </p>
              <p className="text-[11px] text-lime-300/80">{uiState[stage].hint}</p>
              {lastDelta !== null && (
                <p className="text-[11px] text-lime-300/70">Δ LAI: {lastDelta > 0 ? '+' : ''}{lastDelta.toFixed(0)}</p>
              )}
              {prophecy && (
                <p className="text-[11px] text-lime-200 font-semibold">{glitchify(prophecy)}</p>
              )}
            </div>
            <div
              className={`grid grid-cols-2 gap-2 text-xs ${stage === 'glitch' || stage === 'severe' ? 'animate-[pulse_1.4s_infinite]' : ''}`}
            >
              <div className="border border-lime-700/60 bg-lime-900/50 px-2 py-1 rounded">
                <p className="uppercase tracking-[0.2em]">Signal</p>
                <p className="text-sm font-semibold">{signalDbm} dBm</p>
              </div>
              <div className="border border-lime-700/60 bg-lime-900/50 px-2 py-1 rounded">
                <p className="uppercase tracking-[0.2em]">Ping</p>
                <p className="text-sm font-semibold">{pingMs} ms</p>
              </div>
            </div>
            <div className={`pt-2 ${isCompact ? 'text-[13px]' : ''}`}>
              <button
                className="w-full bg-lime-800/60 border border-lime-600 text-lime-100 uppercase tracking-[0.2em] text-xs py-1 hover:bg-lime-700"
                onClick={handlePing}
                type="button"
              >
                Pingaa verkkoa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NokiaPhone
