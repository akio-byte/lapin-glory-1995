import PhaseWindow, { type PhaseViewProps } from './PhaseWindow'
import { MediaRegistry } from '../../data/mediaRegistry'

const NightPhaseView = (props: PhaseViewProps) => (
  <div
    className="phase-view-root night-view-root"
    style={{
      backgroundImage: `linear-gradient(180deg, rgba(5, 8, 17, 0.9), rgba(5, 8, 17, 0.82)), url(${MediaRegistry.nightViewBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className="phase-view-overlay">
      <PhaseWindow phase="NIGHT" {...props} />
    </div>
  </div>
)

export default NightPhaseView
