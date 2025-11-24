import type { ReactNode } from 'react'
import './ItemCard.css'

type ItemCardProps = {
  symbol: ReactNode
  label?: string
}

const ItemCard = ({ symbol, label }: ItemCardProps) => {
  return (
    <div className="item-card" aria-label={label ? `Item card for ${label}` : 'Item card template'}>
      <div className="item-card__frame">
        <div className="item-card__accent-ring" aria-hidden="true" />
        <div className="item-card__glitch-lines" aria-hidden="true" />
        <div className="item-card__glow-bleed" aria-hidden="true" />
        <div className="item-card__symbol-wrap">
          <div className="item-card__symbol" aria-hidden="true">
            {symbol}
          </div>
        </div>
        <div className="item-card__label-slot" aria-hidden="true" />
      </div>
    </div>
  )
}

export default ItemCard
