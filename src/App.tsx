import { useRef, useState } from 'react'
import './App.css'
import GameShell from './components/GameShell'
import { theme } from './theme'

function App() {
  const [started, setStarted] = useState(false)
  const gameRef = useRef<HTMLDivElement | null>(null)

  const startSimulation = () => {
    if (!started) {
      setStarted(true)
    }
    window.requestAnimationFrame(() => {
      gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="min-h-screen bg-[#050912] text-white">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0c1626] via-[#0b1321] to-[#050912]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_10%,rgba(38,214,209,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(124,245,255,0.2),transparent_35%)]" />
        <section className="relative max-w-5xl mx-auto px-6 py-16 space-y-6">
          <p className="text-sm tracking-[0.35em] uppercase" style={{ color: theme.brandColor }}>
            Lapland AI Lab ❄︎
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold" style={{ color: theme.accentColor }}>
                Lapland AI Lab – Lapin Glory OS/95
              </h1>
              <p className="text-lg text-slate-200 leading-relaxed">
                Tämä on tekoälyavusteinen lama-noir -johtamispeli, joka sijoittuu Rovaniemen vuoteen 1995. Kokonaisuus on syntynyt
                AI-työkaluilla (ChatGPT, Codex ym.) ja johdattaa OS/95-simulaation sydämeen.
              </p>
            </div>
            <button
              className="button-raw px-5 py-3 shadow-xl"
              style={{ borderColor: theme.brandColor, color: theme.brandColor }}
              onClick={startSimulation}
            >
              Käynnistä OS/95-simulaatio
            </button>
          </div>
        </section>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-slate-300">
          <span className="inline-block w-8 h-px" style={{ backgroundColor: theme.brandColor }} />
          <span>About this project</span>
        </div>
        <div
          className="bg-[#0b111f] border shadow-neon/50 p-6 space-y-3"
          style={{ borderColor: `${theme.brandColor}66` }}
        >
          <p className="text-slate-200">
            Lapin Glory OS/95 toimii sekä julkisena projektiesittelynä että täyden ruudun simulaationa.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Simuloi lama-ajan klubitoimintaa, faksirumbaa ja yökerhojen tasapainottamista Rovaniemen neonin alla.</li>
            <li>Rakennettu tekoälytyökaluilla: skenaariot, UI-ideointi ja sisällöt syntyivät ChatGPT:n ja Codexin avulla.</li>
            <li>Osa Lapland AI Labin kokeiluja – digitaalinen laboratorionäyte suomalaisesta 90-luvun pelko-romantiikasta.</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">By Lapland AI Lab · <a className="underline decoration-dotted" href="https://laplandailab.fi">laplandailab.fi</a></p>
      </section>

      <section ref={gameRef} className="max-w-6xl mx-auto px-6 pb-12">
        <div
          className="flex items-center justify-between gap-3 border px-4 py-3 bg-[#0c1424] shadow-neon"
          style={{ borderColor: `${theme.brandColor}66` }}
        >
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-slate-200">
            <span className="text-xl" style={{ color: theme.snowAccent }}>
              ❄︎
            </span>
            <span style={{ color: theme.brandColor }}>OS/95 Simulation Console</span>
          </div>
          {!started && (
            <button className="button-raw px-3 py-1" onClick={startSimulation}>
              Aloita
            </button>
          )}
        </div>
        <div className="mt-6 border-2" style={{ borderColor: `${theme.brandColor}4d` }}>
          {started ? (
            <GameShell />
          ) : (
            <div className="bg-[#0f1118] text-slate-300 p-10 text-center space-y-3">
              <p className="text-lg font-semibold" style={{ color: theme.accentColor }}>
                OS/95 on valmiina käynnistykseen.
              </p>
              <p className="text-sm max-w-2xl mx-auto">
                Paina käynnistystä ja hyppää suoraan Lapin Gloryn neon-hämärään. Simulaatio pyörii täyden ruudun tilassa, mutta
                palaa tähän näkymään kunnes aloitat.
              </p>
              <button className="button-raw" onClick={startSimulation}>
                Käynnistä simulaatio
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
