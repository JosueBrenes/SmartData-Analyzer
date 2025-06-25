"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500 border-t">
      © {new Date().getFullYear()} SmartData Analyzer. Todos los derechos
      reservados.
    </footer>
  );
}
