"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BoxPlot from "./BoxPlot";

// Demo data for testing the BoxPlot component
const demoData = [
  {
    categoria: "Norte",
    valores: [
      1200, 1400, 1500, 1350, 1600, 1450, 1300, 1550, 1400, 1650, 1500, 1750,
      1400, 1300, 1500,
    ],
  },
  {
    categoria: "Sur",
    valores: [
      800, 950, 1020, 900, 1100, 850, 980, 1050, 920, 1080, 950, 1150, 900, 850,
      1000,
    ],
  },
  {
    categoria: "Este",
    valores: [
      1000, 1150, 1200, 1050, 1300, 1100, 1250, 1180, 1120, 1280, 1150, 1350,
      1100, 1050, 1200,
    ],
  },
  {
    categoria: "Oeste",
    valores: [
      1100, 1250, 1300, 1150, 1400, 1200, 1350, 1280, 1220, 1380, 1250, 1450,
      1200, 1150, 1300,
    ],
  },
];

export default function DemoBoxPlot() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Demo: BoxPlot Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDemo(!showDemo)} className="mb-4">
          {showDemo ? "Ocultar Demo" : "Mostrar Demo BoxPlot"}
        </Button>

        {showDemo && (
          <BoxPlot
            data={demoData}
            title="Distribución de Ingresos por Región"
            xAxisTitle="Región"
            yAxisTitle="Ingresos ($)"
          />
        )}
      </CardContent>
    </Card>
  );
}
