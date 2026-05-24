import { useState, useRef, type ChangeEvent } from 'react'
import { useStore } from '../store'
import type { Student } from '../types'
import { BadgePreview } from '../components/BadgePreview'
import { friendlyClassName } from '../utils/classes'
import { Modal } from '../components/Modal'
import { compressImage, matchPhotos } from '../utils/images'
import { parseCSV, guessColumns, mapToStudents, type ColumnMap } from '../utils/csv'

const EMPTY: Omit<Student, 'id'> = { firstName: '', lastName: '', className: '', birthday: '' }

export function StudentsPage() {
  const { students, settings, addStudent, updateStudent, deleteStudent, importStudents } = useStore()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Student | null>(null)
  const [adding, setAdding] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showPhotoMatch, setShowPhotoMatch] = useState(false)

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q)
    )
  })

  const classes = [...new Set(students.map(s => s.className).filter(Boolean))].sort()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leerlingen</h1>
          <p className="text-sm text-slate-500">{students.length} leerling{students.length !== 1 ? 'en' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPhotoMatch(true)}
            className="px-3 py-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
          >
            Foto's koppelen
          </button>
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
            + Leerling toevoegen
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Zoek op naam of klas…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {classes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          <button onClick={() => setSearch('')} className={`px-2 py-1 text-xs rounded-full border ${search === '' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Alle
          </button>
          {classes.map(c => (
            <button key={c} onClick={() => setSearch(c)} className={`px-2 py-1 text-xs rounded-full border ${search === c ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {friendlyClassName(c)}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {students.length === 0 ? 'Nog geen leerlingen. Importeer een CSV of voeg er handmatig toe.' : 'Geen resultaten.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors">
              <BadgePreview student={s} settings={settings} scale={1.3} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  {s.firstName} {s.lastName}
                  {s.hasFietspas && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                      🚲 Fietspas
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  Klas: {friendlyClassName(s.className) || '—'}
                  {s.birthday && <span className="ml-3">Geb.: {s.birthday.split('-').reverse().join('/')}</span>}
                </p>
                {!s.photo && <p className="text-xs text-amber-500 mt-0.5">Geen foto</p>}
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                <button
                  onClick={() => updateStudent(s.id, { hasFietspas: !s.hasFietspas })}
                  title={s.hasFietspas ? 'Fietspas verwijderen' : 'Fietspas toekennen'}
                  className={`px-2 py-1.5 text-xs border rounded-lg transition-colors ${s.hasFietspas ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  🚲
                </button>
                <button onClick={() => setEditing(s)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">
                  Bewerken
                </button>
                <button
                  onClick={() => { if (confirm(`Verwijder ${s.firstName} ${s.lastName}?`)) deleteStudent(s.id) }}
                  className="px-3 py-1.5 text-xs border border-red-100 text-red-500 rounded-lg hover:bg-red-50"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(adding || editing) && (
        <StudentFormModal
          initial={editing ?? undefined}
          onSave={(data) => {
            if (editing) updateStudent(editing.id, data)
            else addStudent(data)
            setAdding(false); setEditing(null)
          }}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}

      {showImport && (
        <ImportCSVModal
          onImport={(rows) => { importStudents(rows); setShowImport(false) }}
          onClose={() => setShowImport(false)}
        />
      )}

      {showPhotoMatch && (
        <PhotoMatchModal
          students={students}
          onUpdate={updateStudent}
          onClose={() => setShowPhotoMatch(false)}
        />
      )}
    </div>
  )
}

// ─── Student Form Modal ─────────────────────────────────────────────────────

function StudentFormModal({
  initial, onSave, onClose,
}: {
  initial?: Student
  onSave: (s: Omit<Student, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Student, 'id'>>(
    initial ? { firstName: initial.firstName, lastName: initial.lastName, className: initial.className, birthday: initial.birthday, photo: initial.photo, hasFietspas: initial.hasFietspas }
      : { ...EMPTY }
  )

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setForm(f => ({ ...f, photo: compressed }))
  }

  const valid = form.firstName.trim() || form.lastName.trim()

  return (
    <Modal title={initial ? 'Leerling bewerken' : 'Leerling toevoegen'} onClose={onClose}>
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
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Klas</span>
            <input className="input mt-1 w-full" value={form.className} onChange={set('className')} placeholder="bijv. 3A" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Geboortedatum</span>
            <input type="date" className="input mt-1 w-full" value={form.birthday} onChange={set('birthday')} />
          </label>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            checked={!!form.hasFietspas}
            onChange={e => setForm(f => ({ ...f, hasFietspas: e.target.checked }))}
            className="rounded text-green-600"
          />
          <div>
            <p className="text-sm font-medium text-green-800">🚲 Fietspas</p>
            <p className="text-xs text-green-600">Leerling mag een schoolfiets lenen</p>
          </div>
        </label>

        <div>
          <span className="text-xs font-medium text-slate-600">Foto</span>
          <div className="mt-1 flex items-center gap-3">
            <div className="w-16 h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden shrink-0">
              {form.photo
                ? <img src={form.photo} className="w-full h-full object-cover" alt="" />
                : <span className="text-2xl text-slate-300">?</span>
              }
            </div>
            <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm text-slate-600" />
          </div>
        </div>
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

// ─── CSV Import Modal ───────────────────────────────────────────────────────

function ImportCSVModal({ onImport, onClose }: { onImport: (rows: Omit<Student, 'id'>[]) => void; onClose: () => void }) {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [map, setMap] = useState<Partial<ColumnMap>>({})
  const [preview, setPreview] = useState<Omit<Student, 'id'>[]>([])

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await parseCSV(file)
    setHeaders(result.headers)
    setRows(result.rows)
    setMap(guessColumns(result.headers))
  }

  const updateMap = (k: keyof ColumnMap) => (e: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...map, [k]: e.target.value } as Partial<ColumnMap>
    setMap(next)
    if (next.firstName && next.lastName && next.className) {
      setPreview(mapToStudents(rows, next as ColumnMap))
    }
  }

  const fieldLabel: Record<keyof ColumnMap, string> = {
    firstName: 'Voornaam', lastName: 'Achternaam', className: 'Klas', birthday: 'Geboortedatum',
  }

  return (
    <Modal title="CSV importeren" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Exporteer een leerlingenlijst uit Smartschool als CSV en laad hem hier in.</p>
        <input type="file" accept=".csv,.txt" onChange={handleFile} className="text-sm" />

        {headers.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(fieldLabel) as (keyof ColumnMap)[]).map(k => (
                <label key={k} className="block">
                  <span className="text-xs font-medium text-slate-600">{fieldLabel[k]}{k !== 'birthday' ? ' *' : ''}</span>
                  <select
                    className="input mt-1 w-full"
                    value={map[k] ?? ''}
                    onChange={updateMap(k)}
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
                  Voorbeeld ({preview.length} leerlingen)
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {preview.slice(0, 8).map((s, i) => (
                    <div key={i} className="px-3 py-1.5 text-sm text-slate-700 flex gap-4">
                      <span className="font-medium">{s.firstName} {s.lastName}</span>
                      <span className="text-slate-500">{s.className}</span>
                      {s.birthday && <span className="text-slate-400">{s.birthday.split('-').reverse().join('/')}</span>}
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
          {preview.length > 0 ? `${preview.length} leerlingen importeren` : 'Importeren'}
        </button>
      </div>
    </Modal>
  )
}

// ─── Photo Match Modal ──────────────────────────────────────────────────────

function PhotoMatchModal({
  students, onUpdate, onClose,
}: {
  students: Student[]
  onUpdate: (id: string, s: Partial<Student>) => void
  onClose: () => void
}) {
  const [matches, setMatches] = useState<Array<{ file: File; studentId: string | null; studentName?: string; preview?: string; assigned?: string }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFolder = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const result = matchPhotos(files, students)
    const withPreviews = await Promise.all(result.map(async m => ({
      ...m,
      preview: await compressImage(m.file),
      assigned: m.studentId ?? '',
    })))
    setMatches(withPreviews)
  }

  const matched = matches.filter(m => m.assigned)
  const unmatched = matches.filter(m => !m.assigned)

  const applyMatches = async () => {
    for (const m of matches) {
      if (m.assigned && m.preview) {
        onUpdate(m.assigned, { photo: m.preview })
      }
    }
    onClose()
  }

  return (
    <Modal title="Foto's automatisch koppelen" onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Selecteer een map met portretfoto's. De app probeert ze automatisch te koppelen op basis van bestandsnaam
          (bijv. <code className="bg-slate-100 px-1 rounded">Vermeersch_Jan.jpg</code>).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          // @ts-expect-error - webkitdirectory is non-standard
          webkitdirectory=""
          onChange={handleFolder}
          className="text-sm"
        />

        {matches.length > 0 && (
          <div className="space-y-3">
            {matched.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-2">{matched.length} gekoppeld</p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {matched.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                      <img src={m.preview} className="w-8 h-10 object-cover rounded" alt="" />
                      <div className="text-xs text-emerald-800 truncate">{m.studentName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {unmatched.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 mb-2">{unmatched.length} niet gekoppeld</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {unmatched.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2">
                      <img src={m.preview} className="w-8 h-10 object-cover rounded" alt="" />
                      <span className="text-xs text-amber-700 flex-1">{m.file.name}</span>
                      <select
                        className="text-xs border border-amber-200 rounded px-1 py-0.5"
                        value={m.assigned ?? ''}
                        onChange={e => {
                          const id = e.target.value
                          const student = students.find(s => s.id === id)
                          setMatches(prev => prev.map((mm, j) => j === i ? { ...mm, assigned: id, studentName: student ? `${student.firstName} ${student.lastName}` : '' } : mm))
                        }}
                      >
                        <option value="">— kies leerling —</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({s.className})</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Annuleren</button>
        <button
          disabled={matched.length === 0}
          onClick={applyMatches}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
        >
          {matched.length > 0 ? `${matched.length} foto's opslaan` : 'Opslaan'}
        </button>
      </div>
    </Modal>
  )
}
