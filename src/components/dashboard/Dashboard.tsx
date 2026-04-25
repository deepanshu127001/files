import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, LayoutGrid, Clock, Hash, Trash2, Pencil, Check, X } from 'lucide-react'
import { useStore } from '@/store'
import { formatRelative } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { boards, cards, createBoard, updateBoard, deleteBoard } = useStore()
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const boardList = Object.values(boards).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  function handleCreate() {
    if (!newTitle.trim()) return
    const id = createBoard(newTitle.trim())
    setNewTitle('')
    setCreating(false)
    navigate(`/board/${id}`)
  }

  function cardCount(boardId: string) {
    return Object.values(cards).filter(c => c.boardId === boardId).length
  }

  function startEdit(board: { id: string; title: string }) {
    setEditingId(board.id)
    setEditTitle(board.title)
  }

  function commitEdit() {
    if (editingId && editTitle.trim()) {
      updateBoard(editingId, { title: editTitle.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
              <LayoutGrid size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">Kanban</span>
            <span className="text-xs text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">
              {boardList.length} boards
            </span>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="btn-primary"
          >
            <Plus size={15} />
            New board
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Your boards</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and organize your projects</p>
        </div>

        {/* Create form inline */}
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 p-4 bg-zinc-900 border border-zinc-700 rounded-xl"
          >
            <input
              autoFocus
              className="input-base flex-1"
              placeholder="Board name..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setCreating(false)
              }}
            />
            <button onClick={handleCreate} className="btn-primary">Create</button>
            <button onClick={() => setCreating(false)} className="btn-ghost">Cancel</button>
          </motion.div>
        )}

        {/* Board grid */}
        {boardList.length === 0 && !creating ? (
          <EmptyState onNew={() => setCreating(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardList.map((board, i) => (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative bg-[#18181b] border border-zinc-800 rounded-xl p-5
                           hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                {/* Board color accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-indigo-500/60" />

                {/* Actions */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => startEdit(board)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${board.title}"? This cannot be undone.`)) {
                        deleteBoard(board.id)
                      }
                    }}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Title */}
                {editingId === board.id ? (
                  <div className="flex items-center gap-2 mb-3" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="input-base flex-1 text-base font-medium"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <button onClick={commitEdit} className="p-1.5 rounded text-green-400 hover:bg-green-400/10">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded text-zinc-500 hover:bg-zinc-800">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-zinc-100 text-base mb-3 pr-16 truncate">
                    {board.title}
                  </h3>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Hash size={11} />
                    <span className="tabular-nums font-medium text-zinc-400">{cardCount(board.id)}</span>
                    cards
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {formatRelative(board.updatedAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
        <LayoutGrid size={22} className="text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-zinc-300 mb-2">No boards yet</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs">
        Create your first board to start organizing your work
      </p>
      <button onClick={onNew} className="btn-primary">
        <Plus size={15} />
        Create board
      </button>
    </motion.div>
  )
}
