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
import { UploadCloud, FileText, Loader2, BarChart3 } from "lucide-react";
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

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ChartDataItem {
  name: string;
  value: number;
  // Podría haber más propiedades dependiendo del gráfico
}

interface ChartConfig {
  type: string; // 'histogram', 'scatter', etc.
  title: string;
  data: ChartDataItem[];
  xKey: string;
  yKey: string;
  description?: string;
}

export default function UploadDataImproved() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [textualReport, setTextualReport] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]); // Estado para los datos de los gráficos
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setResult(null);
    setTextualReport(null);
    setCharts([]); // Limpiar gráficos anteriores

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
      const res = await fetch("/api/analyze-textual", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }
      const data = await res.json();

      if (data.textualAnalysis) {
        setTextualReport(data.textualAnalysis);
      } else {
        setTextualReport(
          "No se pudo generar el reporte textual o el formato es incorrecto."
        );
      }

      if (data.chartsData && Array.isArray(data.chartsData)) {
        setCharts(data.chartsData); // Guardar datos de los gráficos
      }

      setResult(data.rawAnalysis || data);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setTextualReport(`Error al generar el análisis: ${errorMessage}`);
      setResult({ error: "Failed to analyze data. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const renderChart = (chartConfig: ChartConfig, index: number) => {
    // Por ahora, solo implementamos un tipo de gráfico (BarChart para histograma)
    // Esto se puede expandir para otros tipos de gráficos (scatter, pie, etc.)
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
    // Añadir más 'else if' para otros tipos de gráficos
    return (
      <p key={index}>
        Tipo de gráfico '{chartConfig.type}' no soportado todavía.
      </p>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      {" "}
      {/* Aumentado max-w */}
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

          {charts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 mt-6 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Visualizaciones Generadas
              </h3>
              {charts.map((chartConfig, index) =>
                renderChart(chartConfig, index)
              )}
            </div>
          )}

          {result && !textualReport && charts.length === 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Resultado del Análisis (JSON)
              </h3>
              <ScrollArea className="bg-muted p-4 rounded-md max-h-80 text-sm">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </ScrollArea>
            </div>
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
