import './App.css'
import Desktop from './components/Desktop'
import GameShell from './components/GameShell'
import ParticleBackground from './components/ParticleBackground'

function App() {
  return (
    <div className="app-root text-white">
      <ParticleBackground />
      <Desktop>
        <GameShell />
      </Desktop>
    </div>
  )
}

export default App
