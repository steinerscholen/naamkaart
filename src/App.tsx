import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { StudentsPage } from './pages/StudentsPage'
import { PrintPage } from './pages/PrintPage'
import { SettingsPage } from './pages/SettingsPage'
import { NaamkaartjesPage } from './pages/NaamkaartjesPage'

type Tab = 'students' | 'print' | 'nametags' | 'settings'

function AppShell() {
  const [tab, setTab] = useState<Tab>('students')
  const { students, nametags } = useStore()
  const noPhoto = students.filter(s => !s.photo).length

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'students', label: 'Leerlingen', badge: students.length },
    { id: 'print', label: 'Afdrukken' },
    { id: 'nametags', label: 'Naamkaartjes', badge: nametags.length || undefined },
    { id: 'settings', label: 'Instellingen' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-6 h-14">
          <span className="font-bold text-slate-800 text-lg shrink-0">Student Badges</span>
          <nav className="flex gap-1 flex-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  tab === t.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="bg-slate-200 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">{t.badge}</span>
                )}
              </button>
            ))}
          </nav>
          {noPhoto > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0">
              {noPhoto} zonder foto
            </span>
          )}
        </div>
      </header>

      <main className="flex-1">
        {tab === 'students' && <StudentsPage />}
        {tab === 'print' && <PrintPage />}
        {tab === 'nametags' && <NaamkaartjesPage />}
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}
