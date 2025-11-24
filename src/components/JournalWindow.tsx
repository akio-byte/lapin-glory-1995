import '../App.css'

const JournalWindow = ({ entries, runHistory }: { entries: string[]; runHistory?: string[] }) => (
  <div className="space-y-3" style={{ fontFamily: 'VT323, DM Mono, monospace' }}>
    <p className="text-xs uppercase tracking-[0.3em] text-neon">Lokikone</p>
    <div className="bg-black/40 border border-neon/30 rounded p-3 max-h-[60vh] overflow-y-auto space-y-4 text-sm">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neon/70">Reaaliaikaiset merkinnät</p>
        {entries.length === 0 && <p className="text-slate-400">Ei merkintöjä vielä.</p>}
        {entries.map((entry, idx) => (
          <p key={`${entry}-${idx}`} className="text-neon/80">
            {entry}
          </p>
        ))}
      </div>
      <div className="border-t border-neon/20 pt-2 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neon/70">Run-historia</p>
        {runHistory && runHistory.length > 0 ? (
          runHistory.map((entry) => (
            <p key={entry} className="text-slate-200">
              {entry}
            </p>
          ))
        ) : (
          <p className="text-slate-500">Ei tallennettuja runejä vielä.</p>
        )}
      </div>
    </div>
  </div>
)

export default JournalWindow
