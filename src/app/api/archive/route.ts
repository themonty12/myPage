import { NextResponse } from 'next/server'

import type { ArchiveData } from '@/lib/types'
import { importData } from '@/lib/storage'
import { readArchive, writeArchive } from '@/lib/archiveStore'

export const dynamic = 'force-dynamic'

const CACHE_HEADERS = { 'Cache-Control': 'no-store' }

const getStorageDebugInfo = () => ({
  storageType: process.env.ARCHIVE_STORAGE ?? 'file',
  hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
  hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
})

export async function GET() {
  try {
    console.info('[archive] GET', getStorageDebugInfo())
    const data = await readArchive()
    return NextResponse.json(data, {
      headers: {
        ...CACHE_HEADERS,
        'X-Archive-Source': getStorageDebugInfo().storageType,
        'X-Archive-Updated-At': data.updatedAt ?? '',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { message: '파일 데이터를 불러오지 못했어요.' },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.info('[archive] POST', getStorageDebugInfo())
    const body = await request.json()
    const sanitized = importData(JSON.stringify(body))
    await writeArchive(sanitized)
    return NextResponse.json(sanitized, { headers: CACHE_HEADERS })
  } catch (error) {
    return NextResponse.json(
      { message: '파일 데이터를 저장하지 못했어요.' },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}
