type NokiaPhoneProps = {
  sanity: number
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

const NokiaPhone = ({ sanity }: NokiaPhoneProps) => {
  const isGlitch = sanity < 20
  const message = isGlitch ? (Math.random() > 0.5 ? 'RUN: DIE' : 'GHOST: 100%') : 'Signal: -85dBm'

  return (
    <div className="fixed bottom-5 right-5 z-50" style={{ fontFamily: '"VT323", "IBM Plex Mono", monospace' }}>
      <style>{pixelVibes}</style>
      <div className="w-64 bg-lime-900/80 text-green-200 border-4 border-lime-700 rounded-2xl shadow-[0_0_22px_rgba(110,130,0,0.6)]">
        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-[0.25em] bg-lime-800/70 border-b border-lime-700">
          <span>Net Monitor</span>
          <span className={`font-bold ${isGlitch ? 'animate-[jitter_0.6s_infinite]' : ''}`}>Mieli {sanity}</span>
        </div>
        <div className="p-4 bg-lime-950/50 text-sm leading-tight space-y-1">
          <p className={`${isGlitch ? 'animate-[jitter_0.5s_infinite] text-lime-200' : 'text-lime-100'}`}>{message}</p>
          {!isGlitch && (
            <>
              <p>CellID: 48B | LAC: 112</p>
              <p>Ping: 55 ms | MCC/MNC 244/91</p>
            </>
          )}
          {isGlitch && <p>Revontuli-kanava: kuiskaus kuuluu linjassa.</p>}
        </div>
      </div>
    </div>
  )
}

export default NokiaPhone
