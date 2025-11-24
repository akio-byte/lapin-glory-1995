import type { Item, Stats } from '../data/gameData'
import { items as availableItems } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import type { Phase } from '../hooks/useGameLoop'
import ItemCard from './ItemCard'

const formatPrice = (price: number) => `${price} mk`

const ItemTag = ({ label }: { label: string }) => (
  <span className="text-[10px] uppercase tracking-[0.25em] text-neon">{label}</span>
)

const ShopCard = ({
  item,
  stats,
  owned,
  onBuy,
  onUse,
}: {
  item: Item
  stats: Stats
  owned: number
  onBuy: () => void
  onUse: () => void
}) => {
  const canAfford = stats.rahat >= item.price
  const meetsByroslavia = item.req_stats?.byroslavia ? stats.byroslavia >= item.req_stats.byroslavia : true
  const passiveHint = item.effects.passive ? 'Passiivinen bonus' : 'Kertakäyttö'

  return (
    <div className="border border-neon/40 bg-black/60 rounded-lg p-3 space-y-3 shadow-[0_0_14px_rgba(255,0,255,0.24)]">
      <div className="grid gap-3 md:grid-cols-[minmax(0,180px)_1fr] items-start">
        <div className="relative">
          <ItemCard symbol={<span>{item.icon}</span>} label={item.name} />
          <span className="sr-only">{item.name} korttipinta ilman nimilabelia</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <ItemTag label={item.type.toUpperCase()} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-neon font-semibold">{formatPrice(item.price)}</p>
              <p className="text-[11px] text-slate-300">{passiveHint}</p>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-snug">{item.description}</p>

          {item.req_stats?.byroslavia && (
            <p className="text-[11px] text-amber-200">Byroslavia vaadittu: {item.req_stats.byroslavia}</p>
          )}

          {owned > 0 && <p className="text-[11px] text-emerald-300">Omistat: {owned} kpl</p>}

          <div className="flex gap-2 text-xs">
            <button
              className="button-raw flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onBuy}
              disabled={!canAfford || !meetsByroslavia}
            >
              Osta
            </button>
            {owned > 0 && (
              <button className="button-raw flex-1" onClick={onUse}>
                Käytä
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Shop = ({
  phase,
  inventory,
  stats,
  onBuy,
  onUse,
}: {
  phase: Phase
  inventory: Item[]
  stats: Stats
  onBuy: (item: Item) => void
  onUse: (itemId: string) => void
}) => {
  if (phase !== 'DAY') return null

  return (
    <div className="panel bg-asphalt/70 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <ItemTag label="Päiväkauppa" />
          <p className="text-sm text-slate-200">Salkku auki: neon-puhelin vastaanottaa tilauksia.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neon">{canonicalStats.rahat.label}: {formatPrice(stats.rahat)}</p>
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em]">{canonicalStats.rahat.short}</p>
        </div>
      </div>

      <div className="space-y-3">
        {availableItems.map((item) => {
          const ownedCount = inventory.filter((inv) => inv.id === item.id).length
          return (
            <ShopCard
              key={item.id}
              item={item}
              stats={stats}
              owned={ownedCount}
              onBuy={() => onBuy(item)}
              onUse={() => onUse(item.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default Shop
