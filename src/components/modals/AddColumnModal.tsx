import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Palette } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

interface Props {
  boardId: string
  onClose: () => void
}

const COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#22c55e', // green
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#06b6d4', // cyan
]

export default function AddColumnModal({ boardId, onClose }: Props) {
  const { createColumn } = useStore()
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(COLORS[0])

  function handleCreate() {
    if (!title.trim()) return
    createColumn(boardId, title.trim(), color)
    onClose()
  }

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
          className="w-full max-w-sm bg-[#18181b] border border-zinc-700/80 rounded-2xl shadow-modal overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-zinc-100 text-sm">Add column</h2>
            <button onClick={onClose} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="field-label">Column name</label>
              <input
                autoFocus
                type="text"
                className="input-base w-full text-sm"
                placeholder="e.g., To Do, In Progress..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') onClose()
                }}
              />
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <label className="field-label">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'aspect-square rounded-lg transition-all border-2',
                      color === c
                        ? 'border-zinc-400 ring-2 ring-offset-2 ring-offset-zinc-900'
                        : 'border-transparent hover:border-zinc-600'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-800">
            <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              Create column
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
