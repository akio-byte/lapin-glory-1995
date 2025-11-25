import type { ReactNode } from 'react'
import '../App.css'

const Desktop = ({
  children,
  taskbar,
  isJarkiHit = false,
}: {
  children: ReactNode
  taskbar?: ReactNode
  isJarkiHit?: boolean
}) => (
  <div className={`desktop-root ${isJarkiHit ? 'desktop-root--jarki-hit' : ''}`}>
    <div className="desktop-aurora" aria-hidden />
    <div className="desktop-shell">
      <div className="desktop-stage">{children}</div>
      {taskbar}
    </div>
  </div>
)

export default Desktop
