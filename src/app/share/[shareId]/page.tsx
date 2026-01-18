import type { Metadata } from 'next'

import ShareClient from '@/components/share/ShareClient'
import { readArchive } from '@/lib/archiveStore'

type Props = {
  params: {
    shareId: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await readArchive()
  const { shareId } = params
  const journal = data.journals.find((item) => item.shareId === shareId)
  const album = data.albums.find((item) => item.shareId === shareId)
  const event = data.events.find((item) => item.shareId === shareId)

  const title =
    event?.title
      ? `${event.title} | 청첩장`
      : album?.title
        ? `${album.title} | 공유 앨범`
        : journal?.title
          ? `${journal.title} | 공유 기록`
          : '공유 페이지'

  const description =
    event?.greeting ||
    event?.description ||
    album?.memo ||
    journal?.summary ||
    journal?.content?.slice(0, 120) ||
    '공유된 기록을 확인해보세요.'

  const image =
    event?.coverUrl ||
    event?.photos?.[0] ||
    album?.coverUrl ||
    album?.photos?.[0] ||
    journal?.photos?.[0] ||
    `/share/${shareId}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function SharePage({ params }: Props) {
  return <ShareClient shareId={params.shareId} />
}
