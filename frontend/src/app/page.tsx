"use client";

import UploadData from "@/components/UploadData";

export default function Dashboard() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Data Analyzer Dashboard</h1>
      <UploadData />
    </main>
  );
}
