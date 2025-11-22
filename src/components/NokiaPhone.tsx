import { useEffect, useMemo, useState } from 'react'
import type { NetMonitorReading } from '../hooks/useGameLoop'

type NokiaPhoneProps = {
  sanity: number
  lai: number
  onPing?: () => NetMonitorReading | void
}

const pixelVibes = `
@keyframes jitter {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-1px, 0); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(0, 1px); }
  80% { transform: translate(1px, 1px); }
}
`

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const NokiaPhone = ({ sanity, lai, onPing }: NokiaPhoneProps) => {
  const [localLai, setLocalLai] = useState(lai)
  const [readout, setReadout] = useState('Signal: -85dBm')
  const [lastDelta, setLastDelta] = useState<number | null>(null)

  useEffect(() => {
    setLocalLai(lai)
  }, [lai])

  const band = useMemo(() => {
    if (localLai > 60) return 'rift'
    if (localLai > 20) return 'odd'
    return 'calm'
  }, [localLai]) as NetMonitorReading['band']

  const isGlitch = sanity < 20 || band === 'rift'

  const bandCopy: Record<NetMonitorReading['band'], { label: string; hint: string; color: string }> = {
    calm: { label: 'Kenttä tyyni', hint: 'Maahiset nukkuu', color: 'text-emerald-200' },
    odd: { label: 'Outo humina', hint: 'Revontuli-taajuus heiluu', color: 'text-amber-200' },
    rift: { label: 'Staalo-linja', hint: 'Rituaalinen häiriö', color: 'text-rose-200' },
  }

  const handlePing = () => {
    const result = onPing?.()
    const nextLai = result && 'newLai' in result ? result.newLai : clamp(localLai + (Math.random() * 6 - 3), 0, 100)
    setLocalLai(nextLai)
    if (result && 'laiDelta' in result) {
      setLastDelta(result.laiDelta)
    } else {
      setLastDelta(null)
    }
    if (result && 'message' in result) {
      setReadout(result.message)
    } else {
      setReadout(nextLai > 60 ? 'GSM-kanava ritisee, jotain laulua kuuluu.' : 'Kenttä pingattu, linja pysyy kasassa.')
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50" style={{ fontFamily: '"VT323", "IBM Plex Mono", monospace' }}>
      <style>{pixelVibes}</style>
      <div className="w-64 bg-lime-900/80 text-green-200 border-4 border-lime-700 rounded-2xl shadow-[0_0_22px_rgba(110,130,0,0.6)]">
        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-[0.25em] bg-lime-800/70 border-b border-lime-700">
          <span>Net Monitor</span>
          <span className={`font-bold ${isGlitch ? 'animate-[jitter_0.6s_infinite]' : ''}`}>
            Mieli {sanity}
          </span>
        </div>
        <div className="p-4 bg-lime-950/50 text-sm leading-tight space-y-1">
          <p className={`${isGlitch ? 'animate-[jitter_0.5s_infinite] text-lime-200' : 'text-lime-100'}`}>{readout}</p>
          <p className={`text-xs uppercase tracking-[0.2em] ${bandCopy[band].color}`}>
            LAI {localLai} — {bandCopy[band].label}
          </p>
          <p className="text-[11px] text-lime-300/80">{bandCopy[band].hint}</p>
          {lastDelta !== null && (
            <p className="text-[11px] text-lime-300/70">Δ LAI: {lastDelta > 0 ? '+' : ''}{lastDelta.toFixed(0)}</p>
          )}
          <div className="pt-2">
            <button
              className="w-full bg-lime-800/60 border border-lime-600 text-lime-100 uppercase tracking-[0.2em] text-xs py-1 hover:bg-lime-700"
              onClick={handlePing}
              type="button"
            >
              Pingaa verkkoa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NokiaPhone
