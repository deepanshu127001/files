import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardItem from '@/components/cards/CardItem'
import type { Card } from '@/types'

interface Props {
  card: Card
  onClick: () => void
}

export default function SortableCard({ card, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardItem
        card={card}
        isDragging={isDragging}
        onClick={onClick}
      />
    </div>
  )
}
