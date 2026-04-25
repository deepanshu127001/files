import { motion } from 'framer-motion'
import { Calendar, User, Flag } from 'lucide-react'
import { cn, formatDate, priorityColor, priorityDot } from '@/lib/utils'
import type { Card } from '@/types'

interface Props {
  card: Card
  isDragging?: boolean
  onClick: () => void
}

export default function CardItem({ card, isDragging, onClick }: Props) {
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        'group bg-[#1c1c1f] border border-zinc-800 rounded-lg p-3 cursor-pointer',
        'hover:border-zinc-700 hover:shadow-card-hover transition-all select-none',
        isDragging && 'shadow-2xl scale-105 rotate-1'
      )}
    >
      {/* Priority bar */}
      <div className="flex items-start gap-2 mb-2">
        <div className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-none', priorityDot(card.priority))} />
        <p className="text-sm text-zinc-200 font-medium leading-snug flex-1">{card.title}</p>
      </div>

      {/* Description preview */}
      {card.description && (
        <p className="text-xs text-zinc-500 mb-2 line-clamp-2 leading-relaxed pl-3.5">
          {card.description}
        </p>
      )}

      {/* Footer metadata */}
      <div className="flex items-center gap-2 flex-wrap pl-3.5">
        {/* Priority badge */}
        <span className={cn(
          'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border',
          priorityColor(card.priority)
        )}>
          <Flag size={9} />
          {card.priority}
        </span>

        {/* Due date */}
        {card.dueDate && (
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px]',
            isOverdue ? 'text-red-400' : 'text-zinc-500'
          )}>
            <Calendar size={9} />
            {formatDate(card.dueDate)}
          </span>
        )}

        {/* Assignee */}
        {card.assignee && (
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 ml-auto">
            <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">
              {card.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[60px] truncate">{card.assignee}</span>
          </span>
        )}
      </div>
    </motion.div>
  )
}
