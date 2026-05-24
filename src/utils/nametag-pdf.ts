import jsPDF from 'jspdf'
import type { Nametag, SchoolSettings } from '../types'

// Default nametag dimensions (landscape, standard event badge)
export const NT_W_MM = 90
export const NT_H_MM = 55
export const NT_COLS = 2
export const NT_ROWS = 5

function hex2rgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [30, 64, 175]
}

function drawNametag(
  doc: jsPDF,
  tag: Nametag,
  settings: SchoolSettings,
  x: number,
  y: number,
  fontName = 'helvetica'
) {
  const W = NT_W_MM
  const H = NT_H_MM
  const STRIP = 11

  const [ar, ag, ab] = hex2rgb(settings.accentColor || '#1e40af')
  const [tr, tg, tb] = hex2rgb(settings.accentTextColor || '#ffffff')

  // White background
  doc.setFillColor(255, 255, 255)
  doc.rect(x, y, W, H, 'F')

  // Accent strip at top
  doc.setFillColor(ar, ag, ab)
  doc.rect(x, y, W, STRIP, 'F')

  // Logo in strip (right side)
  const logoW = STRIP - 2
  if (settings.logo) {
    const fmt = settings.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try { doc.addImage(settings.logo, fmt, x + W - logoW - 1, y + 1, logoW, logoW) } catch { /* */ }
  }

  // School name in strip
  doc.setFont(fontName, 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(tr, tg, tb)
  const nameRight = settings.logo ? W - logoW - 3 : W - 3
  doc.text(settings.schoolName || '', x + 3, y + STRIP - 2.5)

  // Year right-aligned in strip
  if (settings.year) {
    doc.setFont(fontName, 'normal')
    doc.setFontSize(6)
    doc.text(settings.year, x + nameRight, y + STRIP - 2.5, { align: 'right' })
  }

  // Main area — centered text
  const CX = x + W / 2
  const bodyTop = y + STRIP

  // First name — very large
  doc.setFont(fontName, 'bold')
  doc.setFontSize(26)
  doc.setTextColor(15, 15, 15)
  doc.text(tag.firstName, CX, bodyTop + 16, { align: 'center', maxWidth: W - 8 })

  // Last name
  doc.setFont(fontName, 'normal')
  doc.setFontSize(15)
  doc.setTextColor(40, 40, 40)
  doc.text(tag.lastName, CX, bodyTop + 25, { align: 'center', maxWidth: W - 8 })

  // Role
  if (tag.role) {
    doc.setFont(fontName, 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(ar, ag, ab)
    doc.text(tag.role, CX, bodyTop + 33, { align: 'center', maxWidth: W - 8 })
  }

  // Divider + website
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.2)
  doc.line(x + 4, y + H - 6, x + W - 4, y + H - 6)

  if (settings.website) {
    doc.setFont(fontName, 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(160, 160, 160)
    doc.text(settings.website, CX, y + H - 2.5, { align: 'center' })
  }
}

export function generateNametagPDF(
  tags: Nametag[],
  settings: SchoolSettings
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Register custom font if present
  if (settings.customFont) {
    const { name, data } = settings.customFont
    doc.addFileToVFS(`${name}.ttf`, data)
    doc.addFont(`${name}.ttf`, name, 'normal')
    doc.addFont(`${name}.ttf`, name, 'bold')
  }
  const fontName = settings.customFont?.name ?? 'helvetica'

  // Layout: 2 cols × 5 rows on A4 (210×297mm)
  // Horizontal: (210 - 2×90) / 2 = 15mm each side margin, 0 gap
  // Vertical:   (297 - 5×55) / 2 = 11mm each side margin, 0 gap
  const cols = NT_COLS
  const rows = NT_ROWS
  const mLeft = (210 - cols * NT_W_MM) / 2
  const mTop = (297 - rows * NT_H_MM) / 2
  const perPage = cols * rows

  tags.forEach((tag, i) => {
    if (i > 0 && i % perPage === 0) doc.addPage()
    const slot = i % perPage
    const col = slot % cols
    const row = Math.floor(slot / cols)
    const x = mLeft + col * NT_W_MM
    const y = mTop + row * NT_H_MM
    drawNametag(doc, tag, settings, x, y, fontName)
  })

  return doc
}
