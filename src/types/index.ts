export type Priority = 'low' | 'medium' | 'high'

export interface Card {
  id: string
  title: string
  description: string
  dueDate: string | null
  priority: Priority
  assignee: string
  columnId: string
  boardId: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  title: string
  boardId: string
  order: number
  color: string
  createdAt: string
}

export interface ActivityEntry {
  id: string
  boardId: string
  action: string
  detail: string
  timestamp: string
  cardId?: string
  columnId?: string
}

export interface Board {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  columnIds: string[]
}

export interface AppState {
  boards: Record<string, Board>
  columns: Record<string, Column>
  cards: Record<string, Card>
  activity: Record<string, ActivityEntry[]>

  // Board CRUD
  createBoard: (title: string, description?: string) => string
  updateBoard: (id: string, updates: Partial<Pick<Board, 'title' | 'description'>>) => void
  deleteBoard: (id: string) => void

  // Column CRUD
  createColumn: (boardId: string, title: string, color?: string) => string
  updateColumn: (id: string, updates: Partial<Pick<Column, 'title' | 'color'>>) => void
  deleteColumn: (id: string) => void
  reorderColumns: (boardId: string, orderedIds: string[]) => void

  // Card CRUD
  createCard: (columnId: string, boardId: string, data: Partial<Card>) => string
  updateCard: (id: string, updates: Partial<Card>) => void
  deleteCard: (id: string) => void
  moveCard: (cardId: string, toColumnId: string, newOrder: number) => void

  // Activity
  addActivity: (boardId: string, entry: Omit<ActivityEntry, 'id' | 'boardId' | 'timestamp'>) => void
}
