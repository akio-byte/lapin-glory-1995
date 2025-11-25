import PhaseWindow, { type PhaseViewProps } from './PhaseWindow'
import { MediaRegistry } from '../../data/mediaRegistry'

const DayPhaseView = (props: PhaseViewProps) => (
  <div
    className="phase-view-root day-view-root"
    style={{
      backgroundImage: `linear-gradient(160deg, rgba(5, 9, 18, 0.86), rgba(5, 9, 18, 0.78)), url(${MediaRegistry.dayViewBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className="phase-view-overlay">
      <PhaseWindow phase="DAY" {...props} />
    </div>
  </div>
)

export default DayPhaseView
