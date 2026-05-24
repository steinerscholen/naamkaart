import { useState, type ChangeEvent } from 'react'
import { useStore } from '../store'
import { BadgePreview } from '../components/BadgePreview'
import { compressImage } from '../utils/images'
import { LABEL_PRESETS } from '../utils/labelPresets'

async function readFontAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

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

  const handleFont = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await readFontAsBase64(file)
    const name = file.name.replace(/\.[^.]+$/, '')
    updateSettings({ customFont: { name, data } })
    setSaved(false)
  }

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const previewStudent = students[0] ?? {
    id: 'preview', firstName: 'Voornaam', lastName: 'Achternaam', className: '3A',
    birthday: '2010-09-01',
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Instellingen</h1>

      <div className="mb-6 flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <svg className="shrink-0 mt-0.5 text-emerald-600" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Alle gegevens blijven op dit toestel</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Foto's, namen en CSV-bestanden worden <strong>nooit</strong> verstuurd naar een server. Alles wordt lokaal verwerkt in de browser en opgeslagen op dit apparaat. Er is geen internetverbinding nodig om badges te maken.
          </p>
        </div>
      </div>

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
            {settings.logo && (
              <div className="mt-2 flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium w-fit">
                <button
                  onClick={() => { updateSettings({ logoPosition: 'bottom-right' }); setSaved(false) }}
                  className={`px-3 py-1.5 transition-colors ${settings.logoPosition !== 'strip' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Onder rechts
                </button>
                <button
                  onClick={() => { updateSettings({ logoPosition: 'strip' }); setSaved(false) }}
                  className={`px-3 py-1.5 border-l border-slate-200 transition-colors ${settings.logoPosition === 'strip' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Strip (boven)
                </button>
              </div>
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

          {/* Strip color preview */}
          <div
            className="rounded px-3 py-1.5 text-sm font-semibold truncate"
            style={{ backgroundColor: settings.accentColor, color: settings.accentTextColor }}
          >
            {settings.schoolName || 'Naam school'} &nbsp;·&nbsp; {settings.year || '2025-2026'}
          </div>

          <div>
            <span className="text-xs font-medium text-slate-600">Lettertype (TTF)</span>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              {settings.customFont && (
                <span className="text-xs bg-slate-100 rounded px-2 py-1 font-mono">{settings.customFont.name}</span>
              )}
              <input type="file" accept=".ttf,.otf" onChange={handleFont} className="text-sm" />
            </div>
            {settings.customFont && (
              <button onClick={() => { updateSettings({ customFont: undefined }); setSaved(false) }} className="text-xs text-red-400 hover:text-red-600 mt-1">
                Lettertype verwijderen
              </button>
            )}
            <p className="text-xs text-slate-400 mt-1">Upload een .ttf bestand. Wordt gebruikt in badge én PDF.</p>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h2 className="font-semibold text-slate-700">🚲 Fietspas kleuren</h2>
            <p className="text-xs text-slate-400 -mt-1">De fietspas heeft dezelfde lay-out als de leerlingenbadge, maar met een andere accentkleur.</p>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Accentkleur fietspas</span>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={settings.fietspasAccentColor} onChange={set('fietspasAccentColor')} className="w-10 h-8 rounded cursor-pointer" />
                  <input className="input flex-1 font-mono text-xs" value={settings.fietspasAccentColor} onChange={set('fietspasAccentColor')} />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Tekstkleur strip</span>
                <div className="mt-1 flex items-center gap-2">
                  <input type="color" value={settings.fietspasAccentTextColor} onChange={set('fietspasAccentTextColor')} className="w-10 h-8 rounded cursor-pointer" />
                  <input className="input flex-1 font-mono text-xs" value={settings.fietspasAccentTextColor} onChange={set('fietspasAccentTextColor')} />
                </div>
              </label>
            </div>

            <div
              className="rounded px-3 py-1.5 text-sm font-semibold truncate"
              style={{ backgroundColor: settings.fietspasAccentColor, color: settings.fietspasAccentTextColor }}
            >
              {settings.schoolName || 'Naam school'} &nbsp;·&nbsp; Fietspas
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h2 className="font-semibold text-slate-700">Stickervel formaat</h2>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Stickervel kiezen</span>
              <select
                className="input mt-1 w-full text-sm"
                defaultValue=""
                onChange={e => {
                  const preset = LABEL_PRESETS[Number(e.target.value)]
                  if (!preset) return
                  updateSettings({
                    cols: preset.cols,
                    rows: preset.rows,
                    badgeW: preset.badgeW,
                    badgeH: preset.badgeH,
                    marginTop: preset.marginTop,
                    marginLeft: preset.marginLeft,
                    gapX: preset.gapX,
                    gapY: preset.gapY,
                  })
                  setSaved(false)
                }}
              >
                <option value="">— kies een formaat —</option>
                {LABEL_PRESETS.map((p, i) => (
                  <option key={i} value={i}>{p.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Vul daarna handmatig aan als je afwijkende marges hebt. Controleer altijd de verpakking.</p>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Kolommen</span>
                <input type="number" min="1" max="10" step="1" className="input mt-1 w-full"
                  value={settings.cols ?? 3} onChange={e => { updateSettings({ cols: Math.max(1, parseInt(e.target.value) || 1) }); setSaved(false) }} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Rijen</span>
                <input type="number" min="1" max="20" step="1" className="input mt-1 w-full"
                  value={settings.rows ?? 8} onChange={e => { updateSettings({ rows: Math.max(1, parseInt(e.target.value) || 1) }); setSaved(false) }} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Breedte sticker (mm)</span>
                <input type="number" min="10" step="0.5" className="input mt-1 w-full"
                  value={settings.badgeW ?? 70} onChange={setNum('badgeW')} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Hoogte sticker (mm)</span>
                <input type="number" min="10" step="0.5" className="input mt-1 w-full"
                  value={settings.badgeH ?? 37} onChange={setNum('badgeH')} />
              </label>
            </div>

            <p className="text-xs font-medium text-slate-600 pt-1">Marges & tussenruimte (mm)</p>
            <p className="text-xs text-slate-400 -mt-1">Laat op 0 als de stickers tot de rand van het vel gaan.</p>
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
