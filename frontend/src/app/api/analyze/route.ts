import formidable from 'formidable'
import { promises as fs } from 'fs'
export const runtime = 'nodejs'
export async function POST(req: Request) {
  const form = formidable({ uploadDir: tmpdir(), keepExtensions: true })
  const stream = Readable.fromWeb(req.body as any) as any
  stream.headers = Object.fromEntries(req.headers.entries())

  const { files } = await new Promise<{
    files: formidable.Files
  }>((resolve, reject) => {
    form.parse(stream, (err, _fields, files) => {
      if (err) reject(err)
      else resolve({ files })
  const file = Array.isArray(files.file) ? files.file[0] : (files.file as formidable.File)
  if (!file || !file.filepath) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  const tempPath = file.filepath

    if (data.error) {
      return NextResponse.json(data, { status: 500 })
    }
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
