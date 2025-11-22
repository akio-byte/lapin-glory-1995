import { useEffect, useMemo, useState } from 'react'

type NokiaPhoneProps = {
  stats: {
    sanity: number
  }
}

const pixelVibes = `
@keyframes jitter {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-1px, 0); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(0, 1px); }
  80% { transform: translate(1px, 1px); }
}
`;

const LCD_BASE_CLASSES =
  'bg-lime-900/70 text-green-200 border-4 border-lime-700 shadow-[0_0_20px_rgba(110,130,0,0.45)] font-mono'

const NokiaPhone = ({ stats }: NokiaPhoneProps) => {
  const [open, setOpen] = useState(true)
  const [lines, setLines] = useState<string[]>([])

  const aliveDiagnostics = useMemo(
    () => [
      () => `CellID: ${450 + Math.floor(Math.random() * 120)}`,
      () => `Signal: -${70 + Math.floor(Math.random() * 25)} dBm`,
      () => `MCC/MNC: 244 / 91`,
      () => `LAC: ${100 + Math.floor(Math.random() * 50)}`,
      () => `BTS: ${10 + Math.floor(Math.random() * 10)} | TA: ${Math.floor(Math.random() * 5)}`,
      () => `Ping: ${40 + Math.floor(Math.random() * 60)} ms`,
    ],
    [],
  )

  const glitchFeeds = useMemo(
    () => [
      'RUN: DIE',
      'GHOST: 100%',
      '404: SOUL NOT FOUND',
      'KANTO: ████ / ████',
      'FONI: LINJA SÄRÖÖ',
      'KAIKU: ÄÄNI ÄÄNI',
      'RUNO: \u16b1\u16a0\u16b1',
    ],
    [],
  )

  useEffect(() => {
    const tick = () => {
      if (stats.sanity > 20) {
        setLines(aliveDiagnostics.map((fn) => fn()))
      } else {
        const shuffled = [...glitchFeeds].sort(() => Math.random() - 0.5)
        setLines(shuffled.slice(0, 4))
      }
    }

    tick()
    const id = window.setInterval(tick, 2500)
    return () => window.clearInterval(id)
  }, [aliveDiagnostics, glitchFeeds, stats.sanity])

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: '"VT323", "IBM Plex Mono", monospace' }}>
      <style>{pixelVibes}</style>
      <div
        className={`relative w-72 transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-80'}`}
      >
        <div className="absolute -top-3 right-2 text-[10px] tracking-[0.2em] text-lime-200">NET MONITOR</div>
        <div className={`${LCD_BASE_CLASSES} rounded-2xl p-4 pb-6 bg-gradient-to-br from-lime-900/80 to-lime-800/60`}>
          <div className="flex items-center justify-between mb-3 uppercase text-xs">
            <span className="tracking-[0.25em] text-lime-100">NOKIA 2110</span>
            <button
              className="px-2 py-1 border border-lime-700 bg-lime-800/60 text-[11px] font-bold hover:bg-lime-700/60"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? 'Piilota' : 'Avaa'}
            </button>
          </div>

          {open && (
            <div className="space-y-2 bg-lime-950/40 p-3 rounded-lg border border-lime-700/60">
              <div className="flex items-center justify-between text-[11px] uppercase">
                <span>Lauma: Kenttä</span>
                <span className={`font-bold ${stats.sanity <= 20 ? 'animate-[jitter_0.4s_infinite]' : ''}`}>
                  Mieli {stats.sanity}
                </span>
              </div>
              <div className="text-sm leading-tight tracking-wide">
                {lines.map((line, idx) => (
                  <p
                    key={`${line}-${idx}`}
                    className={`${stats.sanity <= 20 ? 'animate-[jitter_0.5s_infinite]' : ''}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
              <div className="text-[10px] uppercase text-lime-300/80 flex items-center justify-between">
                <span>Saapuva faksi</span>
                <span>Revontuli Link</span>
              </div>
            </div>
          )}

          {!open && <div className="text-sm text-lime-200">Net Monitor parkissa</div>}
        </div>
        <div className="absolute inset-x-6 -bottom-3 h-4 bg-lime-950/80 rounded-full blur-md" />
      </div>
    </div>
  )
}

export default NokiaPhone
