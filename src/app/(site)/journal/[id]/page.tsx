import JournalDetailClient from '@/components/journal/JournalDetailClient'

type Props = {
  params: {
    id: string
  }
}

export default function JournalDetailPage({ params }: Props) {
  return <JournalDetailClient id={params.id} />
}
