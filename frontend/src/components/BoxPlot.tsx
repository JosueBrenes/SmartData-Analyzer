"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Layout, Config } from "plotly.js-dist-min";

interface BoxPlotData {
  categoria: string;
  valores: number[];
}

interface BoxPlotProps {
  data: BoxPlotData[];
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
}

export default function BoxPlot({
  data,
  title = "Distribución de Valores por Categoría",
  xAxisTitle = "Categoría",
  yAxisTitle = "Valor",
}: BoxPlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || data.length === 0) return;
    const plotElement = plotRef.current;

    import("plotly.js-dist-min")
      .then((Plotly) => {
        const traces = data.map((item) => ({
          y: item.valores,
          type: "box" as const,
          name: item.categoria,
          boxpoints: "outliers" as const,
          marker: {
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          },
          line: {
            color: `hsl(${Math.random() * 360}, 70%, 40%)`,
          },
        }));

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
          showlegend: false,
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
      if (plotElement) {
        import("plotly.js-dist-min").then((Plotly) => {
          Plotly.purge(plotElement);
        });
      }
    };
  }, [data, title, xAxisTitle, yAxisTitle]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay datos suficientes para generar el boxplot.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={plotRef}
          className="w-full h-[400px]"
          style={{ minHeight: "400px" }}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Interpretación:</strong> Cada caja muestra la distribución
            de valores para cada categoría. La línea central representa la
            mediana, los bordes de la caja son los cuartiles Q1 y Q3, y los
            puntos externos son valores atípicos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
