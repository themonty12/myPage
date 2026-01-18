import EventDetailClient from '@/components/events/EventDetailClient'

type Props = {
  params: {
    id: string
  }
}

export default function EventDetailPage({ params }: Props) {
  return <EventDetailClient id={params.id} />
}
