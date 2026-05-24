import type { Nametag, SchoolSettings } from '../types'

interface Props {
  tag: Nametag
  settings: SchoolSettings
  scale?: number
}

export function NametagPreview({ tag, settings, scale = 2 }: Props) {
  const s = scale
  const W = 90 * s
  const H = 55 * s
  const STRIP = 11 * s
  const pt = (p: number) => `${p * 0.353 * s}px`
  const fontFamily = settings.customFont
    ? `'${settings.customFont.name}', Helvetica, Arial, sans-serif`
    : 'Helvetica, Arial, sans-serif'

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
        padding: `0 ${2.5 * s}px ${2 * s}px`,
        justifyContent: 'space-between', gap: s,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: s * 2, flex: 1, minWidth: 0 }}>
          <span style={{
            color: settings.accentTextColor || '#fff',
            fontSize: pt(7.5), fontWeight: 'bold',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {settings.schoolName}
          </span>
          {settings.year && (
            <span style={{ color: settings.accentTextColor || '#fff', fontSize: pt(6), opacity: 0.8, whiteSpace: 'nowrap' }}>
              {settings.year}
            </span>
          )}
        </div>
        {settings.logo && (
          <img
            src={settings.logo}
            alt=""
            style={{ height: STRIP - 2 * s, maxWidth: (STRIP - 2 * s) * 1.5, objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Main area */}
      <div style={{
        position: 'absolute', top: STRIP, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `${1.5 * s}px ${3 * s}px ${5 * s}px`,
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: pt(26), color: '#0f0f0f', lineHeight: 1.1, marginBottom: 0.5 * s }}>
          {tag.firstName}
        </div>
        <div style={{ fontSize: pt(15), color: '#282828', lineHeight: 1.2, marginBottom: 1.5 * s }}>
          {tag.lastName}
        </div>
        {tag.role && (
          <div style={{ fontSize: pt(9.5), color: settings.accentColor || '#1e40af', lineHeight: 1.2 }}>
            {tag.role}
          </div>
        )}
      </div>

      {/* Bottom website */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        textAlign: 'center',
        fontSize: pt(5.5), color: '#aaa',
        paddingBottom: 1.5 * s,
      }}>
        {settings.website}
      </div>
    </div>
  )
}
