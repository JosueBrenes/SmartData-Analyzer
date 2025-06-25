"use client";

import { useMemo } from "react";

interface CorrelationMatrixProps {
  correlations: Record<string, number>;
}

interface MatrixData {
  variables: string[];
  matrix: number[][];
}

export default function CorrelationMatrix({
  correlations,
}: CorrelationMatrixProps) {
  const matrixData = useMemo((): MatrixData => {
    // Extract unique variables from correlation pairs
    const variableSet = new Set<string>();
    Object.keys(correlations).forEach((pair) => {
      const [var1, var2] = pair.split("__");
      variableSet.add(var1);
      variableSet.add(var2);
    });

    const variables = Array.from(variableSet).sort();
    const size = variables.length;

    // Initialize matrix with 1s on diagonal
    const matrix: number[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    // Fill diagonal with 1s (perfect correlation with self)
    for (let i = 0; i < size; i++) {
      matrix[i][i] = 1;
    }

    // Fill matrix with correlation values
    Object.entries(correlations).forEach(([pair, correlation]) => {
      const [var1, var2] = pair.split("__");
      const i = variables.indexOf(var1);
      const j = variables.indexOf(var2);

      if (i !== -1 && j !== -1) {
        matrix[i][j] = correlation;
        matrix[j][i] = correlation; // Symmetric matrix
      }
    });

    return { variables, matrix };
  }, [correlations]);

  const getColorForCorrelation = (value: number): string => {
    // Normalize value from -1 to 1 to 0 to 1
    const normalized = (value + 1) / 2;

    if (value > 0) {
      // Positive correlation: white to blue
      const intensity = Math.abs(value);
      const blue = Math.round(255 - intensity * 100);
      return `rgb(${blue}, ${blue}, 255)`;
    } else if (value < 0) {
      // Negative correlation: white to red
      const intensity = Math.abs(value);
      const redGreen = Math.round(255 - intensity * 100);
      return `rgb(255, ${redGreen}, ${redGreen})`;
    } else {
      // Zero correlation: white
      return "rgb(255, 255, 255)";
    }
  };

  const getTextColor = (value: number): string => {
    return Math.abs(value) > 0.5 ? "white" : "black";
  };

  if (matrixData.variables.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay correlaciones entre variables numéricas para mostrar.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <div className="inline-block min-w-full">
        <table className="border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100 font-semibold min-w-[120px]">
                Variables
              </th>
              {matrixData.variables.map((variable) => (
                <th
                  key={variable}
                  className="border border-gray-300 p-2 bg-gray-100 font-semibold min-w-[80px] text-xs"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {variable}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.variables.map((rowVariable, i) => (
              <tr key={rowVariable}>
                <td className="border border-gray-300 p-2 bg-gray-100 font-semibold text-xs">
                  {rowVariable}
                </td>
                {matrixData.matrix[i].map((correlation, j) => (
                  <td
                    key={`${i}-${j}`}
                    className="border border-gray-300 p-2 text-center text-xs font-medium min-w-[80px] h-[60px]"
                    style={{
                      backgroundColor: getColorForCorrelation(correlation),
                      color: getTextColor(correlation),
                    }}
                    title={`${rowVariable} vs ${
                      matrixData.variables[j]
                    }: ${correlation.toFixed(3)}`}
                  >
                    {correlation.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-300 border"></div>
          <span>Correlación Negativa</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border"></div>
          <span>Sin Correlación</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-300 border"></div>
          <span>Correlación Positiva</span>
        </div>
      </div>
    </div>
  );
}
