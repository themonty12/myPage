import FoodDetailClient from '@/components/food/FoodDetailClient'

type Props = {
  params: { id: string }
}

export default function FoodDetailPage({ params }: Props) {
  return <FoodDetailClient id={params.id} />
}
