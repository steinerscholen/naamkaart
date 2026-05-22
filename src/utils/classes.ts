// Converts internal class codes (e.g. "01AK08A", "01TK09TB") to friendly display names ("8A", "9TB").
// Falls back to the original code for anything that doesn't match the known pattern.
export function friendlyClassName(code: string): string {
  if (!code) return code
  const m = /^01[A-Z]{2}(\d{2})([A-Z]+)$/i.exec(code)
  if (m) return `${parseInt(m[1])}${m[2].toUpperCase()}`
  return code
}
