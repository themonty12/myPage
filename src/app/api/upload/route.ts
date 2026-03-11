import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('[upload] BLOB_READ_WRITE_TOKEN 환경 변수가 없습니다.')
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    console.log('[upload] file', file)
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: 'public',      
    })
    console.log('[upload] blob', blob)
    console.log('[upload] completed', blob.url)
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    const message = (error as Error).message
    console.error('[upload] 에러:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
