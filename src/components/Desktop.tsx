import type { ReactNode } from 'react'
import '../App.css'

const Desktop = ({ children, taskbar }: { children: ReactNode; taskbar?: ReactNode }) => (
  <div className="desktop-shell">
    <div className="desktop-stage">{children}</div>
    {taskbar}
  </div>
)

export default Desktop
