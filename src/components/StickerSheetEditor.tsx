import type { StickerSheet, SlotState } from '../types'

interface Props {
  sheet: StickerSheet
  /** Slots highlighted as "queued for this print job" */
  queuedSlots?: number[]
  onChange?: (slots: SlotState[]) => void
  readOnly?: boolean
}

export function StickerSheetEditor({ sheet, queuedSlots = [], onChange, readOnly }: Props) {
  const toggle = (i: number) => {
    if (readOnly || !onChange) return
    const next = [...sheet.slots] as SlotState[]
    next[i] = next[i] === 'used' ? 'available' : 'used'
    onChange(next)
  }

  const available = sheet.slots.filter(s => s === 'available').length

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
          width: 180,
          padding: 6,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
        }}
      >
        {sheet.slots.map((state, i) => {
          const isQueued = queuedSlots.includes(i)
          let bg = '#fff'
          let border = '1px solid #cbd5e1'
          let title = `Sticker ${i + 1}: beschikbaar`

          if (state === 'used') {
            bg = '#e2e8f0'
            border = '1px solid #94a3b8'
            title = `Sticker ${i + 1}: gebruikt`
          } else if (isQueued) {
            bg = '#dbeafe'
            border = '1px solid #3b82f6'
            title = `Sticker ${i + 1}: wordt afgedrukt`
          }

          return (
            <div
              key={i}
              title={title}
              onClick={() => toggle(i)}
              style={{
                width: 50,
                height: 26,
                backgroundColor: bg,
                border,
                borderRadius: 3,
                cursor: readOnly ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: state === 'used' ? '#94a3b8' : isQueued ? '#1d4ed8' : '#cbd5e1',
                fontWeight: 600,
                userSelect: 'none',
                transition: 'background 0.1s',
              }}
            >
              {state === 'used' ? '✕' : isQueued ? '●' : i + 1}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {available}/24 beschikbaar
        {!readOnly && <span className="ml-2 text-slate-400">· klik om te wisselen</span>}
      </p>
    </div>
  )
}
