"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm px-6 py-4 flex items-center space-x-4">
      <Link href="/" className="flex items-center space-x-4">
        <Image
          src="/logo.png"
          alt="SmartData Analyzer Logo"
          width={36}
          height={36}
          className="rounded"
        />
        <h1 className="text-xl font-semibold text-gray-800">
          SmartData Analyzer
        </h1>
      </Link>
    </header>
  );
}
