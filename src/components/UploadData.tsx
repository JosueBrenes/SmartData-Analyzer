"use client";
import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import EDAResults from "./EDAResults";
  headers: string[];
  rows: string[][];
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.name.endsWith(".xlsx") || f.name.endsWith(".xls")) {
      const buffer = await f.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 }) as string[][];
      const headers = rows[0] as string[];
      setPreview({ headers, rows: rows.slice(1, 6) });
      const text = await f.text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const rows = lines.slice(1, 6).map((line) => line.split(","));
      setPreview({ headers, rows });
  };
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/analyze", {
      method: "POST",
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
        {loading ? "Analyzing..." : "Analyze"}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null); // Clear previous results
    const text = await f.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) {
      setPreview(null);
      return;
    }
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines
      .slice(1, 6)
      .map((l) => l.split(",").map((cell) => cell.trim())); // Show first 5 data rows
    setPreview({ headers, rows });
  };

      {result && <EDAResults result={result} />}
    try {
      const res = await fetch("/api/analyze", {
        // Assuming this API endpoint exists
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Upload failed:", error);
      setResult({ error: "Failed to analyze data. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
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
                      {preview.headers.map((h, index) => (
                        <TableHead
                          key={`${h}-${index}`}
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
            <div>
              <h3 className="text-lg font-medium mb-2">Analysis Result</h3>
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
