import '../App.css'

const JournalWindow = ({ entries }: { entries: string[] }) => (
  <div className="space-y-3" style={{ fontFamily: 'VT323, DM Mono, monospace' }}>
    <p className="text-xs uppercase tracking-[0.3em] text-neon">Lokikone</p>
    <div className="bg-black/40 border border-neon/30 rounded p-3 max-h-[60vh] overflow-y-auto space-y-2 text-sm">
      {entries.length === 0 && <p className="text-slate-400">Ei merkintöjä vielä.</p>}
      {entries.map((entry, idx) => (
        <p key={`${entry}-${idx}`} className="text-neon/80">
          {entry}
        </p>
      ))}
    </div>
  </div>
)

export default JournalWindow
