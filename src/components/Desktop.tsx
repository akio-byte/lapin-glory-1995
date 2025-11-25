import type { ReactNode } from 'react'
import '../App.css'

const Desktop = ({ children, taskbar }: { children: ReactNode; taskbar?: ReactNode }) => (
  <div className="desktop-root">
    <div className="desktop-aurora" aria-hidden />
    <div className="desktop-shell">
      <div className="desktop-stage">{children}</div>
      {taskbar}
    </div>
  </div>
)

export default Desktop
