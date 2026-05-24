import jsPDF from 'jspdf'
import type { Student, SchoolSettings } from '../types'
import { BADGE_W_MM, BADGE_H_MM, BADGES_PER_ROW } from '../types'
import { friendlyClassName } from './classes'

function registerFont(doc: jsPDF, settings: SchoolSettings) {
  if (!settings.customFont) return
  const { name, data } = settings.customFont
  doc.addFileToVFS(`${name}.ttf`, data)
  doc.addFont(`${name}.ttf`, name, 'normal')
  doc.addFont(`${name}.ttf`, name, 'bold')
}

function hex2rgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [30, 64, 175]
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function drawBadge(doc: jsPDF, student: Student, settings: SchoolSettings, x: number, y: number, fontName = 'helvetica') {
  const W = settings.badgeW ?? BADGE_W_MM
  const H = settings.badgeH ?? BADGE_H_MM
  const STRIP = 6.5

  const [ar, ag, ab] = hex2rgb(settings.accentColor || '#1e40af')
  const [tr, tg, tb] = hex2rgb(settings.accentTextColor || '#ffffff')

  // White background
  doc.setFillColor(255, 255, 255)
  doc.rect(x, y, W, H, 'F')

  // Accent strip
  doc.setFillColor(ar, ag, ab)
  doc.rect(x, y, W, STRIP, 'F')

  // School name in strip (bottom-left)
  doc.setFont(fontName, 'bold')
  doc.setFontSize(6)
  doc.setTextColor(tr, tg, tb)
  doc.text(settings.schoolName || '', x + 2, y + STRIP - 1.2)

  const logoInStrip = settings.logo && settings.logoPosition === 'strip'
  const logoSpace = logoInStrip ? 13 : 2

  // Year in strip (upper-right)
  const year = settings.year || ''
  if (year) {
    doc.setFont(fontName, 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(tr, tg, tb)
    doc.text(year, x + W - logoSpace, y + 3.2, { align: 'right' })
  }

  // Official class code under year (bottom-right, small)
  if (student.className) {
    doc.setFont(fontName, 'normal')
    doc.setFontSize(4.5)
    doc.setTextColor(tr, tg, tb)
    doc.text(student.className, x + W - logoSpace, y + STRIP - 1.2, { align: 'right' })
  }

  // Logo — strip position (top-right in accent band)
  if (logoInStrip) {
    const fmt = settings.logo!.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try { doc.addImage(settings.logo!, fmt, x + W - 12.5, y + 0.5, 12, STRIP - 1) } catch { /* */ }
  }

  // Photo
  const PX = x + 2, PY = y + STRIP + 1.5, PW = 20, PH = H - STRIP - 3
  doc.setFillColor(220, 220, 220)
  doc.rect(PX, PY, PW, PH, 'F')
  if (student.photo) {
    try { doc.addImage(student.photo, 'JPEG', PX, PY, PW, PH) } catch { /* */ }
  } else {
    // Initials placeholder
    doc.setFont(fontName, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(160, 160, 160)
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
    doc.text(initials, PX + PW / 2, PY + PH / 2 + 1.5, { align: 'center' })
  }

  // Text area
  const TX = x + 24
  const TW = W - TX + x - 2

  doc.setFont(fontName, 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 15, 15)
  const fullName = `${student.firstName} ${student.lastName}`
  doc.text(fullName, TX, y + STRIP + 6.5, { maxWidth: TW })

  doc.setFont(fontName, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(60, 60, 60)
  doc.text(`Klas: ${friendlyClassName(student.className)}`, TX, y + STRIP + 12)

  if (student.birthday) {
    doc.text(`Geb.: ${fmtDate(student.birthday)}`, TX, y + STRIP + 17)
  }

  // Logo — bottom-right position (footer zone, right of website)
  const logoBottomRight = settings.logo && settings.logoPosition !== 'strip'
  const logoW = 10, logoH = 6
  if (logoBottomRight) {
    const fmt = settings.logo!.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try { doc.addImage(settings.logo!, fmt, x + W - logoW - 1.5, y + H - logoH - 1.5, logoW, logoH) } catch { /* */ }
  }

  // Divider (stops short of logo when logo is at bottom-right)
  const dividerRight = logoBottomRight ? x + W - logoW - 4 : x + W - 2
  doc.setDrawColor(210, 210, 210)
  doc.setLineWidth(0.2)
  doc.line(TX, y + H - 8.5, dividerRight, y + H - 8.5)

  // Website
  doc.setFontSize(5.5)
  doc.setTextColor(110, 110, 110)
  doc.text(settings.website || '', TX, y + H - 4.5)
}

export function generatePDF(
  students: Student[],
  settings: SchoolSettings,
  startSlot = 0
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  registerFont(doc, settings)
  const fontName = settings.customFont?.name ?? 'helvetica'

  const mTop = settings.marginTop ?? 0
  const mLeft = settings.marginLeft ?? 0
  const gX = settings.gapX ?? 0
  const gY = settings.gapY ?? 0
  const cols = settings.cols ?? BADGES_PER_ROW
  const badgeW = settings.badgeW ?? BADGE_W_MM
  const badgeH = settings.badgeH ?? BADGE_H_MM
  const perPage = cols * (settings.rows ?? 8)

  let slot = Math.max(0, startSlot)

  students.forEach((student, i) => {
    if (i > 0 && slot >= perPage) {
      doc.addPage()
      slot = 0
    }
    const col = slot % cols
    const row = Math.floor(slot / cols)
    const x = mLeft + col * (badgeW + gX)
    const y = mTop + row * (badgeH + gY)
    drawBadge(doc, student, settings, x, y, fontName)
    slot++
  })

  return doc
}

// For existing sheets: place badges only on available slots (not sequential from startSlot).
// This handles non-contiguous available slots correctly.
export function generatePDFOnSheet(
  students: Student[],
  settings: SchoolSettings,
  availableSlotIndices: number[]
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  registerFont(doc, settings)
  const fontName = settings.customFont?.name ?? 'helvetica'

  const mTop = settings.marginTop ?? 0
  const mLeft = settings.marginLeft ?? 0
  const gX = settings.gapX ?? 0
  const gY = settings.gapY ?? 0
  const cols = settings.cols ?? BADGES_PER_ROW
  const badgeW = settings.badgeW ?? BADGE_W_MM
  const badgeH = settings.badgeH ?? BADGE_H_MM
  const perPage = cols * (settings.rows ?? 8)

  students.forEach((student, i) => {
    if (i < availableSlotIndices.length) {
      const slot = availableSlotIndices[i]
      const col = slot % cols
      const row = Math.floor(slot / cols)
      drawBadge(doc, student, settings, mLeft + col * (badgeW + gX), mTop + row * (badgeH + gY), fontName)
    } else {
      const overflow = i - availableSlotIndices.length
      if (overflow % perPage === 0) doc.addPage()
      const slot = overflow % perPage
      const col = slot % cols
      const row = Math.floor(slot / cols)
      drawBadge(doc, student, settings, mLeft + col * (badgeW + gX), mTop + row * (badgeH + gY), fontName)
    }
  })

  return doc
}

export function generatePDFByClass(
  students: Student[],
  settings: SchoolSettings
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  registerFont(doc, settings)
  const fontName = settings.customFont?.name ?? 'helvetica'

  const mTop = settings.marginTop ?? 0
  const mLeft = settings.marginLeft ?? 0
  const gX = settings.gapX ?? 0
  const gY = settings.gapY ?? 0
  const cols = settings.cols ?? BADGES_PER_ROW
  const badgeW = settings.badgeW ?? BADGE_W_MM
  const badgeH = settings.badgeH ?? BADGE_H_MM
  const perPage = cols * (settings.rows ?? 8)

  const groups = new Map<string, Student[]>()
  for (const student of students) {
    const cls = student.className || '—'
    if (!groups.has(cls)) groups.set(cls, [])
    groups.get(cls)!.push(student)
  }

  let firstPage = true
  for (const classStudents of groups.values()) {
    if (!firstPage) doc.addPage()
    firstPage = false

    classStudents.forEach((student, i) => {
      if (i > 0 && i % perPage === 0) doc.addPage()
      const slot = i % perPage
      const col = slot % cols
      const row = Math.floor(slot / cols)
      drawBadge(doc, student, settings, mLeft + col * (badgeW + gX), mTop + row * (badgeH + gY), fontName)
    })
  }

  return doc
}

export function slotsUsedOnFirstPage(count: number, startSlot: number): number[] {
  const n = Math.min(count, 24 - startSlot)
  return Array.from({ length: n }, (_, i) => startSlot + i)
}
