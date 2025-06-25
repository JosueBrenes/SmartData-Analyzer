'use client'

import { Bar, Scatter } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, PointElement } from 'chart.js'
import React from 'react'

Chart.register(CategoryScale, LinearScale, BarElement, PointElement)

interface Props {
  result: any
}

export default function EDAResults({ result }: Props) {
  const numericHeaders = result.headers.filter((_: string, i: number) => result.types[i] === 'numeric')
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold">Insights</h2>
        <ul className="list-disc pl-4 text-sm">
          {result.insights.map((ins: string, i: number) => (
            <li key={i}>{ins}</li>
          ))}
        </ul>
      </div>
      {numericHeaders.map((h: string) => {
        const hist = result.histograms[h]
        return (
          <div key={h} className="max-w-md">
            <h3 className="font-semibold mb-2">Histogram: {h}</h3>
            <Bar
              data={{
                labels: hist.binEdges.map((b: number) => b.toFixed(2)),
                datasets: [{ label: h, data: hist.counts }],
              }}
              options={{ responsive: true }}
            />
          </div>
        )
      })}
      {result.clusters && result.clusters.assignments && numericHeaders.length >= 2 && (
        <div className="max-w-md">
          <h3 className="font-semibold mb-2">Clustering (first two numeric columns)</h3>
          <Scatter
            data={{
              datasets: result.clusters.centroids.map((_: any, idx: number) => ({
                label: `Cluster ${idx + 1}`,
                data: result.clusters.points
                  .map((p: number[], i: number) =>
                    result.clusters.assignments[i] === idx ? { x: p[0], y: p[1] } : null
                  )
                  .filter(Boolean),
              })),
            }}
            options={{
              responsive: true,
              scales: {
                x: { title: { display: true, text: numericHeaders[0] } },
                y: { title: { display: true, text: numericHeaders[1] } },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}
