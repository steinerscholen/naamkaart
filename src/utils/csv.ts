import Papa from 'papaparse'
import type { Student } from '../types'

export interface CSVResult {
  headers: string[]
  rows: Record<string, string>[]
}

export interface ColumnMap {
  firstName: string
  lastName: string
  className: string
  birthday: string
}

export async function parseCSV(file: File): Promise<CSVResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: r => resolve({ headers: r.meta.fields ?? [], rows: r.data }),
      error: reject,
    })
  })
}

export function guessColumns(headers: string[]): Partial<ColumnMap> {
  const h = headers.map(x => x.toLowerCase())
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const i = h.findIndex(x => x.includes(p))
      if (i >= 0) return headers[i]
    }
    return ''
  }
  return {
    firstName: find(['voornaam', 'firstname', 'first_name', 'prenom', 'first name', 'roepnaam']),
    lastName: find(['achternaam', 'familienaam', 'lastname', 'last_name', 'famille', 'naam']),
    className: find(['klas', 'class', 'klasse', 'group', 'grade', 'afdeling']),
    birthday: find(['geboorte', 'birthday', 'birthdate', 'geboortedatum', 'dob', 'date']),
  }
}

function parseBirthday(raw: string): string {
  if (!raw) return ''
  const ddmm = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`
  const iso = raw.match(/^\d{4}-\d{2}-\d{2}$/)
  if (iso) return raw
  return ''
}

export function mapToStudents(
  rows: Record<string, string>[],
  map: ColumnMap
): Omit<Student, 'id'>[] {
  return rows
    .map(r => ({
      firstName: (r[map.firstName] ?? '').trim(),
      lastName: (r[map.lastName] ?? '').trim(),
      className: (r[map.className] ?? '').trim(),
      birthday: parseBirthday((r[map.birthday] ?? '').trim()),
    }))
    .filter(s => s.firstName || s.lastName)
}
