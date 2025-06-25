import { NextResponse } from 'next/server'

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  const rows = lines.slice(1).map((l) => l.split(','))
  return { headers, rows }
}

function detectType(values: string[]) {
  if (values.every((v) => !isNaN(parseFloat(v)))) return 'numeric'
  if (values.every((v) => !isNaN(Date.parse(v)))) return 'date'
  return 'categorical'
}

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function median(nums: number[]) {
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function std(nums: number[]) {
  const m = mean(nums)
  const variance = mean(nums.map((n) => (n - m) ** 2))
  return Math.sqrt(variance)
}

function min(nums: number[]) {
  return Math.min(...nums)
}
function max(nums: number[]) {
  return Math.max(...nums)
}

function iqrOutliers(nums: number[]) {
  const sorted = [...nums].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const lower = q1 - 1.5 * iqr
  const upper = q3 + 1.5 * iqr
  return nums.filter((n) => n < lower || n > upper)
}

function pearson(x: number[], y: number[]) {
  const mx = mean(x)
  const my = mean(y)
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0)
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
      y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  )
  return num / den
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  const text = await file.text()
  const { headers, rows } = parseCSV(text)
  const columns = headers.map((_, i) => rows.map((r) => r[i]))
  const types = columns.map(detectType)

  const stats: Record<string, any> = {}
  columns.forEach((col, idx) => {
    if (types[idx] === 'numeric') {
      const nums = col.map(Number)
      stats[headers[idx]] = {
        mean: mean(nums),
        median: median(nums),
        std: std(nums),
        min: min(nums),
        max: max(nums),
        outliers: iqrOutliers(nums).length,
      }
    } else {
      const unique = Array.from(new Set(col))
      stats[headers[idx]] = { unique: unique.length }
    }
  })

  const correlations: Record<string, number> = {}
  for (let i = 0; i < headers.length; i++) {
    for (let j = i + 1; j < headers.length; j++) {
      if (types[i] === 'numeric' && types[j] === 'numeric') {
        const x = columns[i].map(Number)
        const y = columns[j].map(Number)
        correlations[`${headers[i]}__${headers[j]}`] = pearson(x, y)
      }
    }
  }

  return NextResponse.json({ headers, types, stats, correlations })
}
