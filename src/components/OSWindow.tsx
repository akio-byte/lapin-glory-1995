import type { ReactNode } from 'react'
import '../App.css'

const sizeClassMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

const OSWindow = ({
  title,
  children,
  onClose,
  isActive,
  size,
}: {
  title: string
  children: ReactNode
  onClose?: () => void
  isActive: boolean
  size?: 'sm' | 'md' | 'lg'
}) => {
  return (
    <div className={`os-window ${size ? sizeClassMap[size] : ''} ${isActive ? 'ring-2 ring-neon/60' : ''}`}>
      <div className="os-window__titlebar">
        <span className="glitch-text" data-text={title}>
          {title}
        </span>
        {onClose && (
          <button className="button-raw px-3 py-1" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <div className="os-window__content">{children}</div>
    </div>
  )
}

export default OSWindow
