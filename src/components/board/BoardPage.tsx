import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ArrowLeft, Share2, Check, Activity, Plus } from 'lucide-react'
import { useStore } from '@/store'
import { getBoardUrl, copyToClipboard } from '@/lib/utils'
import KanbanColumn from '@/components/columns/KanbanColumn'
import CardItem from '@/components/cards/CardItem'
import ActivitySidebar from '@/components/board/ActivitySidebar'
import CardModal from '@/components/modals/CardModal'
import AddColumnModal from '@/components/modals/AddColumnModal'
import type { Card } from '@/types'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { boards, columns, cards, moveCard, reorderColumns } = useStore()

  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showActivity, setShowActivity] = useState(true)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)

  const board = boardId ? boards[boardId] : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!board || !boardId) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Board not found</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go home</button>
        </div>
      </div>
    )
  }

  const boardColumns = board.columnIds
    .map(id => columns[id])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

  function getCardsForColumn(colId: string): Card[] {
    return Object.values(cards)
      .filter(c => c.columnId === colId && c.boardId === boardId)
      .sort((a, b) => a.order - b.order)
  }

  function handleDragStart(event: DragStartEvent) {
    const card = cards[event.active.id as string]
    if (card) setActiveCard(card)
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over?.id as string ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    setOverId(null)

    if (!over || active.id === over.id) return

    const cardId = active.id as string
    const card = cards[cardId]
    if (!card) return

    // Dropped onto a column directly
    if (columns[over.id as string]) {
      const targetColId = over.id as string
      const colCards = getCardsForColumn(targetColId)
      moveCard(cardId, targetColId, colCards.length)
      return
    }

    // Dropped onto another card — insert before/after it
    const overCard = cards[over.id as string]
    if (overCard) {
      const targetColId = overCard.columnId
      const colCards = getCardsForColumn(targetColId)
      const overIndex = colCards.findIndex(c => c.id === over.id)
      moveCard(cardId, targetColId, overIndex)
    }
  }

  async function handleShare() {
    await copyToClipboard(getBoardUrl(boardId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Board header */}
      <header className="flex-none border-b border-zinc-800/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-semibold text-zinc-100 text-base leading-tight">{board.title}</h1>
              {board.description && (
                <p className="text-xs text-zinc-500 mt-0.5">{board.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActivity(v => !v)}
              className={`btn-ghost ${showActivity ? 'text-indigo-400' : ''}`}
            >
              <Activity size={14} />
              Activity
            </button>
            <button onClick={handleShare} className="btn-ghost">
              {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button onClick={() => setShowAddColumn(true)} className="btn-primary">
              <Plus size={14} />
              Add column
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Columns area */}
        <div className="flex-1 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className="flex gap-4 p-6 h-full items-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {boardColumns.map(col => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  cards={getCardsForColumn(col.id)}
                  boardId={boardId}
                  isOver={overId === col.id}
                  onCardClick={(cardId) => setSelectedCardId(cardId)}
                />
              ))}

              {boardColumns.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
                  No columns yet. Add one to get started.
                </div>
              )}
            </motion.div>

            <DragOverlay>
              {activeCard && (
                <motion.div
                  initial={{ scale: 1.02, rotate: 1 }}
                  className="w-72 opacity-90 shadow-2xl"
                >
                  <CardItem card={activeCard} isDragging onClick={() => {}} />
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Activity sidebar */}
        {showActivity && (
          <ActivitySidebar boardId={boardId} onClose={() => setShowActivity(false)} />
        )}
      </div>

      {/* Card detail modal */}
      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}

      {/* Add column modal */}
      {showAddColumn && (
        <AddColumnModal
          boardId={boardId}
          onClose={() => setShowAddColumn(false)}
        />
      )}
    </div>
  )
}
