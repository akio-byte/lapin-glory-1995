import '../App.css'

const SettingsWindow = ({
  muted,
  toggleMute,
  backgroundPlaying,
  toggleBackground,
  backgroundVolume,
  sfxVolume,
  onBackgroundVolumeChange,
  onSfxVolumeChange,
  textSpeed,
  onTextSpeedChange,
}: {
  muted: boolean
  toggleMute: () => void
  backgroundPlaying: boolean
  toggleBackground: () => void
  backgroundVolume: number
  sfxVolume: number
  onBackgroundVolumeChange: (value: number) => void
  onSfxVolumeChange: (value: number) => void
  textSpeed: number
  onTextSpeedChange: (value: number) => void
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-neon">Asetukset</p>
      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between bg-black/30 border border-neon/30 rounded p-3">
          <span>{muted ? 'Äänet: mykistetty' : 'Äänet: päällä'}</span>
          <button className="button-raw" onClick={toggleMute}>
            {muted ? 'Poista mykistys' : 'Mykistä'}
          </button>
        </div>
        <div className="flex items-center justify-between bg-black/30 border border-neon/30 rounded p-3">
          <span>Humina-loop</span>
          <button className="button-raw" onClick={toggleBackground} disabled={muted}>
            {backgroundPlaying ? 'Tauko' : 'Soita hiljaa'}
          </button>
        </div>
        <div className="bg-black/30 border border-neon/30 rounded p-3 space-y-3">
          <div className="space-y-1">
            <label className="flex items-center justify-between gap-3" htmlFor="bgVolume">
              <span>Taustaäänen voimakkuus</span>
              <span className="text-xs text-neon">{Math.round(backgroundVolume * 100)}%</span>
            </label>
            <input
              id="bgVolume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={backgroundVolume}
              onChange={(event) => onBackgroundVolumeChange(parseFloat(event.target.value))}
              className="w-full accent-neon"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between gap-3" htmlFor="sfxVolume">
              <span>Efektien voimakkuus</span>
              <span className="text-xs text-neon">{Math.round(sfxVolume * 100)}%</span>
            </label>
            <input
              id="sfxVolume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxVolume}
              onChange={(event) => onSfxVolumeChange(parseFloat(event.target.value))}
              className="w-full accent-neon"
            />
          </div>
        </div>
        <div className="bg-black/30 border border-neon/30 rounded p-3 space-y-2">
          <label className="flex items-center justify-between gap-3" htmlFor="textSpeed">
            <span>Tekstin glitch-tahti</span>
            <span className="text-xs text-neon">{textSpeed.toFixed(1)}s</span>
          </label>
          <input
            id="textSpeed"
            type="range"
            min={1.2}
            max={4}
            step={0.2}
            value={textSpeed}
            onChange={(event) => onTextSpeedChange(parseFloat(event.target.value))}
            className="w-full accent-neon"
          />
          <p className="text-xs text-slate-300">Hidasta jos silmät väsyy, nopeuta jos faksi palaa.</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsWindow
