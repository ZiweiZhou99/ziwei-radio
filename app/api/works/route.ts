import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const worksPath = path.join(process.cwd(), 'content', 'works.json')
  const works = fs.existsSync(worksPath)
    ? JSON.parse(fs.readFileSync(worksPath, 'utf-8'))
    : []
  return NextResponse.json({ works })
}
