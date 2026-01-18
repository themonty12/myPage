import AlbumDetailClient from '@/components/albums/AlbumDetailClient'

type Props = {
  params: {
    id: string
  }
}

export default function AlbumDetailPage({ params }: Props) {
  return <AlbumDetailClient id={params.id} />
}
