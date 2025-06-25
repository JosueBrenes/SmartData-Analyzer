"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  Database,
} from "lucide-react";

interface InsightData {
  tipo: string;
  mensaje: string;
}

interface InsightCardsProps {
  insights: InsightData[];
}

export default function InsightCards({ insights }: InsightCardsProps) {
  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case "correlacion":
        return "🔁";
      case "outlier":
        return "⚠️";
      case "cluster":
        return "🧩";
      case "general":
        return "📊";
      default:
        return "💡";
    }
  };

  const getInsightColor = (tipo: string) => {
    switch (tipo) {
      case "correlacion":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "outlier":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "cluster":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "general":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getInsightBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "correlacion":
        return "bg-blue-100 text-blue-800";
      case "outlier":
        return "bg-amber-100 text-amber-800";
      case "cluster":
        return "bg-purple-100 text-purple-800";
      case "general":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInsightTitle = (tipo: string) => {
    switch (tipo) {
      case "correlacion":
        return "Correlación";
      case "outlier":
        return "Valor Atípico";
      case "cluster":
        return "Agrupamiento";
      case "general":
        return "Información General";
      default:
        return "Insight";
    }
  };

  const getInsightLucideIcon = (tipo: string) => {
    switch (tipo) {
      case "correlacion":
        return <TrendingUp className="h-4 w-4" />;
      case "outlier":
        return <AlertTriangle className="h-4 w-4" />;
      case "cluster":
        return <Users className="h-4 w-4" />;
      case "general":
        return <Database className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay insights disponibles para mostrar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5" />
        <h3 className="text-lg font-medium">Insights Clave del Análisis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card
            key={index}
            className={`border-2 ${getInsightColor(insight.tipo)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getInsightIcon(insight.tipo)}
                  </span>
                  {getInsightLucideIcon(insight.tipo)}
                </div>
                <Badge
                  variant="secondary"
                  className={getInsightBadgeColor(insight.tipo)}
                >
                  {getInsightTitle(insight.tipo)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-relaxed">
                {insight.mensaje}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Interpretación de Insights
        </h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            • <strong>Correlaciones:</strong> Indican relaciones lineales entre
            variables numéricas
          </p>
          <p>
            • <strong>Valores Atípicos:</strong> Registros que se desvían
            significativamente del patrón normal
          </p>
          <p>
            • <strong>Agrupamientos:</strong> Grupos naturales identificados en
            los datos
          </p>
          <p>
            • <strong>Información General:</strong> Estadísticas descriptivas
            del dataset
          </p>
        </div>
      </div>
    </div>
  );
}
