"use client";

import { useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Layout, Config } from "plotly.js-dist-min";

interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  id?: number;
}

interface ClusterVisualizationProps {
  data: ClusterPoint[];
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
}

export default function ClusterVisualization({
  data,
  title = "Visualización de Clusters",
  xAxisTitle = "Variable X",
  yAxisTitle = "Variable Y",
}: ClusterVisualizationProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  const clusters = Array.from(
    new Set(data.map((point) => point.cluster))
  ).sort();
  const clusterColors = useMemo(
    () => [
      "#3B82F6",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
    ],
    []
  );

  const getClusterStats = () => {
    const stats: Record<number, { count: number; color: string }> = {};
    clusters.forEach((cluster, index) => {
      const count = data.filter((point) => point.cluster === cluster).length;
      stats[cluster] = {
        count,
        color: clusterColors[index % clusterColors.length],
      };
    });
    return stats;
  };

  const clusterStats = getClusterStats();

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;
    const plotElement = plotRef.current;

    import("plotly.js-dist-min")
      .then((Plotly) => {
        const traces = clusters.map((cluster, index) => {
          const clusterData = data.filter((point) => point.cluster === cluster);
          return {
            x: clusterData.map((point) => point.x),
            y: clusterData.map((point) => point.y),
            mode: "markers" as const,
            type: "scatter" as const,
            name: `Grupo ${cluster + 1}`,
            marker: {
              color: clusterColors[index % clusterColors.length],
              size: 8,
              opacity: 0.7,
              line: {
                color: "white",
                width: 1,
              },
            },
            text: clusterData.map(
              (point) => `ID: ${point.id || "N/A"}<br>Grupo: ${cluster + 1}`
            ),
            hovertemplate: "%{text}<br>X: %{x}<br>Y: %{y}<extra></extra>",
          };
        });

        const layout: Partial<Layout> = {
          title: {
            text: title,
            font: { size: 16, family: "Arial, sans-serif" },
          },
          xaxis: {
            title: { text: xAxisTitle },
            showgrid: true,
            gridcolor: "#e5e7eb",
          },
          yaxis: {
            title: { text: yAxisTitle },
            showgrid: true,
            gridcolor: "#e5e7eb",
          },
          plot_bgcolor: "rgba(0,0,0,0)",
          paper_bgcolor: "rgba(0,0,0,0)",
          font: {
            family: "Arial, sans-serif",
            size: 12,
          },
          margin: {
            l: 60,
            r: 30,
            t: 60,
            b: 60,
          },
          showlegend: true,
          legend: {
            orientation: "h",
            y: -0.2,
            x: 0.5,
            xanchor: "center",
          },
        };

        const config: Partial<Config> = {
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: [
            "pan2d",
            "lasso2d",
            "select2d",
          ] as Partial<Config>["modeBarButtonsToRemove"],
          displaylogo: false,
        };

        Plotly.newPlot(plotElement, traces, layout, config);
      })
      .catch((error) => {
        console.error("Error loading Plotly:", error);
      });

    return () => {
      if (plotRef.current) {
        import("plotly.js-dist-min").then((Plotly) => {
          Plotly.purge(plotRef.current!);
        });
      }
    };
  }, [data, title, xAxisTitle, yAxisTitle, clusters, clusterColors]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay datos de clustering disponibles para visualizar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🧩 {title}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {clusters.map((cluster) => (
            <Badge
              key={cluster}
              variant="secondary"
              className="flex items-center gap-1"
              style={{
                backgroundColor: `${clusterStats[cluster].color}20`,
                color: clusterStats[cluster].color,
                borderColor: clusterStats[cluster].color,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: clusterStats[cluster].color }}
              />
              Grupo {cluster + 1} ({clusterStats[cluster].count})
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={plotRef}
          className="w-full h-[500px]"
          style={{ minHeight: "500px" }}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Interpretación:</strong> Cada punto representa un registro
            del dataset, coloreado según el grupo al que pertenece. Los puntos
            cercanos entre sí tienen características similares y forman clusters
            naturales en los datos.
          </p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Total de registros:</strong> {data.length}
            </div>
            <div>
              <strong>Grupos identificados:</strong> {clusters.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
