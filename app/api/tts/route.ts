import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)
const VOICE = process.env.EDGE_TTS_VOICE || 'zh-CN-YunxiNeural'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')

  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  }

  const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`)

  try {
    // Use edge-tts CLI (pip install edge-tts)
    await execAsync(
      `edge-tts --voice ${VOICE} --text ${JSON.stringify(text)} --write-media ${tmpFile}`
    )

    const buffer = fs.readFileSync(tmpFile)
    fs.unlinkSync(tmpFile)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('TTS error:', e)
    // Try fallback: return empty audio
    return new NextResponse(null, { status: 204 })
  }
}
