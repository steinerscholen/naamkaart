import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Student, type SchoolSettings, type StickerSheet, type SlotState, DEFAULT_SETTINGS } from './types'

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function load<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : def
  } catch {
    return def
  }
}

interface Store {
  students: Student[]
  settings: SchoolSettings
  sheets: StickerSheet[]
  addStudent: (s: Omit<Student, 'id'>) => string
  updateStudent: (id: string, s: Partial<Student>) => void
  deleteStudent: (id: string) => void
  importStudents: (students: Omit<Student, 'id'>[]) => void
  updateSettings: (s: Partial<SchoolSettings>) => void
  addSheet: (label: string) => StickerSheet
  updateSheet: (id: string, s: Partial<StickerSheet>) => void
  deleteSheet: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => load('students', []))
  const [settings, setSettings] = useState<SchoolSettings>(() => ({ ...DEFAULT_SETTINGS, ...load<Partial<SchoolSettings>>('settings', {}) }))
  const [sheets, setSheets] = useState<StickerSheet[]>(() => load('sheets', []))

  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)) }, [students])
  useEffect(() => { localStorage.setItem('settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => { localStorage.setItem('sheets', JSON.stringify(sheets)) }, [sheets])

  const addStudent = (s: Omit<Student, 'id'>): string => {
    const id = uid()
    setStudents(prev => [...prev, { ...s, id }])
    return id
  }

  const updateStudent = (id: string, s: Partial<Student>) =>
    setStudents(prev => prev.map(st => st.id === id ? { ...st, ...s } : st))

  const deleteStudent = (id: string) =>
    setStudents(prev => prev.filter(st => st.id !== id))

  const importStudents = (incoming: Omit<Student, 'id'>[]) =>
    setStudents(prev => [...prev, ...incoming.map(s => ({ ...s, id: uid() }))])

  const updateSettings = (s: Partial<SchoolSettings>) =>
    setSettings(prev => ({ ...DEFAULT_SETTINGS, ...prev, ...s }))

  const addSheet = (label: string): StickerSheet => {
    const slotCount = (settings.cols ?? 3) * (settings.rows ?? 8)
    const sheet: StickerSheet = {
      id: uid(),
      label,
      slots: new Array<SlotState>(slotCount).fill('available'),
      createdAt: new Date().toISOString(),
    }
    setSheets(prev => [...prev, sheet])
    return sheet
  }

  const updateSheet = (id: string, s: Partial<StickerSheet>) =>
    setSheets(prev => prev.map(sh => sh.id === id ? { ...sh, ...s } : sh))

  const deleteSheet = (id: string) =>
    setSheets(prev => prev.filter(sh => sh.id !== id))

  return (
    <Ctx.Provider value={{
      students, settings, sheets,
      addStudent, updateStudent, deleteStudent, importStudents,
      updateSettings,
      addSheet, updateSheet, deleteSheet,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
