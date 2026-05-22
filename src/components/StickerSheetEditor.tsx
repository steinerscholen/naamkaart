import type { StickerSheet, SlotState } from '../types'

interface Props {
  sheet: StickerSheet
  cols?: number
  /** Slots highlighted as "queued for this print job" */
  queuedSlots?: number[]
  onChange?: (slots: SlotState[]) => void
  readOnly?: boolean
}

export function StickerSheetEditor({ sheet, cols = 3, queuedSlots = [], onChange, readOnly }: Props) {
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
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 3,
          width: Math.max(180, cols * 56),
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
              {state === 'used' ? null : isQueued ? (
                <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="26" height="14" rx="1.5" fill="#eff6ff" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect width="26" height="3.5" rx="1.5" fill="#3b82f6"/>
                  <rect x="1.5" y="5" width="6" height="7.5" rx="0.5" fill="#bfdbfe"/>
                  <rect x="9" y="5.5" width="13" height="1.5" rx="0.5" fill="#93c5fd"/>
                  <rect x="9" y="8.5" width="9" height="1.5" rx="0.5" fill="#bfdbfe"/>
                  <rect x="9" y="11" width="11" height="1.5" rx="0.5" fill="#bfdbfe"/>
                </svg>
              ) : i + 1}
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
