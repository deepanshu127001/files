import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Flag, Calendar, User, AlignLeft, Check } from 'lucide-react'
import { useStore } from '@/store'
import { cn, priorityColor } from '@/lib/utils'
import type { Priority } from '@/types'

interface Props {
  cardId: string
  onClose: () => void
}

export default function CardModal({ cardId, onClose }: Props) {
  const { cards, columns, updateCard, deleteCard } = useStore()
  const card = cards[cardId]

  const [title, setTitle] = useState(card?.title ?? '')
  const [description, setDescription] = useState(card?.description ?? '')
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '')
  const [priority, setPriority] = useState<Priority>(card?.priority ?? 'medium')
  const [assignee, setAssignee] = useState(card?.assignee ?? '')
  const [saved, setSaved] = useState(false)

  // Sync on open
  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description)
      setDueDate(card.dueDate ?? '')
      setPriority(card.priority)
      setAssignee(card.assignee)
    }
  }, [cardId])

  if (!card) return null

  const column = columns[card.columnId]

  function handleSave() {
    updateCard(cardId, {
      title: title.trim() || card.title,
      description,
      dueDate: dueDate || null,
      priority,
      assignee,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleDelete() {
    if (confirm(`Delete "${card.title}"?`)) {
      deleteCard(cardId)
      onClose()
    }
  }

  const PRIORITIES: Priority[] = ['low', 'medium', 'high']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="w-full max-w-lg bg-[#18181b] border border-zinc-700/80 rounded-2xl shadow-modal overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full" style={{ background: column?.color ?? '#6366f1' }} />
              {column?.title ?? 'Unknown column'}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleDelete} className="btn-danger py-1 px-2 text-xs">
                <Trash2 size={12} />
                Delete
              </button>
              <button onClick={onClose} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors ml-1">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <input
                className="w-full bg-transparent text-lg font-semibold text-zinc-100 border-none outline-none placeholder-zinc-600 focus:ring-0"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Card title"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <AlignLeft size={11} /> Description
              </label>
              <textarea
                className="input-base w-full text-sm resize-none"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a description..."
              />
            </div>

            {/* Two-column fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Due date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  <Calendar size={11} /> Due date
                </label>
                <input
                  type="date"
                  className="input-base w-full text-sm"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  <User size={11} /> Assignee
                </label>
                <input
                  type="text"
                  className="input-base w-full text-sm"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  placeholder="Name..."
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <Flag size={11} /> Priority
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all capitalize',
                      priority === p
                        ? priorityColor(p) + ' ring-1 ring-offset-1 ring-offset-zinc-900'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-800">
            <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button onClick={handleSave} className="btn-primary">
              {saved ? <><Check size={14} /> Saved!</> : 'Save changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
