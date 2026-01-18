import { NextResponse } from 'next/server'

import type { ArchiveData } from '@/lib/types'
import { importData } from '@/lib/storage'
import { readArchive, writeArchive } from '@/lib/archiveStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await readArchive()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: '파일 데이터를 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sanitized = importData(JSON.stringify(body))
    await writeArchive(sanitized)
    return NextResponse.json(sanitized)
  } catch (error) {
    return NextResponse.json(
      { message: '파일 데이터를 저장하지 못했어요.' },
      { status: 500 }
    )
  }
}
