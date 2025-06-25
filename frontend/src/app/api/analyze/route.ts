import { NextResponse } from "next/server";
import Busboy from "busboy";
import { tmpdir } from "os";
import { Readable } from "stream";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());
  const busboy = Busboy({ headers });
  const stream = Readable.fromWeb(req.body as any) as any;

  let tempPath: string | null = null;

  const fileWritePromise = new Promise<void>((resolve, reject) => {
    busboy.on("file", (_name, file, info) => {
      const p = path.join(tmpdir(), `${Date.now()}-${info.filename}`);
      tempPath = p;

      const write = createWriteStream(p);
      file.pipe(write);
      write.on("finish", resolve);
      write.on("error", reject);
    });

    busboy.on("error", reject);
    stream.pipe(busboy);
  });

  try {
    await fileWritePromise;

    if (!tempPath) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const script = path.join(process.cwd(), "..", "backend", "analyze.py");
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const proc = spawn(pythonCommand, [script, tempPath]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => {
      const out = d.toString();
      console.log("🟢 PYTHON STDOUT:", out);
      stdout += out;
    });

    proc.stderr.on("data", (d) => {
      const err = d.toString();
      console.error("🔴 PYTHON STDERR:", err);
      stderr += err;
    });

    const code: number = await new Promise((res) => proc.on("close", res));

    await fs.unlink(tempPath).catch(() => {});

    if (code !== 0) {
      console.error("❌ Python exited with error code:", code);
      return NextResponse.json(
        { error: stderr || `Python exited with code ${code}` },
        { status: 500 }
      );
    }

    try {
      const data = JSON.parse(stdout || "{}");
      return NextResponse.json(data);
    } catch (jsonErr) {
      console.error("⚠️ Error parsing JSON:", stdout);
      return NextResponse.json(
        { error: "Failed to parse JSON from Python script" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    if (tempPath) {
      await fs.unlink(tempPath).catch(() => {});
    }

    console.error("🔥 API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
