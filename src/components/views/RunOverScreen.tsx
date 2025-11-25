import { endingEpilogues, type EndingType } from '../../data/endingData'
import { canonicalStats } from '../../data/statMeta'
import type { Stats } from '../../data/gameData'

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

export default RunOverScreen
