import jsPDF from 'jspdf'
import type { Student, SchoolSettings } from '../types'
import { BADGE_W_MM, BADGE_H_MM, BADGES_PER_ROW } from '../types'

function hex2rgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [30, 64, 175]
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function drawBadge(doc: jsPDF, student: Student, settings: SchoolSettings, x: number, y: number) {
  const W = BADGE_W_MM
  const H = BADGE_H_MM
  const STRIP = 6.5

  const [ar, ag, ab] = hex2rgb(settings.accentColor || '#1e40af')
  const [tr, tg, tb] = hex2rgb(settings.accentTextColor || '#ffffff')

  // White background
  doc.setFillColor(255, 255, 255)
  doc.rect(x, y, W, H, 'F')

  // Accent strip
  doc.setFillColor(ar, ag, ab)
  doc.rect(x, y, W, STRIP, 'F')

  // School name in strip
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(tr, tg, tb)
  doc.text(settings.schoolName || '', x + 2, y + STRIP - 1.2)

  // Year in strip, right-aligned (leave room for logo)
  const year = settings.year || ''
  if (year) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    const logoSpace = settings.logo ? 13 : 2
    doc.text(year, x + W - logoSpace, y + STRIP - 1.2, { align: 'right' })
  }

  // Logo in strip
  if (settings.logo) {
    const fmt = settings.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try { doc.addImage(settings.logo, fmt, x + W - 12.5, y + 0.5, 12, STRIP - 1) } catch { /* */ }
  }

  // Photo
  const PX = x + 2, PY = y + STRIP + 1.5, PW = 20, PH = H - STRIP - 3
  doc.setFillColor(220, 220, 220)
  doc.rect(PX, PY, PW, PH, 'F')
  if (student.photo) {
    try { doc.addImage(student.photo, 'JPEG', PX, PY, PW, PH) } catch { /* */ }
  } else {
    // Initials placeholder
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(160, 160, 160)
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
    doc.text(initials, PX + PW / 2, PY + PH / 2 + 1.5, { align: 'center' })
  }

  // Text area
  const TX = x + 24
  const TW = W - TX + x - 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 15, 15)
  const fullName = `${student.firstName} ${student.lastName}`
  doc.text(fullName, TX, y + STRIP + 6.5, { maxWidth: TW })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(60, 60, 60)
  doc.text(`Klas: ${student.className}`, TX, y + STRIP + 12)

  if (student.birthday) {
    doc.text(`Geb.: ${fmtDate(student.birthday)}`, TX, y + STRIP + 17)
  }

  // Divider
  doc.setDrawColor(210, 210, 210)
  doc.setLineWidth(0.2)
  doc.line(TX, y + H - 8.5, x + W - 2, y + H - 8.5)

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

  const mTop = settings.marginTop ?? 0
  const mLeft = settings.marginLeft ?? 0
  const gX = settings.gapX ?? 0
  const gY = settings.gapY ?? 0

  let slot = startSlot

  students.forEach((student, i) => {
    if (i > 0 && slot >= 24) {
      doc.addPage()
      slot = 0
    }
    const col = slot % BADGES_PER_ROW
    const row = Math.floor(slot / BADGES_PER_ROW)
    const x = mLeft + col * (BADGE_W_MM + gX)
    const y = mTop + row * (BADGE_H_MM + gY)
    drawBadge(doc, student, settings, x, y)
    slot++
  })

  return doc
}

export function slotsUsedOnFirstPage(count: number, startSlot: number): number[] {
  const n = Math.min(count, 24 - startSlot)
  return Array.from({ length: n }, (_, i) => startSlot + i)
}
