import { NextResponse } from 'next/server'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { IncomingMessage } from 'http'
import { Readable } from 'stream'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  const form = formidable({ uploadDir: tmpdir(), keepExtensions: true })

  const tempPath = await new Promise<string>((resolve, reject) => {
    const nodeReq = Object.assign(Readable.fromWeb(req.body as any), {
      headers: Object.fromEntries(req.headers.entries()),
      method: req.method,
      url: req.url,
    }) as unknown as IncomingMessage

    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err)
      const f = (files.file as formidable.File)?.filepath
      if (!f) return reject(new Error('File not provided'))
      resolve(f)
    })
  }).catch((err) => {
    throw new Error('Failed to parse form data: ' + err)
  })

  try {
    const script = path.join(process.cwd(), 'backend', 'analyze.py')
    const proc = spawn('python3', [script, tempPath])

    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => (stdout += d))
    proc.stderr.on('data', (d) => (stderr += d))

    const code: number = await new Promise((res) => proc.on('close', res))

    await fs.unlink(tempPath).catch(() => {})

    if (code !== 0) {
      throw new Error(stderr || `Python exited with code ${code}`)
    }

    const data = JSON.parse(stdout || '{}')
    return NextResponse.json(data)
  } catch (err: any) {
    await fs.unlink(tempPath).catch(() => {})
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
