'use client'

import React, { useState, ChangeEvent } from 'react'

interface PreviewData {
  headers: string[]
  rows: string[][]
}

export default function UploadData() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const text = await f.text()
    const lines = text.trim().split(/\r?\n/)
    const headers = lines[0].split(',')
    const rows = lines.slice(1, 6).map((l) => l.split(','))
    setPreview({ headers, rows })
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: fd,
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
      />
      {preview && (
        <table className="border border-collapse text-sm">
          <thead>
            <tr>
              {preview.headers.map((h) => (
                <th key={h} className="border px-2 py-1">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j} className="border px-2 py-1">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        className="border rounded p-2"
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <pre className="bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
