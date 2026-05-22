export async function compressImage(file: File, maxW = 300, maxH = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(maxW / img.width, maxH / img.height, 1)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export interface PhotoMatch {
  file: File
  studentId: string | null
  studentName?: string
}

export function matchPhotos(
  files: File[],
  students: Array<{ id: string; firstName: string; lastName: string }>
): PhotoMatch[] {
  return files
    .filter(f => f.type.startsWith('image/'))
    .map(file => {
      const stem = normalize(file.name.replace(/\.[^/.]+$/, ''))
      for (const s of students) {
        const first = normalize(s.firstName)
        const last = normalize(s.lastName)
        if (
          stem === last + first ||
          stem === first + last ||
          stem === last ||
          (stem.includes(last) && stem.includes(first))
        ) {
          return { file, studentId: s.id, studentName: `${s.firstName} ${s.lastName}` }
        }
      }
      return { file, studentId: null }
    })
}
