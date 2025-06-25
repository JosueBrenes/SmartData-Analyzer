"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OutlierDetection from "./OutlierDetection";

// Demo data for testing the OutlierDetection component
const demoOutliers = [
  {
    id: 15,
    variable: "Ingresos",
    value: 25000,
    zScore: 3.2,
    iqrStatus: "Superior al rango IQR",
    rowData: {
      ID: "15",
      Nombre: "Juan Pérez",
      Edad: "45",
      Ingresos: "25000",
      Región: "Norte",
      Experiencia: "20",
    },
  },
  {
    id: 23,
    variable: "Ingresos",
    value: 2500,
    zScore: 2.8,
    iqrStatus: "Inferior al rango IQR",
    rowData: {
      ID: "23",
      Nombre: "María García",
      Edad: "28",
      Ingresos: "2500",
      Región: "Sur",
      Experiencia: "2",
    },
  },
  {
    id: 7,
    variable: "Edad",
    value: 85,
    zScore: 3.5,
    iqrStatus: "Superior al rango IQR",
    rowData: {
      ID: "7",
      Nombre: "Carlos López",
      Edad: "85",
      Ingresos: "15000",
      Región: "Este",
      Experiencia: "45",
    },
  },
  {
    id: 31,
    variable: "Experiencia",
    value: 50,
    zScore: 2.9,
    iqrStatus: "Superior al rango IQR",
    rowData: {
      ID: "31",
      Nombre: "Ana Martínez",
      Edad: "72",
      Ingresos: "18000",
      Región: "Oeste",
      Experiencia: "50",
    },
  },
  {
    id: 12,
    variable: "Ingresos",
    value: 22000,
    zScore: 2.6,
    rowData: {
      ID: "12",
      Nombre: "Pedro Rodríguez",
      Edad: "38",
      Ingresos: "22000",
      Región: "Norte",
      Experiencia: "15",
    },
  },
];

export default function DemoOutlierDetection() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Demo: Outlier Detection Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowDemo(!showDemo)} className="mb-4">
          {showDemo ? "Ocultar Demo" : "Mostrar Demo Detección de Outliers"}
        </Button>

        {showDemo && <OutlierDetection outliers={demoOutliers} />}
      </CardContent>
    </Card>
  );
}
