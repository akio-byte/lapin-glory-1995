import { useRef } from 'react'
import './App.css'
import GameShell from './components/GameShell'
import ParticleBackground from './components/ParticleBackground'
import { theme } from './theme'

function App() {
  const gameRef = useRef<HTMLDivElement | null>(null)

  const scrollToGame = () => {
    window.requestAnimationFrame(() => {
      gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 space-y-12 pb-12">
        <section className="max-w-6xl mx-auto px-6 pt-12">
          <div className="glass-panel p-8 space-y-5">
            <p className="text-sm tracking-[0.35em] uppercase" style={{ color: theme.brandColor }}>
              Lapland AI Lab ❄︎
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-neon" style={{ color: theme.accentColor }}>
                  Lapin Glory OS/95
                </h1>
                <p className="text-lg text-slate-200 leading-relaxed">
                  Tervetuloa kevyempään, neon-sumuiseen komentokeskukseen. Käynnistä simulaatio ja anna lasisten paneelien
                  paljastaa Rovaniemen 90-luvun noiran.
                </p>
              </div>
              <button className="button-raw px-5 py-3" onClick={scrollToGame}>
                Käynnistä OS/95-simulaatio
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 space-y-5">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-slate-300">
            <span className="inline-block w-8 h-px" style={{ backgroundColor: theme.brandColor }} />
            <span>About this project</span>
          </div>
          <div className="glass-panel space-y-3">
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

        <section ref={gameRef} className="max-w-6xl mx-auto px-6">
          <div className="glass-panel flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-slate-200">
              <span className="text-xl" style={{ color: theme.snowAccent }}>
                ❄︎
              </span>
              <span style={{ color: theme.brandColor }}>OS/95 Simulation Console</span>
            </div>
            <button className="button-raw px-3 py-1" onClick={scrollToGame}>
              Aloita
            </button>
          </div>
          <div className="mt-6 glass-panel p-0 overflow-hidden">
            <GameShell />
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
