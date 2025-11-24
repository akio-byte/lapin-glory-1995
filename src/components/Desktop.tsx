import type { ReactNode } from 'react'
import '../App.css'

const Desktop = ({ children, taskbar }: { children: ReactNode; taskbar?: ReactNode }) => (
  <div className="desktop-shell max-[900px]:min-h-[auto] max-[900px]:max-h-[100%]">
    <div className="desktop-stage max-[900px]:min-h-[auto] max-[900px]:max-h-[100%]">{children}</div>
    {taskbar}
  </div>
)

export default Desktop
