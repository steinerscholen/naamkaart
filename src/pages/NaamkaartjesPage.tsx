import { useState, type ChangeEvent } from 'react'
import { useStore } from '../store'
import type { Nametag } from '../types'
import { NametagPreview } from '../components/NametagPreview'
import { Modal } from '../components/Modal'
import { parseCSV } from '../utils/csv'
import { generateNametagPDF } from '../utils/nametag-pdf'

const EMPTY: Omit<Nametag, 'id'> = { firstName: '', lastName: '', role: '' }

export function NaamkaartjesPage() {
  const { nametags, settings, addNametag, updateNametag, deleteNametag, importNametags } = useStore()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Nametag | null>(null)
  const [adding, setAdding] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = nametags.filter(t => {
    const q = search.toLowerCase()
    return !q || t.firstName.toLowerCase().includes(q) || t.lastName.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)
  })

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(t => t.id)))
  }

  const selectedTags = nametags.filter(t => selected.has(t.id))

  const handleGenerate = async () => {
    if (selectedTags.length === 0) return
    setGenerating(true)
    try {
      const doc = generateNametagPDF(selectedTags, settings)
      doc.save(`naamkaartjes-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Naamkaartjes</h1>
          <p className="text-sm text-slate-500">{nametags.length} persoon{nametags.length !== 1 ? 'en' : ''} · 90 × 55 mm · 10 per pagina</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100"
          >
            CSV importeren
          </button>
          <button
            onClick={() => setAdding(true)}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Persoon toevoegen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Zoek op naam of functie…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={toggleAll} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 shrink-0">
              {selected.size === filtered.length && filtered.length > 0 ? 'Niets' : 'Alles'}
            </button>
          </div>

          {nametags.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              Nog niemand. Voeg personen toe of importeer een CSV.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">Geen resultaten.</div>
          ) : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-50">
              {filtered.map(t => (
                <label key={t.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="rounded text-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{t.firstName} {t.lastName}</p>
                    {t.role && <p className="text-xs text-slate-500">{t.role}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={e => { e.preventDefault(); setEditing(t) }}
                      className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={e => { e.preventDefault(); if (confirm(`Verwijder ${t.firstName} ${t.lastName}?`)) deleteNametag(t.id) }}
                      className="px-3 py-1 text-xs border border-red-100 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      Verwijder
                    </button>
                  </div>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400">{selected.size} geselecteerd</p>
        </div>

        {/* Right: print panel */}
        <div className="space-y-5">
          {/* Preview */}
          {selectedTags.length > 0 ? (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Voorbeeld:</p>
              <NametagPreview tag={selectedTags[0]} settings={settings} scale={2} />
            </div>
          ) : nametags.length > 0 ? (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Voorbeeld:</p>
              <NametagPreview tag={nametags[0]} settings={settings} scale={2} />
            </div>
          ) : null}

          {/* Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Geselecteerd</span>
              <span className="font-semibold">{selectedTags.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pagina's</span>
              <span className="font-semibold">{Math.max(1, Math.ceil(selectedTags.length / 10))}</span>
            </div>
          </div>

          <button
            disabled={selectedTags.length === 0 || generating}
            onClick={handleGenerate}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {generating ? 'Genereren…' : `PDF genereren (${selectedTags.length} kaartje${selectedTags.length !== 1 ? 's' : ''})`}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Kleuren en logo worden overgenomen uit de instellingen.
          </p>
        </div>
      </div>

      {(adding || editing) && (
        <NametagFormModal
          initial={editing ?? undefined}
          onSave={data => {
            if (editing) updateNametag(editing.id, data)
            else addNametag(data)
            setAdding(false); setEditing(null)
          }}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}

      {showImport && (
        <NametagImportModal
          onImport={rows => { importNametags(rows); setShowImport(false) }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

function NametagFormModal({
  initial, onSave, onClose,
}: {
  initial?: Nametag
  onSave: (n: Omit<Nametag, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Nametag, 'id'>>(
    initial ? { firstName: initial.firstName, lastName: initial.lastName, role: initial.role }
      : { ...EMPTY }
  )

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const valid = form.firstName.trim() || form.lastName.trim()

  return (
    <Modal title={initial ? 'Persoon bewerken' : 'Persoon toevoegen'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Voornaam</span>
            <input className="input mt-1 w-full" value={form.firstName} onChange={set('firstName')} autoFocus />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Achternaam</span>
            <input className="input mt-1 w-full" value={form.lastName} onChange={set('lastName')} />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Functie / Afdeling</span>
          <input className="input mt-1 w-full" value={form.role} onChange={set('role')} placeholder="bijv. Leerkracht wiskunde" />
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Annuleren</button>
        <button
          disabled={!valid}
          onClick={() => { if (valid) onSave(form) }}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
        >
          Opslaan
        </button>
      </div>
    </Modal>
  )
}

// ─── CSV Import Modal ────────────────────────────────────────────────────────

function NametagImportModal({
  onImport, onClose,
}: {
  onImport: (rows: Omit<Nametag, 'id'>[]) => void
  onClose: () => void
}) {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [map, setMap] = useState<{ firstName: string; lastName: string; role: string }>({ firstName: '', lastName: '', role: '' })

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await parseCSV(file)
    setHeaders(result.headers)
    setRows(result.rows)
    // Guess columns
    const fn = result.headers.find(h => /voor|first|prenom/i.test(h)) ?? ''
    const ln = result.headers.find(h => /achter|last|nom|naam/i.test(h)) ?? ''
    const role = result.headers.find(h => /functie|rol|afdeling|function|department|dept/i.test(h)) ?? ''
    setMap({ firstName: fn, lastName: ln, role })
  }

  const preview: Omit<Nametag, 'id'>[] = rows
    .filter(_r => map.firstName && map.lastName)
    .map(r => ({
      firstName: r[map.firstName]?.trim() ?? '',
      lastName: r[map.lastName]?.trim() ?? '',
      role: map.role ? (r[map.role]?.trim() ?? '') : '',
    }))
    .filter(r => r.firstName || r.lastName)

  return (
    <Modal title="CSV importeren" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          CSV met kolommen voor voornaam, achternaam en optioneel functie/afdeling.
        </p>
        <input type="file" accept=".csv,.txt" onChange={handleFile} className="text-sm" />

        {headers.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {(['firstName', 'lastName', 'role'] as const).map(k => (
                <label key={k} className="block">
                  <span className="text-xs font-medium text-slate-600">
                    {k === 'firstName' ? 'Voornaam *' : k === 'lastName' ? 'Achternaam *' : 'Functie'}
                  </span>
                  <select
                    className="input mt-1 w-full"
                    value={map[k]}
                    onChange={e => setMap(m => ({ ...m, [k]: e.target.value }))}
                  >
                    <option value="">— kies kolom —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
              ))}
            </div>

            {preview.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                  Voorbeeld ({preview.length} personen)
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {preview.slice(0, 8).map((t, i) => (
                    <div key={i} className="px-3 py-1.5 text-sm text-slate-700 flex gap-4">
                      <span className="font-medium">{t.firstName} {t.lastName}</span>
                      {t.role && <span className="text-slate-400">{t.role}</span>}
                    </div>
                  ))}
                  {preview.length > 8 && <div className="px-3 py-1.5 text-xs text-slate-400">… en {preview.length - 8} meer</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Annuleren</button>
        <button
          disabled={preview.length === 0}
          onClick={() => onImport(preview)}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
        >
          {preview.length > 0 ? `${preview.length} personen importeren` : 'Importeren'}
        </button>
      </div>
    </Modal>
  )
}
