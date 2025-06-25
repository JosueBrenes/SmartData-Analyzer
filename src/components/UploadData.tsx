"use client";

import { useState, type ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadCloud,
  FileText,
  Loader2,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ClusterVisualization from "./ClusterVisualization";
import BoxPlot from "./BoxPlot";
import OutlierDetection from "./OutlierDetection";
import CorrelationMatrix from "./CorrelationMatrix";
import InsightCards from "./InsightCards";

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface ChartConfig {
  type: string;
  title: string;
  data: ChartDataItem[];
  xKey: string;
  yKey: string;
  description?: string;
}

interface AnalysisResult {
  headers: string[];
  types: string[];
  stats: Record<string, any>;
  correlations: Record<string, number>;
  histograms: Record<string, { binEdges: number[]; counts: number[] }>;
  clusters: any;
  insights: string[];
  rawRows?: string[][];
}

interface InsightData {
  tipo: string;
  mensaje: string;
}

interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  id?: number;
}

export default function UploadDataImproved() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [textualReport, setTextualReport] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [boxplotData, setBoxplotData] = useState<
    Array<{ categoria: string; valores: number[] }>
  >([]);
  const [outliers, setOutliers] = useState<
    Array<{
      id: number;
      variable: string;
      value: number;
      zScore?: number;
      iqrStatus?: string;
      rowData: Record<string, any>;
    }>
  >([]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [clusterData, setClusterData] = useState<ClusterPoint[]>([]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setResult(null);
    setTextualReport(null);
    setCharts([]);

    try {
      let headers: string[] = [];
      let rows: string[][] = [];

      if (f.name.endsWith(".csv")) {
        const text = await f.text();
        const lines = text.trim().split(/\r?\n/);
        if (lines.length > 0) {
          headers = lines[0].split(",").map((h) => h.trim());
          rows = lines
            .slice(1, 6)
            .map((l) => l.split(",").map((cell) => cell.trim()));
        }
      } else if (f.name.endsWith(".xlsx")) {
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (json.length > 0) {
          headers = json[0].map(String);
          rows = json.slice(1, 6).map((row) => row.map(String));
        }
      } else {
        alert(
          "Formato de archivo no soportado. Por favor, sube un archivo CSV o XLSX."
        );
        setPreview(null);
        setFile(null);
        return;
      }

      if (headers.length > 0) {
        setPreview({ headers, rows });
      } else {
        setPreview(null);
      }
    } catch (error) {
      console.error("Error al leer el archivo:", error);
      alert(
        "Hubo un error al leer el archivo. Por favor, verifica el formato e intenta de nuevo."
      );
      setPreview(null);
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setTextualReport(null);
    setCharts([]);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Generate textual report
      const report = generateTextualReport(data);
      setTextualReport(report);

      // Generate charts from histograms
      const chartConfigs: ChartConfig[] = [];
      Object.entries(data.histograms).forEach(([variable, histData]) => {
        const chartData = histData.binEdges.map((edge, i) => ({
          name: `${edge.toFixed(1)}-${(
            edge +
            (histData.binEdges[1] - histData.binEdges[0])
          ).toFixed(1)}`,
          value: histData.counts[i] || 0,
        }));

        chartConfigs.push({
          type: "histogram",
          title: `Distribución de ${variable}`,
          description: `Histograma mostrando la distribución de valores para ${variable}`,
          xKey: "name",
          yKey: "value",
          data: chartData,
        });
      });

      setCharts(chartConfigs);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setTextualReport(`Error al generar el análisis: ${errorMessage}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const generateTextualReport = (data: AnalysisResult): string => {
    const lines: string[] = [];

    lines.push(`=== REPORTE DE ANÁLISIS DE DATOS ===\n`);
    lines.push(`Archivo analizado con ${data.headers.length} columnas\n`);

    lines.push(`--- ESTADÍSTICAS DESCRIPTIVAS ---`);
    Object.entries(data.stats).forEach(([variable, stats]) => {
      if (stats.mean !== undefined) {
        lines.push(`${variable}:`);
        lines.push(`  Media: ${stats.mean.toFixed(2)}`);
        lines.push(`  Mediana: ${stats.median.toFixed(2)}`);
        lines.push(`  Desviación estándar: ${stats.std.toFixed(2)}`);
        lines.push(
          `  Rango: ${stats.min.toFixed(2)} - ${stats.max.toFixed(2)}`
        );
        if (stats.outliers > 0) {
          lines.push(`  Valores atípicos detectados: ${stats.outliers}`);
        }
        lines.push("");
      } else if (stats.unique !== undefined) {
        lines.push(`${variable}: ${stats.unique} valores únicos`);
      }
    });

    lines.push(`--- CORRELACIONES SIGNIFICATIVAS ---`);
    Object.entries(data.correlations).forEach(([pair, correlation]) => {
      if (Math.abs(correlation) > 0.5) {
        const [var1, var2] = pair.split("__");
        const strength = Math.abs(correlation) > 0.8 ? "fuerte" : "moderada";
        const direction = correlation > 0 ? "positiva" : "negativa";
        lines.push(
          `${var1} - ${var2}: Correlación ${direction} ${strength} (r = ${correlation.toFixed(
            3
          )})`
        );
      }
    });

    if (data.insights.length > 0) {
      lines.push(`\n--- INSIGHTS ADICIONALES ---`);
      data.insights.forEach((insight) => lines.push(insight));
    }

    // Generate insights data
    const insightData: InsightData[] = [];

    // Correlation insights
    Object.entries(data.correlations).forEach(([pair, correlation]) => {
      if (Math.abs(correlation) > 0.7) {
        const [var1, var2] = pair.split("__");
        const strength = Math.abs(correlation) > 0.8 ? "fuerte" : "moderada";
        const direction = correlation > 0 ? "positiva" : "negativa";
        insightData.push({
          tipo: "correlacion",
          mensaje: `${var1} e ${var2} tienen correlación ${direction} ${strength} (r = ${correlation.toFixed(
            2
          )})`,
        });
      }
    });

    // Outlier insights
    let totalOutliers = 0;
    Object.entries(data.stats).forEach(([variable, stats]) => {
      if (stats.outliers && stats.outliers > 0) {
        totalOutliers += stats.outliers;
        insightData.push({
          tipo: "outlier",
          mensaje: `Se detectaron ${stats.outliers} valores atípicos en ${variable}`,
        });
      }
    });

    // General insights
    insightData.push({
      tipo: "general",
      mensaje: `Dataset contiene ${data.rawRows?.length || 0} registros con ${
        data.headers.length
      } variables`,
    });

    if (data.clusters && data.clusters.centroids) {
      insightData.push({
        tipo: "cluster",
        mensaje: `Se identificaron ${data.clusters.centroids.length} grupos distintos en los datos`,
      });
    }

    setInsights(insightData);

    // Generate boxplot data for categorical vs numeric comparisons
    const boxplotData: Array<{ categoria: string; valores: number[] }> = [];
    const categoricalColumns = data.headers.filter(
      (_, i) => data.types[i] === "categorical"
    );
    const numericColumns = data.headers.filter(
      (_, i) => data.types[i] === "numeric"
    );

    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      const catIndex = data.headers.indexOf(categoricalColumns[0]);
      const numIndex = data.headers.indexOf(numericColumns[0]);

      const groupedData: Record<string, number[]> = {};

      if (data.rawRows) {
        data.rawRows.forEach((row: string[]) => {
          const category = row[catIndex];
          const numericValue = Number.parseFloat(row[numIndex]);

          if (!isNaN(numericValue)) {
            if (!groupedData[category]) {
              groupedData[category] = [];
            }
            groupedData[category].push(numericValue);
          }
        });

        Object.entries(groupedData).forEach(([categoria, valores]) => {
          boxplotData.push({ categoria, valores });
        });
      }
    }

    setBoxplotData(boxplotData);

    // Generate cluster visualization data
    if (data.clusters && data.clusters.points && data.clusters.assignments) {
      const clusterPoints: ClusterPoint[] = data.clusters.points.map(
        (point: number[], index: number) => ({
          x: point[0],
          y: point[1],
          cluster: data.clusters.assignments[index],
          id: index + 1,
        })
      );
      setClusterData(clusterPoints);
    }

    // Generate outlier data for detailed analysis
    const outlierData: Array<{
      id: number;
      variable: string;
      value: number;
      zScore?: number;
      iqrStatus?: string;
      rowData: Record<string, any>;
    }> = [];

    if (data.rawRows) {
      data.rawRows.forEach((row: string[], rowIndex: number) => {
        data.headers.forEach((header, colIndex) => {
          if (data.types[colIndex] === "numeric") {
            const value = Number.parseFloat(row[colIndex]);
            if (!isNaN(value)) {
              const stats = data.stats[header];
              if (
                stats &&
                stats.mean !== undefined &&
                stats.std !== undefined
              ) {
                const zScore = Math.abs((value - stats.mean) / stats.std);

                const allValues = data
                  .rawRows!.map((r: string[]) => Number.parseFloat(r[colIndex]))
                  .filter((v: number) => !isNaN(v))
                  .sort((a: number, b: number) => a - b);

                const q1 = allValues[Math.floor(allValues.length * 0.25)];
                const q3 = allValues[Math.floor(allValues.length * 0.75)];
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;

                let iqrStatus = "";
                if (value < lowerBound) iqrStatus = "Inferior al rango IQR";
                if (value > upperBound) iqrStatus = "Superior al rango IQR";

                if (zScore > 2.5 || iqrStatus !== "") {
                  const rowData: Record<string, any> = {};
                  data.headers.forEach((h, i) => {
                    rowData[h] = row[i];
                  });

                  outlierData.push({
                    id: rowIndex + 1,
                    variable: header,
                    value,
                    zScore,
                    iqrStatus: iqrStatus || undefined,
                    rowData,
                  });
                }
              }
            }
          }
        });
      });
    }

    setOutliers(outlierData);

    return lines.join("\n");
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const renderChart = (chartConfig: ChartConfig, index: number) => {
    if (chartConfig.type === "histogram" || chartConfig.type === "barchart") {
      return (
        <div key={index} className="mb-8 p-4 border rounded-lg shadow">
          <h4 className="text-md font-semibold mb-2">{chartConfig.title}</h4>
          {chartConfig.description && (
            <p className="text-xs text-muted-foreground mb-2">
              {chartConfig.description}
            </p>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartConfig.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartConfig.yKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return (
      <p key={index}>
        Tipo de gráfico '{chartConfig.type}' no soportado todavía.
      </p>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Upload & Analyze Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={handleSelectFileClick}
              variant="outline"
              className="w-full bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <UploadCloud className="mr-2 h-5 w-5" />
              {file ? `Selected: ${file.name}` : "Select a CSV or XLSX file"}
            </Button>
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {preview && file && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Data Preview (First 5 rows)
              </h3>
              <ScrollArea className="border rounded-md max-h-60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview.headers.map((h, idx) => (
                        <TableHead
                          key={`${h}-${idx}`}
                          className="whitespace-nowrap"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, i) => (
                      <TableRow key={`row-${i}`}>
                        {row.map((v, j) => (
                          <TableCell
                            key={`cell-${i}-${j}`}
                            className="whitespace-nowrap"
                          >
                            {v}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {result && (
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger
                  value="correlations"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Correlaciones
                </TabsTrigger>
                <TabsTrigger
                  value="distributions"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Distribuciones
                </TabsTrigger>
                <TabsTrigger
                  value="boxplots"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  BoxPlots
                </TabsTrigger>
                <TabsTrigger
                  value="clusters"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Clusters
                </TabsTrigger>
                <TabsTrigger
                  value="outliers"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Outliers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-6">
                {insights.length > 0 && <InsightCards insights={insights} />}
                {textualReport && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Resumen del Análisis Automatizado
                    </h3>
                    <ScrollArea className="bg-muted p-4 rounded-md max-h-[500px] text-sm">
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {textualReport}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="correlations" className="space-y-6">
                {result && Object.keys(result.correlations).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Matriz de Correlación entre Variables Numéricas
                    </h3>
                    <CorrelationMatrix correlations={result.correlations} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="distributions" className="space-y-6">
                {charts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 mt-6 flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Distribuciones de Variables
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {charts.map((chartConfig, index) =>
                        renderChart(chartConfig, index)
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="boxplots" className="space-y-6">
                {boxplotData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Distribución por Categorías
                    </h3>
                    <BoxPlot data={boxplotData} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="clusters" className="space-y-6">
                {clusterData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Agrupamiento Automático
                    </h3>
                    <ClusterVisualization data={clusterData} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="outliers" className="space-y-6">
                {outliers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Detección de Valores Atípicos
                    </h3>
                    <OutlierDetection outliers={outliers} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
