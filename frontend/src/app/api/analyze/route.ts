import Busboy from 'busboy'
import { promises as fs, createWriteStream } from 'fs'
export const runtime = 'nodejs'
export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers.entries())
  const busboy = Busboy({ headers })
  const stream = Readable.fromWeb(req.body as any) as any
  let tempPath: string | null = null

  const busboyPromise = new Promise<void>((resolve, reject) => {
    busboy.on('file', (_name, file, info) => {
      const p = path.join(tmpdir(), `${Date.now()}-${info.filename}`)
      tempPath = p
      const write = createWriteStream(p)
      file.pipe(write)
      write.on('finish', () => resolve())
      write.on('error', reject)
    busboy.on('error', reject)
    stream.pipe(busboy)
    await busboyPromise
    if (!tempPath) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (tempPath) {
      await fs.unlink(tempPath).catch(() => {})
    }
      return NextResponse.json(data, { status: 500 })
    }
    if (tempPath) {
      await fs.unlink(tempPath).catch(() => {})
    }

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
