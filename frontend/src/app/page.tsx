import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Database,
  BarChart3,
  TrendingUp,
  Shield,
  FileSpreadsheet,
  Eye,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="SmartData Analyzer Logo"
            width={40}
            height={40}
            className="h-12 w-12"
          />
          <span className="text-xl font-bold text-gray-900">
            SmartData Analyzer
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            asChild
            className="text-white px-6"
            style={{ backgroundColor: "#0D2E51" }}
          >
            <Link href="/dashboard">Launch App</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <FileSpreadsheet
              className="h-16 w-16"
              style={{ color: "#0D2E51" }}
            />
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <BarChart3 className="h-20 w-20 text-green-500" />
          </div>
          <div className="absolute bottom-40 left-20 opacity-20">
            <TrendingUp className="h-18 w-18 text-purple-500" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20">
            <Bot className="h-16 w-16 text-orange-500" />
          </div>
          <div className="absolute top-60 left-1/4 opacity-20">
            <Shield className="h-14 w-14 text-red-500" />
          </div>
          <div className="absolute top-80 right-1/3 opacity-20">
            <Eye className="h-16 w-16 text-indigo-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center py-20 px-6 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Carga.
            <br />
            Analiza.
            <br />
            <span style={{ color: "#0D2E51" }}>Visualiza.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Herramienta web interactiva para análisis y visualización
            automatizada de datasets CSV y XLSX. Obtén insights estadísticos y
            detecta patrones sin necesidad de programación.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="text-white px-8 py-4 text-lg"
              style={{ backgroundColor: "#0D2E51" }}
            >
              <Link href="/dashboard">Comenzar Análisis</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Bot
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Análisis Automático con IA
              </h3>
              <p className="text-gray-600">
                Genera insights descriptivos y correlacionales en lenguaje
                natural automáticamente.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <BarChart3
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Estadísticas Descriptivas
              </h3>
              <p className="text-gray-600">
                Media, mediana, desviación, rango y más estadísticas por
                variable automáticamente.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <TrendingUp
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Clustering Automático
              </h3>
              <p className="text-gray-600">
                Detección automática de clusters usando KMeans y análisis de
                correlaciones.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Database
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Matriz de Correlación
              </h3>
              <p className="text-gray-600">
                Detección automática de relaciones fuertes entre variables con
                visualización interactiva.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Shield
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Detección de Outliers
              </h3>
              <p className="text-gray-600">
                Identificación automática de valores atípicos usando Isolation
                Forest.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Eye
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#0D2E51" }}
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vista Previa Interactiva
              </h3>
              <p className="text-gray-600">
                Navegación por pestañas con histogramas, boxplots y
                visualizaciones modernas.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="relative z-10 py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Formatos Soportados
            </h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <FileSpreadsheet
                  className="h-8 w-8"
                  style={{ color: "#0D2E51" }}
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">CSV</div>
                  <div className="text-sm text-gray-600">UTF-8 o Latin-1</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                <FileSpreadsheet
                  className="h-8 w-8"
                  style={{ color: "#0D2E51" }}
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">XLSX/XLS</div>
                  <div className="text-sm text-gray-600">Excel compatible</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="relative z-10 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Tecnologías Utilizadas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Frontend
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Next.js",
                    "TypeScript",
                    "TailwindCSS",
                    "Radix UI",
                    "Recharts",
                    "Lucide",
                    "XLSX.js",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Backend
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python",
                    "pandas",
                    "scikit-learn",
                    "numpy",
                    "openpyxl",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="relative z-10 py-16 px-6"
          style={{ backgroundColor: "#0D2E51" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para analizar tus datos?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Sube tu archivo CSV o XLSX y obtén insights automáticos en
              segundos.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-12 py-4 text-lg font-semibold"
            >
              <Link href="/dashboard">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
