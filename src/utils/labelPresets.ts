export interface LabelPreset {
  label: string
  cols: number
  rows: number
  badgeW: number  // mm
  badgeH: number  // mm
  marginTop: number
  marginLeft: number
  gapX: number
  gapY: number
}

// Common A4 label sheet formats. Measurements in mm.
// Always verify against the actual packaging before printing.
export const LABEL_PRESETS: LabelPreset[] = [
  { label: 'Avery 3475 / Zweckform 3422  —  70 × 37 mm  (3 × 8 = 24)',
    cols: 3, rows: 8, badgeW: 70, badgeH: 37, marginTop: 0, marginLeft: 0, gapX: 0, gapY: 0 },
  { label: 'Avery L7160 / J8160  —  63,5 × 38,1 mm  (3 × 7 = 21)',
    cols: 3, rows: 7, badgeW: 63.5, badgeH: 38.1, marginTop: 15.15, marginLeft: 7.25, gapX: 2.54, gapY: 0 },
  { label: 'Avery 3666  —  65 × 33,9 mm  (3 × 9 = 27)',
    cols: 3, rows: 9, badgeW: 65, badgeH: 33.9, marginTop: 8.1, marginLeft: 7.25, gapX: 2.54, gapY: 0 },
  { label: 'Avery L4736  —  63,5 × 25,4 mm  (4 × 12 = 48)',
    cols: 4, rows: 12, badgeW: 63.5, badgeH: 25.4, marginTop: 10.7, marginLeft: 7.25, gapX: 2.54, gapY: 0 },
  { label: 'Herma 4201  —  70 × 42,3 mm  (3 × 7 = 21)',
    cols: 3, rows: 7, badgeW: 70, badgeH: 42.3, marginTop: 21.5, marginLeft: 0, gapX: 0, gapY: 0 },
  { label: 'Herma 4200  —  105 × 42,3 mm  (2 × 7 = 14)',
    cols: 2, rows: 7, badgeW: 105, badgeH: 42.3, marginTop: 21.5, marginLeft: 0, gapX: 0, gapY: 0 },
]
