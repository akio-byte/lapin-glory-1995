import { useEffect, useState } from 'react'
import type { Stats } from '../data/gameData'

export const DEBUG_TOGGLE_KEY = 'd'

type DebugPanelProps = {
  phase: string
  currentEventId?: string
  stats: Stats
  isGlitching: boolean
}

const DebugPanel = ({ phase, currentEventId, stats, isGlitching }: DebugPanelProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === DEBUG_TOGGLE_KEY) {
        setVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs text-xs bg-black/80 border border-neon/50 rounded-md shadow-xl p-4 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neon/80">
        <span>Debug Overlay</span>
        <span className="text-[9px]">Key: {DEBUG_TOGGLE_KEY.toUpperCase()}</span>
      </div>
      <div className="space-y-1 text-slate-100">
        <p>
          <span className="text-neon/80 mr-1">Current Phase:</span>
          {phase}
        </p>
        <p>
          <span className="text-neon/80 mr-1">Game Event ID:</span>
          {currentEventId ?? '—'}
        </p>
        <p>
          <span className="text-neon/80 mr-1">Sanity / Money / Reputation:</span>
          {`${stats.jarki} / ${stats.rahat} / ${stats.maine}`}
        </p>
        <p>
          <span className="text-neon/80 mr-1">IsGlitching:</span>
          {isGlitching ? 'true' : 'false'}
        </p>
      </div>
      <button
        className="w-full mt-2 text-center border border-neon/60 bg-neon/10 text-neon hover:bg-neon/20 transition-colors py-1 rounded"
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
      >
        Reset State
      </button>
    </div>
  )
}

export default DebugPanel
