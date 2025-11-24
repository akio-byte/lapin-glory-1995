import { useMemo, useState } from 'react'
import type { Item, ItemType, Stats } from '../data/gameData'
import { items as availableItems, tagMeta } from '../data/gameData'
import { canonicalStats } from '../data/statMeta'
import type { Phase } from '../hooks/useGameLoop'
import ItemCard from './ItemCard'

const formatPrice = (price: number) => `${price} mk`

const ItemTag = ({ tag }: { tag: string }) => {
  const meta = tagMeta[tag]
  return (
    <span
      className="text-[10px] uppercase tracking-[0.25em] text-neon inline-flex gap-1 items-center"
      title={meta?.blurb ?? tag}
    >
      {meta?.label ?? tag}
    </span>
  )
}

const ShopCard = ({
  item,
  stats,
  owned,
  onBuy,
  onUse,
  disabled,
}: {
  item: Item
  stats: Stats
  owned: number
  onBuy: () => void
  onUse: () => void
  disabled?: boolean
}) => {
  const canAfford = stats.rahat >= item.price
  const meetsByroslavia = item.req_stats?.byroslavia ? stats.byroslavia >= item.req_stats.byroslavia : true
  const passiveHint = item.effects.passive ? 'Passiivinen bonus' : 'Kertakäyttö'

  return (
    <div className="glass-panel p-3 space-y-3 shadow-[0_0_18px_rgba(255,0,255,0.2)]">
      <div className="grid gap-3 md:grid-cols-[minmax(0,180px)_1fr] items-start">
        <div className="relative">
          <ItemCard symbol={<span>{item.icon}</span>} label={item.name} />
          <span className="sr-only">{item.name} korttipinta ilman nimilabelia</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <ItemTag tag={item.type} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-neon font-semibold">{formatPrice(item.price)}</p>
              <p className="text-[11px] text-slate-300">{passiveHint}</p>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-snug">{item.description}</p>
          <p className="text-[11px] text-emerald-200 leading-snug">{item.summary}</p>

          {item.tags?.length ? (
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-200" aria-label="Item tags">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neon/60 px-2 py-1 bg-black/30"
                  title={tagMeta[tag]?.blurb ?? tag}
                >
                  {tagMeta[tag]?.label ?? tag}
                </span>
              ))}
            </div>
          ) : null}

          {item.req_stats?.byroslavia && (
            <p className="text-[11px] text-amber-200">Byroslavia vaadittu: {item.req_stats.byroslavia}</p>
          )}

          {owned > 0 && <p className="text-[11px] text-emerald-300">Omistat: {owned} kpl</p>}

          <div className="flex gap-2 text-xs">
            <button
              className="button-raw flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onBuy}
              disabled={!canAfford || !meetsByroslavia || disabled}
            >
              Osta
            </button>
            {owned > 0 && (
              <button className="button-raw flex-1 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onUse} disabled={disabled}>
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
  const [activeTab, setActiveTab] = useState<ItemType>('consumable')

  const filteredItems = useMemo(() => availableItems.filter((item) => item.type === activeTab), [activeTab])

  const tabs: { key: ItemType; label: string }[] = [
    { key: 'consumable', label: 'Consumables' },
    { key: 'tool', label: 'Tools' },
    { key: 'form', label: 'Forms' },
    { key: 'relic', label: 'Relics' },
  ]

  return (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <ItemTag tag="shop" />
            <p className="text-sm text-slate-200">Neon-ikkuna kuljettaa tuotteet suoraan tiskille.</p>
          </div>
        <div className="text-right">
          <p className="text-sm text-neon">{canonicalStats.rahat.label}: {formatPrice(stats.rahat)}</p>
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em]">{canonicalStats.rahat.short}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`button-raw px-3 py-2 ${activeTab === tab.key ? 'bg-neon/30 text-coal' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {phase !== 'DAY' && (
        <div className="glass-panel text-sm text-amber-200">
          Kauppa on virallisesti kiinni yöllä. Selaa vapaasti, mutta ostoikkuna aukeaa vasta aamunkoitteessa.
        </div>
      )}

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const ownedCount = inventory.filter((inv) => inv.id === item.id).length
          const disabled = phase !== 'DAY'
          return (
            <ShopCard
              key={item.id}
              item={item}
              stats={stats}
              owned={ownedCount}
              disabled={disabled}
              onBuy={() => !disabled && onBuy(item)}
              onUse={() => !disabled && onUse(item.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default Shop
