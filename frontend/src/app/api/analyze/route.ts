import { NextResponse } from "next/server";
import Busboy from "busboy";
import { promises as fs, createWriteStream } from "fs";
import path from "path";
import { spawn } from "child_process";
import { tmpdir } from "os";
import { Readable } from "stream";

export async function POST(req: Request) {
  const tempPath = path.join(tmpdir(), `upload-${Date.now()}.csv`);

  const headers = Object.fromEntries(req.headers.entries());

  await new Promise<void>((resolve, reject) => {
    const bb = Busboy({ headers });
    let fileWritten = false;

    bb.on("file", (_name, file) => {
      fileWritten = true;
      const ws = createWriteStream(tempPath);
      file.pipe(ws);
      ws.on("finish", resolve);
      ws.on("error", reject);
    });

    bb.on("error", reject);
    bb.on("finish", () => {
      if (!fileWritten) reject(new Error("File not provided"));
    });

    Readable.fromWeb(req.body as any).pipe(bb);
  });

  try {
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
      throw new Error(stderr || `Python exited with code ${code}`);
    }

    try {
      const data = JSON.parse(stdout || "{}");
      return NextResponse.json(data);
    } catch (jsonErr) {
      console.error("⚠️ Error parsing JSON:", stdout);
      throw new Error("Failed to parse JSON from Python script");
    }
  } catch (err: any) {
    await fs.unlink(tempPath).catch(() => {});
    console.error("🔥 API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
