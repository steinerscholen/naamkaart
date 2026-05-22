import { useEffect } from 'react'
import type { Student, SchoolSettings } from '../types'
import { friendlyClassName } from '../utils/classes'

interface Props {
  student: Student
  settings: SchoolSettings
  scale?: number
}

export function BadgePreview({ student, settings, scale = 3 }: Props) {
  useEffect(() => {
    const styleId = 'badge-custom-font'
    let el = document.getElementById(styleId) as HTMLStyleElement | null
    if (settings.customFont) {
      if (!el) {
        el = document.createElement('style')
        el.id = styleId
        document.head.appendChild(el)
      }
      el.textContent = `@font-face { font-family: '${settings.customFont.name}'; src: url('data:font/truetype;base64,${settings.customFont.data}') format('truetype'); font-weight: normal bold; }`
    } else if (el) {
      el.remove()
    }
  }, [settings.customFont])
  const s = scale
  const fontFamily = settings.customFont ? `'${settings.customFont.name}', Helvetica, Arial, sans-serif` : 'Helvetica, Arial, sans-serif'
  const W = (settings.badgeW ?? 70) * s
  const H = (settings.badgeH ?? 37) * s
  const STRIP = 6.5 * s
  const PW = 20 * s
  const PH = ((settings.badgeH ?? 37) - 6.5 - 3) * s
  const PX = 2 * s
  const PY = STRIP + 1.5 * s
  const TX = 24 * s
  const pt = (p: number) => `${p * 0.353 * s}px`

  return (
    <div style={{
      width: W, height: H, position: 'relative', overflow: 'hidden',
      backgroundColor: '#fff', border: '1px dashed #cbd5e1', borderRadius: 2 * s,
      fontFamily, flexShrink: 0,
    }}>
      {/* Strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: STRIP,
        backgroundColor: settings.accentColor || '#1e40af',
        display: 'flex', alignItems: 'flex-end',
        padding: `0 ${2 * s}px ${1.2 * s}px`,
        justifyContent: 'space-between', gap: s,
      }}>
        <span style={{
          color: settings.accentTextColor || '#fff',
          fontSize: pt(6), fontWeight: 'bold',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%',
        }}>
          {settings.schoolName}
        </span>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: s * 0.8, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: s * 0.15 }}>
            <span style={{ color: settings.accentTextColor || '#fff', fontSize: pt(5.5), whiteSpace: 'nowrap' }}>
              {settings.year}
            </span>
            <span style={{ color: settings.accentTextColor || '#fff', fontSize: pt(3.8), whiteSpace: 'nowrap', opacity: 0.75 }}>
              {student.className}
            </span>
          </div>
          {settings.logo && (
            <img src={settings.logo} alt="" style={{ height: STRIP - s, maxWidth: 12 * s, objectFit: 'contain' }} />
          )}
        </div>
      </div>

      {/* Photo */}
      <div style={{
        position: 'absolute', left: PX, top: PY, width: PW, height: PH,
        backgroundColor: '#e5e7eb', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {student.photo
          ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: pt(9), fontWeight: 'bold', color: '#9ca3af' }}>
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </span>
        }
      </div>

      {/* Text */}
      <div style={{
        position: 'absolute', left: TX, top: STRIP + 2 * s, right: 2 * s, bottom: 2 * s,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: pt(8), color: '#111', lineHeight: 1.15, marginBottom: 2 * s }}>
          {student.firstName} {student.lastName}
        </div>
        <div style={{ fontSize: pt(7), color: '#444', marginBottom: 1.5 * s }}>
          Klas: {friendlyClassName(student.className)}
        </div>
        {student.birthday && (
          <div style={{ fontSize: pt(7), color: '#444' }}>
            Geb.: {student.birthday.split('-').reverse().join('/')}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{
          borderTop: `${0.3 * s}px solid #e5e7eb`,
          paddingTop: 0.8 * s,
          fontSize: pt(5.5), color: '#888',
        }}>
          {settings.website}
        </div>
      </div>
    </div>
  )
}
