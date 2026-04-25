import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { AppState, Board, Column, Card, ActivityEntry } from '@/types'

// BroadcastChannel for cross-tab real-time sync
const channel = typeof window !== 'undefined'
  ? new BroadcastChannel('kanban-sync')
  : null

const STORAGE_KEY = 'kanban-state'

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      boards: {},
      columns: {},
      cards: {},
      activity: {},

      // ── Board operations ──────────────────────────────────────────
      createBoard: (title, description = '') => {
        const id = nanoid(10)
        const now = new Date().toISOString()
        const board: Board = {
          id, title, description,
          createdAt: now, updatedAt: now, columnIds: [],
        }

        // Optimistic: create 3 default columns
        const todoId = nanoid(10)
        const doingId = nanoid(10)
        const doneId = nanoid(10)
        const defaultCols: Column[] = [
          { id: todoId, title: 'To Do', boardId: id, order: 0, color: '#6366f1', createdAt: now },
          { id: doingId, title: 'In Progress', boardId: id, order: 1, color: '#f59e0b', createdAt: now },
          { id: doneId, title: 'Done', boardId: id, order: 2, color: '#22c55e', createdAt: now },
        ]

        set(state => ({
          boards: { ...state.boards, [id]: { ...board, columnIds: [todoId, doingId, doneId] } },
          columns: {
            ...state.columns,
            [todoId]: defaultCols[0],
            [doingId]: defaultCols[1],
            [doneId]: defaultCols[2],
          },
          activity: { ...state.activity, [id]: [] },
        }))

        get().addActivity(id, { action: 'board_created', detail: `Board "${title}" created` })
        broadcast('state_updated')
        return id
      },

      updateBoard: (id, updates) => {
        set(state => ({
          boards: {
            ...state.boards,
            [id]: { ...state.boards[id], ...updates, updatedAt: new Date().toISOString() },
          },
        }))
        broadcast('state_updated')
      },

      deleteBoard: (id) => {
        set(state => {
          const board = state.boards[id]
          if (!board) return state

          const newColumns = { ...state.columns }
          const newCards = { ...state.cards }

          board.columnIds.forEach(colId => {
            Object.values(newCards)
              .filter(c => c.columnId === colId)
              .forEach(c => { delete newCards[c.id] })
            delete newColumns[colId]
          })

          const newBoards = { ...state.boards }
          delete newBoards[id]
          const newActivity = { ...state.activity }
          delete newActivity[id]

          return { boards: newBoards, columns: newColumns, cards: newCards, activity: newActivity }
        })
        broadcast('state_updated')
      },

      // ── Column operations ─────────────────────────────────────────
      createColumn: (boardId, title, color = '#6366f1') => {
        const id = nanoid(10)
        const board = get().boards[boardId]
        const order = board?.columnIds.length ?? 0
        const now = new Date().toISOString()

        set(state => ({
          columns: {
            ...state.columns,
            [id]: { id, title, boardId, order, color, createdAt: now },
          },
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              columnIds: [...(state.boards[boardId]?.columnIds ?? []), id],
              updatedAt: now,
            },
          },
        }))

        get().addActivity(boardId, { action: 'column_created', detail: `Column "${title}" added`, columnId: id })
        broadcast('state_updated')
        return id
      },

      updateColumn: (id, updates) => {
        set(state => ({
          columns: { ...state.columns, [id]: { ...state.columns[id], ...updates } },
        }))
        broadcast('state_updated')
      },

      deleteColumn: (id) => {
        set(state => {
          const col = state.columns[id]
          if (!col) return state

          const newCards = { ...state.cards }
          Object.values(newCards)
            .filter(c => c.columnId === id)
            .forEach(c => { delete newCards[c.id] })

          const newColumns = { ...state.columns }
          delete newColumns[id]

          const board = state.boards[col.boardId]
          return {
            columns: newColumns,
            cards: newCards,
            boards: {
              ...state.boards,
              [col.boardId]: {
                ...board,
                columnIds: board.columnIds.filter(cid => cid !== id),
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
        broadcast('state_updated')
      },

      reorderColumns: (boardId, orderedIds) => {
        set(state => {
          const updatedColumns = { ...state.columns }
          orderedIds.forEach((id, index) => {
            if (updatedColumns[id]) {
              updatedColumns[id] = { ...updatedColumns[id], order: index }
            }
          })
          return {
            columns: updatedColumns,
            boards: {
              ...state.boards,
              [boardId]: {
                ...state.boards[boardId],
                columnIds: orderedIds,
                updatedAt: new Date().toISOString(),
              },
            },
          }
        })
        broadcast('state_updated')
      },

      // ── Card operations ───────────────────────────────────────────
      createCard: (columnId, boardId, data) => {
        const id = nanoid(10)
        const now = new Date().toISOString()
        const cardsInCol = Object.values(get().cards).filter(c => c.columnId === columnId)
        const order = cardsInCol.length

        const card: Card = {
          id,
          title: data.title ?? 'Untitled',
          description: data.description ?? '',
          dueDate: data.dueDate ?? null,
          priority: data.priority ?? 'medium',
          assignee: data.assignee ?? '',
          columnId,
          boardId,
          order,
          createdAt: now,
          updatedAt: now,
        }

        set(state => ({ cards: { ...state.cards, [id]: card } }))
        get().addActivity(boardId, {
          action: 'card_created',
          detail: `"${card.title}" created`,
          cardId: id,
          columnId,
        })
        broadcast('state_updated')
        return id
      },

      updateCard: (id, updates) => {
        set(state => ({
          cards: {
            ...state.cards,
            [id]: { ...state.cards[id], ...updates, updatedAt: new Date().toISOString() },
          },
        }))
        broadcast('state_updated')
      },

      deleteCard: (id) => {
        const card = get().cards[id]
        set(state => {
          const newCards = { ...state.cards }
          delete newCards[id]
          return { cards: newCards }
        })
        if (card) {
          get().addActivity(card.boardId, {
            action: 'card_deleted',
            detail: `"${card.title}" deleted`,
            cardId: id,
          })
        }
        broadcast('state_updated')
      },

      moveCard: (cardId, toColumnId, newOrder) => {
        const card = get().cards[cardId]
        if (!card) return

        const fromCol = get().columns[card.columnId]
        const toCol = get().columns[toColumnId]

        set(state => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...state.cards[cardId],
              columnId: toColumnId,
              order: newOrder,
              updatedAt: new Date().toISOString(),
            },
          },
        }))

        if (card.columnId !== toColumnId) {
          get().addActivity(card.boardId, {
            action: 'card_moved',
            detail: `"${card.title}" moved from "${fromCol?.title}" to "${toCol?.title}"`,
            cardId,
            columnId: toColumnId,
          })
        }
        broadcast('state_updated')
      },

      // ── Activity log ──────────────────────────────────────────────
      addActivity: (boardId, entry) => {
        const activityEntry: ActivityEntry = {
          id: nanoid(8),
          boardId,
          timestamp: new Date().toISOString(),
          ...entry,
        }
        set(state => ({
          activity: {
            ...state.activity,
            [boardId]: [activityEntry, ...(state.activity[boardId] ?? [])].slice(0, 50),
          },
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ── BroadcastChannel: sync across tabs ───────────────────────────────────────
function broadcast(type: string) {
  channel?.postMessage({ type, timestamp: Date.now() })
}

if (channel) {
  channel.onmessage = (e) => {
    if (e.data?.type === 'state_updated') {
      // Re-hydrate from localStorage when another tab updates
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          useStore.setState(parsed.state ?? parsed)
        } catch { /* ignore parse errors */ }
      }
    }
  }
}
