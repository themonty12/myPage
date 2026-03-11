import { NextResponse } from 'next/server'

import type { ArchiveData } from '@/lib/types'
import { readArchive, writeArchive } from '@/lib/archiveStore'

export async function GET() {
  try {
    const data = await readArchive()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/archive] GET error', error)
    return NextResponse.json({ error: 'Failed to read archive' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArchiveData
    await writeArchive(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/archive] POST error', error)
    return NextResponse.json({ error: 'Failed to write archive' }, { status: 500 })
  }
}
