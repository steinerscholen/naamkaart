export interface Student {
  id: string
  firstName: string
  lastName: string
  className: string
  birthday: string // YYYY-MM-DD or ''
  photo?: string // base64 data URL (compressed JPEG)
}

export interface SchoolSettings {
  schoolName: string
  website: string
  year: string // e.g. "2025-2026"
  logo?: string // base64 data URL
  accentColor: string // hex
  accentTextColor: string // hex
  marginTop: number // mm, space above first row
  marginLeft: number // mm, space left of first column
  gapX: number // mm, horizontal gap between sticker columns
  gapY: number // mm, vertical gap between sticker rows
}

export type SlotState = 'available' | 'used'

export interface StickerSheet {
  id: string
  label: string
  slots: SlotState[] // length 24
  createdAt: string
}

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'Mijn School',
  website: 'www.school.be',
  year: '2025-2026',
  accentColor: '#1e40af',
  accentTextColor: '#ffffff',
  marginTop: 0,
  marginLeft: 0,
  gapX: 0,
  gapY: 0,
}

export const BADGE_W_MM = 70
export const BADGE_H_MM = 37
export const BADGES_PER_ROW = 3
export const BADGES_PER_COL = 8
export const BADGES_PER_PAGE = 24
