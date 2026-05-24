import { useState, useMemo } from 'react'
import { useStore } from '../store'
import type { SlotState } from '../types'
import { BadgePreview } from '../components/BadgePreview'
import { StickerSheetEditor } from '../components/StickerSheetEditor'
import { generatePDF, generatePDFByClass, generatePDFOnSheet } from '../utils/pdf'
import { friendlyClassName } from '../utils/classes'

type SheetMode = 'new' | 'existing'
type PhotoFilter = 'all' | 'with' | 'without'
type BadgeType = 'student' | 'fietspas'

export function PrintPage() {
  const { students, settings, sheets, addSheet, updateSheet } = useStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all')
  const [badgeType, setBadgeType] = useState<BadgeType>('student')
  const [sheetMode, setSheetMode] = useState<SheetMode>('new')
  const [existingSheetId, setExistingSheetId] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [printPerClass, setPrintPerClass] = useState(false)

  const classes = [...new Set(students.map(s => s.className).filter(Boolean))].sort()

  const filtered = students.filter(s => {
    const q = filter.toLowerCase()
    const matchesText = !q || s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    const matchesPhoto = photoFilter === 'all' || (photoFilter === 'with' ? !!s.photo : !s.photo)
    const matchesBadgeType = badgeType === 'fietspas' ? !!s.hasFietspas : true
    return matchesText && matchesPhoto && matchesBadgeType
  })

  const fietspasCount = students.filter(s => s.hasFietspas).length

  // Settings override for fietspas: swap accent colors
  const printSettings = badgeType === 'fietspas'
    ? { ...settings, accentColor: settings.fietspasAccentColor, accentTextColor: settings.fietspasAccentTextColor }
    : settings

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(s => s.id)))
  }

  const selectedStudents = students.filter(s => selected.has(s.id))

  const existingSheet = sheets.find(sh => sh.id === existingSheetId)

  // Exact available slot indices on the existing sheet, in order
  const availableSlotIndices = useMemo(() =>
    existingSheet
      ? existingSheet.slots.map((s, i) => ({ s, i })).filter(({ s }) => s === 'available').map(({ i }) => i)
      : [],
    [existingSheet]
  )

  // Which slots will be highlighted as "queued" in the editor
  const queuedSlots = useMemo(() =>
    availableSlotIndices.slice(0, selectedStudents.length),
    [availableSlotIndices, selectedStudents.length]
  )

  const badgesPerPage = (settings.cols ?? 3) * (settings.rows ?? 8)
  const availableCount = existingSheet ? availableSlotIndices.length : badgesPerPage

  const handleGenerate = async () => {
    if (selectedStudents.length === 0) return
    setGenerating(true)
    try {
      let doc
      if (printPerClass) {
        doc = generatePDFByClass(selectedStudents, printSettings)
      } else if (sheetMode === 'existing' && existingSheet) {
        doc = generatePDFOnSheet(selectedStudents, printSettings, availableSlotIndices)
      } else {
        doc = generatePDF(selectedStudents, printSettings, 0)
      }
      doc.save(`badges-${new Date().toISOString().slice(0, 10)}.pdf`)

      // Update sheet slot tracking
      if (!printPerClass) {
        if (sheetMode === 'new') {
          const newSheet = addSheet(`Vel ${new Date().toLocaleDateString('nl-BE')}`)
          const usedCount = Math.min(selectedStudents.length, badgesPerPage)
          const nextSlots = newSheet.slots.map((s, i) =>
            i < usedCount ? 'used' : s
          ) as SlotState[]
          updateSheet(newSheet.id, { slots: nextSlots })
        } else if (existingSheet) {
          const slotsToMark = availableSlotIndices.slice(0, selectedStudents.length)
          const nextSlots = existingSheet.slots.map((s, i) =>
            slotsToMark.includes(i) ? 'used' : s
          ) as SlotState[]
          updateSheet(existingSheet.id, { slots: nextSlots })
        }
      }
    } finally {
      setGenerating(false)
    }
  }

  if (students.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20 text-slate-400">
        Voeg eerst leerlingen toe via het tabblad Leerlingen.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Afdrukken</h1>
      <p className="text-sm text-slate-500 mb-6">Selecteer leerlingen en genereer een PDF met badges.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: student selection */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Zoek…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={toggleAll} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 shrink-0">
              {selected.size === filtered.length && filtered.length > 0 ? 'Niets' : 'Alles'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => { setBadgeType('student'); setSelected(new Set()) }}
                className={`px-3 py-1.5 transition-colors ${badgeType === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Leerlingenbadge
              </button>
              <button
                onClick={() => { setBadgeType('fietspas'); setSelected(new Set()) }}
                className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${badgeType === 'fietspas' ? 'bg-green-600 text-white border-green-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                🚲 Fietspas {fietspasCount > 0 && <span className="ml-1 opacity-75">({fietspasCount})</span>}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-slate-400 mr-1">Foto:</span>
            {(['all', 'with', 'without'] as const).map(f => (
              <button key={f} onClick={() => setPhotoFilter(f)}
                className={`px-2 py-0.5 text-xs rounded-full border font-medium transition-colors ${photoFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {f === 'all' ? 'Alle' : f === 'with' ? 'Met foto' : 'Zonder foto'}
              </button>
            ))}
          </div>

          {classes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {classes.map(c => {
                const ids = filtered.filter(s => s.className === c).map(s => s.id)
                const allSelected = ids.length > 0 && ids.every(id => selected.has(id))
                return (
                  <button key={c} onClick={() => {
                    setSelected(prev => {
                      const next = new Set(prev)
                      if (allSelected) ids.forEach(id => next.delete(id))
                      else ids.forEach(id => next.add(id))
                      return next
                    })
                  }} className={`px-2 py-1 text-xs rounded-full border font-medium transition-colors ${allSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'}`}>
                    {friendlyClassName(c)}
                  </button>
                )
              })}
            </div>
          )}

          <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
            {filtered.map(s => (
              <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded text-indigo-600"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800 text-sm">{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-slate-400 ml-2">{s.className}</span>
                </div>
                {!s.photo && <span className="text-xs text-amber-400">geen foto</span>}
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400">{selected.size} geselecteerd</p>
        </div>

        {/* Right: print config */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm">Stickervel</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setSheetMode('new')}
                className={`flex-1 py-2 text-xs rounded-lg border font-medium ${sheetMode === 'new' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Nieuw vel
              </button>
              <button
                onClick={() => setSheetMode('existing')}
                disabled={sheets.length === 0}
                className={`flex-1 py-2 text-xs rounded-lg border font-medium disabled:opacity-40 ${sheetMode === 'existing' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Bestaand vel
              </button>
            </div>

            {sheetMode === 'existing' && sheets.length > 0 && (
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                value={existingSheetId}
                onChange={e => setExistingSheetId(e.target.value)}
              >
                <option value="">— kies een vel —</option>
                {sheets.map(sh => {
                  const avail = sh.slots.filter(s => s === 'available').length
                  return <option key={sh.id} value={sh.id}>{sh.label} ({avail}/24 vrij)</option>
                })}
              </select>
            )}

            {existingSheet && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Vinkje = gebruikt, leeg = beschikbaar. Klik om aan te passen.</p>
                <StickerSheetEditor
                  sheet={existingSheet}
                  cols={settings.cols ?? 3}
                  queuedSlots={queuedSlots}
                  onChange={slots => updateSheet(existingSheet.id, { slots })}
                />
              </div>
            )}

            {sheetMode === 'new' && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                Stickers worden geplaatst vanaf positie 1 van een nieuw vel.<br />
                Na het genereren wordt dit vel bijgehouden.
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Geselecteerd</span>
              <span className="font-semibold">{selectedStudents.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Vrije plekken (vel 1)</span>
              <span className="font-semibold">{availableCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Extra pagina's</span>
              <span className="font-semibold">{Math.max(0, Math.ceil((selectedStudents.length - availableCount) / badgesPerPage))}</span>
            </div>
          </div>

          {/* Preview */}
          {selectedStudents.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Voorbeeld eerste badge:</p>
              <BadgePreview student={selectedStudents[0]} settings={printSettings} scale={2} />
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer select-none bg-white border border-slate-100 rounded-xl px-4 py-3">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={printPerClass}
                onChange={e => setPrintPerClass(e.target.checked)}
              />
              <div className={`w-9 h-5 rounded-full transition-colors ${printPerClass ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${printPerClass ? 'translate-x-4' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Afdrukken per klas</p>
              <p className="text-xs text-slate-400">Elke klas start op een nieuwe pagina</p>
            </div>
          </label>

          <button
            disabled={selectedStudents.length === 0 || generating || (!printPerClass && sheetMode === 'existing' && !existingSheetId)}
            onClick={handleGenerate}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {generating ? 'Genereren…' : `PDF genereren (${selectedStudents.length} badge${selectedStudents.length !== 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  )
}
