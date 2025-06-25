"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OutlierRecord {
  id: number;
  variable: string;
  value: number;
  zScore?: number;
  iqrStatus?: string;
  rowData: Record<string, any>;
}

interface OutlierDetectionProps {
  outliers: OutlierRecord[];
}

export default function OutlierDetection({ outliers }: OutlierDetectionProps) {
  const [expandedVariables, setExpandedVariables] = useState<Set<string>>(
    new Set()
  );
  const [showDetails, setShowDetails] = useState<Set<number>>(new Set());

  // Group outliers by variable
  const groupedOutliers = useMemo(() => {
    const groups: Record<string, OutlierRecord[]> = {};
    outliers.forEach((outlier) => {
      if (!groups[outlier.variable]) {
        groups[outlier.variable] = [];
      }
      groups[outlier.variable].push(outlier);
    });

    // Sort each group by severity (Z-score descending)
    Object.keys(groups).forEach((variable) => {
      groups[variable].sort((a, b) => {
        const aScore = a.zScore || 0;
        const bScore = b.zScore || 0;
        return bScore - aScore;
      });
    });

    return groups;
  }, [outliers]);

  const toggleVariable = (variable: string) => {
    const newExpanded = new Set(expandedVariables);
    if (newExpanded.has(variable)) {
      newExpanded.delete(variable);
    } else {
      newExpanded.add(variable);
    }
    setExpandedVariables(newExpanded);
  };

  const toggleDetails = (id: number) => {
    const newShowDetails = new Set(showDetails);
    if (newShowDetails.has(id)) {
      newShowDetails.delete(id);
    } else {
      newShowDetails.add(id);
    }
    setShowDetails(newShowDetails);
  };

  const getOutlierReason = (outlier: OutlierRecord): string => {
    const reasons: string[] = [];

    if (outlier.zScore && outlier.zScore > 3) {
      reasons.push("Z-Score {'>'} 3 (Extremo)");
    } else if (outlier.zScore && outlier.zScore > 2.5) {
      reasons.push("Z-Score {'>'} 2.5 (Moderado)");
    }

    if (outlier.iqrStatus) {
      reasons.push(`IQR: ${outlier.iqrStatus}`);
    }

    return reasons.join(", ") || "Valor atípico detectado";
  };

  const getSeverityColor = (outlier: OutlierRecord): string => {
    if (outlier.zScore && outlier.zScore > 3) return "destructive";
    if (outlier.zScore && outlier.zScore > 2.5) return "secondary";
    return "outline";
  };

  const getSeverityLevel = (outlier: OutlierRecord): string => {
    if (outlier.zScore && outlier.zScore > 3) return "Alto";
    if (outlier.zScore && outlier.zScore > 2.5) return "Moderado";
    return "Bajo";
  };

  if (outliers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p>No se detectaron valores atípicos en los datos.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Valores Atípicos Detectados
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Se encontraron {outliers.length} valores atípicos en{" "}
          {Object.keys(groupedOutliers).length} variable(s)
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedOutliers).map(
            ([variable, variableOutliers]) => (
              <Collapsible
                key={variable}
                open={expandedVariables.has(variable)}
                onOpenChange={() => toggleVariable(variable)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      {expandedVariables.has(variable) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">{variable}</div>
                        <div className="text-sm text-muted-foreground">
                          {variableOutliers.length} valor(es) atípico(s)
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{variableOutliers.length}</Badge>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-2">
                  <ScrollArea className="max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Z-Score</TableHead>
                          <TableHead>Severidad</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead className="w-16">Detalles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variableOutliers.map((outlier) => (
                          <>
                            <TableRow key={`${outlier.id}-${outlier.variable}`}>
                              <TableCell className="font-mono text-sm">
                                #{outlier.id}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {outlier.value.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {outlier.zScore ? (
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {outlier.zScore.toFixed(2)}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getSeverityColor(outlier) as any}
                                >
                                  {getSeverityLevel(outlier)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {getOutlierReason(outlier)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleDetails(outlier.id)}
                                >
                                  {showDetails.has(outlier.id) ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>

                            {showDetails.has(outlier.id) && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/50">
                                  <div className="p-4">
                                    <h4 className="font-medium mb-2">
                                      Datos completos del registro #{outlier.id}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                      {Object.entries(outlier.rowData).map(
                                        ([key, value]) => (
                                          <div
                                            key={key}
                                            className={`p-2 rounded ${
                                              key === outlier.variable
                                                ? "bg-amber-100 border border-amber-300"
                                                : "bg-background"
                                            }`}
                                          >
                                            <div className="font-medium text-xs text-muted-foreground">
                                              {key}
                                            </div>
                                            <div className="font-mono">
                                              {key === outlier.variable ? (
                                                <span className="font-bold text-amber-700">
                                                  {value}
                                                </span>
                                              ) : (
                                                value
                                              )}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )
          )}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Criterios de Detección
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • <strong>Z-Score {">"} 3:</strong> Valor extremadamente atípico
              (severidad alta)
            </p>
            <p>
              • <strong>Z-Score {">"} 2.5:</strong> Valor moderadamente atípico
              (severidad moderada)
            </p>
            <p>
              • <strong>Fuera del rango IQR:</strong> Valor fuera de Q1 -
              1.5×IQR o Q3 + 1.5×IQR
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
