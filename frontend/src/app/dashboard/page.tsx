"use client";

import UploadData from "@/components/UploadData";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-8 flex-1 space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <UploadData />
      </div>
    </div>
  );
}
