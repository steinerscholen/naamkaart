import { useState, type ChangeEvent } from 'react'
import { useStore } from '../store'
import { BadgePreview } from '../components/BadgePreview'
import { compressImage } from '../utils/images'

export function SettingsPage() {
  const { settings, updateSettings, students } = useStore()
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({ [k]: e.target.value })
    setSaved(false)
  }

  const setNum = (k: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
    updateSettings({ [k]: parseFloat(e.target.value) || 0 })
    setSaved(false)
  }

  const handleLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 200, 100)
    updateSettings({ logo: compressed })
  }

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const previewStudent = students[0] ?? {
    id: 'preview', firstName: 'Voornaam', lastName: 'Achternaam', className: '3A',
    birthday: '2010-09-01',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Instellingen</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700">School</h2>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Naam school</span>
            <input className="input mt-1 w-full" value={settings.schoolName} onChange={set('schoolName')} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Website</span>
            <input className="input mt-1 w-full" value={settings.website} onChange={set('website')} placeholder="www.school.be" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Schooljaar</span>
            <input className="input mt-1 w-full" value={settings.year} onChange={set('year')} placeholder="2025-2026" />
          </label>

          <div>
            <span className="text-xs font-medium text-slate-600">Logo</span>
            <div className="mt-1 flex items-center gap-3">
              {settings.logo && (
                <img src={settings.logo} alt="logo" className="h-10 max-w-24 object-contain border border-slate-100 rounded p-1" />
              )}
              <input type="file" accept="image/*" onChange={handleLogo} className="text-sm" />
            </div>
            {settings.logo && (
              <button onClick={() => updateSettings({ logo: undefined })} className="text-xs text-red-400 hover:text-red-600 mt-1">
                Logo verwijderen
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Accentkleur</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={settings.accentColor} onChange={set('accentColor')} className="w-10 h-8 rounded cursor-pointer" />
                <input className="input flex-1 font-mono text-xs" value={settings.accentColor} onChange={set('accentColor')} />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Tekstkleur strip</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={settings.accentTextColor} onChange={set('accentTextColor')} className="w-10 h-8 rounded cursor-pointer" />
                <input className="input flex-1 font-mono text-xs" value={settings.accentTextColor} onChange={set('accentTextColor')} />
              </div>
            </label>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h2 className="font-semibold text-slate-700">Stickervel marges (mm)</h2>
            <p className="text-xs text-slate-400">
              Laat op 0 als de stickers tot de rand van het vel gaan.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Marge boven</span>
                <input type="number" min="0" step="0.5" className="input mt-1 w-full"
                  value={settings.marginTop} onChange={setNum('marginTop')} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Marge links</span>
                <input type="number" min="0" step="0.5" className="input mt-1 w-full"
                  value={settings.marginLeft} onChange={setNum('marginLeft')} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Tussenruimte horizontaal</span>
                <input type="number" min="0" step="0.5" className="input mt-1 w-full"
                  value={settings.gapX} onChange={setNum('gapX')} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Tussenruimte verticaal</span>
                <input type="number" min="0" step="0.5" className="input mt-1 w-full"
                  value={settings.gapY} onChange={setNum('gapY')} />
              </label>
            </div>
          </div>

          <button
            onClick={save}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {saved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700">Voorbeeld badge</h2>
          <BadgePreview student={previewStudent} settings={settings} scale={3} />
          <p className="text-xs text-slate-400">Schaal: 3× (werkelijke afmeting 70 × 37 mm)</p>
        </div>
      </div>
    </div>
  )
}
