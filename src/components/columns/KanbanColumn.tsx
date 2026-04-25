import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreHorizontal, Trash2, Pencil, Check, X } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import SortableCard from '@/components/cards/SortableCard'
import type { Card, Column } from '@/types'

interface Props {
  column: Column
  cards: Card[]
  boardId: string
  isOver: boolean
  onCardClick: (cardId: string) => void
}

export default function KanbanColumn({ column, cards, boardId, isOver, onCardClick }: Props) {
  const { createCard, updateColumn, deleteColumn } = useStore()
  const [showMenu, setShowMenu] = useState(false)
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)

  const { setNodeRef } = useDroppable({ id: column.id })

  function handleAddCard() {
    if (!newCardTitle.trim()) return
    createCard(column.id, boardId, { title: newCardTitle.trim() })
    setNewCardTitle('')
    setAddingCard(false)
  }

  function handleRename() {
    if (editTitle.trim() && editTitle !== column.title) {
      updateColumn(column.id, { title: editTitle.trim() })
    }
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        'flex flex-col w-72 flex-none rounded-xl bg-[#111113] border border-zinc-800/80 transition-colors',
        isOver && 'border-indigo-500/40 bg-indigo-500/5'
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-zinc-800/60">
        {/* Color dot */}
        <span
          className="w-2 h-2 rounded-full flex-none"
          style={{ backgroundColor: column.color }}
        />

        {/* Title / edit */}
        {editing ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              autoFocus
              className="input-base flex-1 text-xs py-1 px-2 h-7"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') { setEditing(false); setEditTitle(column.title) }
              }}
            />
            <button onClick={handleRename} className="text-green-400 hover:text-green-300 p-0.5">
              <Check size={13} />
            </button>
            <button onClick={() => { setEditing(false); setEditTitle(column.title) }} className="text-zinc-600 hover:text-zinc-400 p-0.5">
              <X size={13} />
            </button>
          </div>
        ) : (
          <h3 className="text-xs font-semibold text-zinc-300 flex-1 truncate">{column.title}</h3>
        )}

        {/* Card count */}
        <span className="text-[10px] text-zinc-600 tabular-nums bg-zinc-800 rounded px-1.5 py-0.5">
          {cards.length}
        </span>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-7 z-30 w-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { setEditing(true); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete column "${column.title}" and all its cards?`)) {
                      deleteColumn(column.id)
                    }
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={12} /> Delete column
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 min-h-[60px] overflow-y-auto max-h-[calc(100vh-220px)]"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {cards.map(card => (
              <SortableCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>

      {/* Add card */}
      <div className="p-2 border-t border-zinc-800/60">
        <AnimatePresence>
          {addingCard ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <textarea
                autoFocus
                className="input-base w-full text-xs resize-none"
                rows={2}
                placeholder="Card title..."
                value={newCardTitle}
                onChange={e => setNewCardTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                  if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') }
                }}
              />
              <div className="flex gap-2">
                <button onClick={handleAddCard} className="btn-primary text-xs py-1 px-3">Add</button>
                <button
                  onClick={() => { setAddingCard(false); setNewCardTitle('') }}
                  className="btn-ghost text-xs py-1 px-2"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setAddingCard(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60 rounded-md transition-colors"
            >
              <Plus size={13} />
              Add card
            </button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
