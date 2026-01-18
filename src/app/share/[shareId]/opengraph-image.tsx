import type { ImageResponseOptions } from 'next/server'
import { ImageResponse } from 'next/og'

import { readArchive } from '@/lib/archiveStore'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const styles = {
  body: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #fff9f4 0%, #f6efe4 100%)',
    color: '#4e3727',
    fontFamily: '"Noto Serif KR", "Nanum Myeongjo", serif',
  },
  card: {
    width: '86%',
    height: '80%',
    borderRadius: '48px',
    border: '1px solid #f0e3d2',
    background: 'rgba(255, 255, 255, 0.92)',
    padding: '56px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '64px',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontSize: '26px',
    color: '#8b6b4b',
  },
  meta: {
    fontSize: '22px',
    color: '#9a7b5c',
  },
}

export default async function OpenGraphImage({
  params,
}: {
  params: { shareId: string }
}) {
  const data = await readArchive()
  const { shareId } = params
  const event = data.events.find((item) => item.shareId === shareId)
  const journal = data.journals.find((item) => item.shareId === shareId)
  const album = data.albums.find((item) => item.shareId === shareId)

  const title =
    event?.title || album?.title || journal?.title || '공유 페이지'
  const subtitle =
    event?.greeting ||
    event?.description ||
    album?.memo ||
    journal?.summary ||
    '소중한 순간을 함께 나눕니다.'
  const meta =
    event?.date
      ? `${event.date} · ${event.location ?? ''}`
      : ''

  return new ImageResponse(
    (
      <div style={styles.body}>
        <div style={styles.card}>
          <div>
            <div style={styles.subtitle}>Wedding Invitation</div>
            <div style={styles.title}>{title}</div>
          </div>
          <div style={styles.subtitle}>{subtitle}</div>
          <div style={styles.meta}>{meta}</div>
        </div>
      </div>
    ),
    size satisfies ImageResponseOptions
  )
}
