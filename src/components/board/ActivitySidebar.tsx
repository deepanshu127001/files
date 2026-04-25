import { motion } from 'framer-motion'
import { X, Activity, ArrowRight, Plus, Trash2, Move } from 'lucide-react'
import { useStore } from '@/store'
import { formatRelative } from '@/lib/utils'

interface Props {
  boardId: string
  onClose: () => void
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  card_created: <Plus size={11} className="text-green-400" />,
  card_deleted: <Trash2 size={11} className="text-red-400" />,
  card_moved: <Move size={11} className="text-indigo-400" />,
  column_created: <Plus size={11} className="text-blue-400" />,
  board_created: <Plus size={11} className="text-purple-400" />,
}

const ACTION_LABELS: Record<string, string> = {
  card_created: 'Created',
  card_deleted: 'Deleted',
  card_moved: 'Moved',
  column_created: 'Column added',
  board_created: 'Board created',
}

export default function ActivitySidebar({ boardId, onClose }: Props) {
  const activity = useStore(s => s.activity[boardId] ?? [])
  const latest = activity.slice(0, 10)

  return (
    <motion.aside
      initial={{ x: 280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 280, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="w-72 flex-none border-l border-zinc-800 bg-[#0f0f12] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Activity</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {latest.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-8">No activity yet</p>
        ) : (
          latest.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2.5 p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="mt-0.5 w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-none">
                {ACTION_ICONS[entry.action] ?? <ArrowRight size={10} className="text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 truncate leading-snug">{entry.detail}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{formatRelative(entry.timestamp)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-700 text-center">Showing last 10 actions</p>
      </div>
    </motion.aside>
  )
}
