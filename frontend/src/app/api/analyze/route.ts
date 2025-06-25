import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  const rows = lines.slice(1).map((l) => l.split(','))
  return { headers, rows }
}

function parseXLSX(buffer: ArrayBuffer) {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 }) as string[][]
  const headers = rows[0] as string[]
  return { headers, rows: rows.slice(1) }
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
  let parsed
  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer()
    parsed = parseXLSX(buffer)
  } else {
    const text = await file.text()
    parsed = parseCSV(text)
  }
  const { headers, rows } = parsed
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

  const histograms: Record<string, { binEdges: number[]; counts: number[] }> = {}
  columns.forEach((col, idx) => {
    if (types[idx] === 'numeric') {
      const nums = col.map(Number)
      const nBins = 10
      const minVal = min(nums)
      const maxVal = max(nums)
      const binSize = (maxVal - minVal) / nBins
      const counts = new Array(nBins).fill(0)
      nums.forEach((v) => {
        const bin = Math.min(nBins - 1, Math.floor((v - minVal) / binSize))
        counts[bin]++
      })
      const binEdges = new Array(nBins).fill(0).map((_, i) => minVal + i * binSize)
      histograms[headers[idx]] = { binEdges, counts }
    }
  })

  function kmeans(points: number[][], k: number, iterations = 5) {
    let centroids = points.slice(0, k)
    let assignments = new Array(points.length).fill(0)
    for (let it = 0; it < iterations; it++) {
      assignments = points.map((p) => {
        let minD = Infinity
        let idx = 0
        centroids.forEach((c, i) => {
          const d = Math.hypot(...c.map((v, j) => v - p[j]))
          if (d < minD) {
            minD = d
            idx = i
          }
        })
        return idx
      })
      centroids = centroids.map((_, i) => {
        const clusterPoints = points.filter((_, idx) => assignments[idx] === i)
        if (clusterPoints.length === 0) return centroids[i]
        const dim = clusterPoints[0].length
        const avg = new Array(dim).fill(0)
        clusterPoints.forEach((p) => {
          p.forEach((v, j) => {
            avg[j] += v
          })
        })
        return avg.map((v) => v / clusterPoints.length)
      })
    }
    return { assignments, centroids }
  }

  let clusters: any = null
  const numericIndices = types
    .map((t, i) => (t === 'numeric' ? i : -1))
    .filter((i) => i !== -1)
  if (numericIndices.length >= 2) {
    const pts = rows.map((r) => numericIndices.map((idx) => Number(r[idx])))
    clusters = { ...kmeans(pts, 3), points: pts }
  }

  const insights: string[] = [`Se analizaron ${rows.length} registros.`]
  Object.entries(correlations).forEach(([pair, val]) => {
    if (Math.abs(val) > 0.8) {
      const [a, b] = pair.split('__')
      insights.push(`Existe una fuerte correlación entre ${a} e ${b} (r = ${val.toFixed(2)})`)
    }
  })
  Object.keys(stats).forEach((key) => {
    const st = stats[key]
    if (st.outliers && st.outliers > 0) {
      insights.push(`Se detectaron ${st.outliers} valores atípicos en la columna ${key}`)
    }
  })

  return NextResponse.json({ headers, types, stats, correlations, histograms, clusters, insights })
}
