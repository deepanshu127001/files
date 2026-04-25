# Kanban Board — Premium Dark UI

A real-time collaborative Kanban board built with React, Zustand, @dnd-kit, and Framer Motion. No backend required — uses localStorage for persistence and BroadcastChannel API for cross-tab sync.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | TailwindCSS 3 |
| State | Zustand + localStorage persist middleware |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Date utils | date-fns |
| Icons | Lucide React |
| IDs | nanoid |

## Features

- **Multiple boards** — create, rename, delete from dashboard
- **Custom columns** — add, rename, delete, color-coded
- **Drag and drop** — cards between columns with @dnd-kit
- **Card detail modal** — title, description, due date, priority, assignee
- **Optimistic UI** — instant updates, then persisted to localStorage
- **Activity log** — last 10 actions per board in a sidebar
- **Cross-tab sync** — BroadcastChannel API simulates real-time collaboration
- **Board sharing** — copy URL with board ID as query param
- **Dark theme** — Zinc/Slate palette, premium Notion/Linear aesthetic

## Setup

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── App.tsx                        # Router
├── main.tsx                       # Entry
├── index.css                      # Tailwind + global styles
├── types/
│   └── index.ts                   # All TypeScript types
├── store/
│   └── index.ts                   # Zustand store + BroadcastChannel
├── lib/
│   └── utils.ts                   # Helpers: cn, formatDate, priorityColor
└── components/
    ├── dashboard/
    │   └── Dashboard.tsx          # Board listing page
    ├── board/
    │   ├── BoardPage.tsx          # Main board view with DnD context
    │   └── ActivitySidebar.tsx    # Activity log sidebar
    ├── columns/
    │   └── KanbanColumn.tsx       # Column with droppable + cards
    ├── cards/
    │   ├── SortableCard.tsx       # @dnd-kit sortable wrapper
    │   └── CardItem.tsx           # Card visual component
    └── modals/
        ├── CardModal.tsx          # Card detail modal
        └── AddColumnModal.tsx     # New column modal
```

## Key Design Decisions

### State Management
Zustand with the `persist` middleware writes to localStorage on every action. BroadcastChannel listens for `state_updated` messages from other tabs and re-hydrates from localStorage, achieving cross-tab sync without a server.

### Drag and Drop
`@dnd-kit/core` provides the DnD context. `@dnd-kit/sortable` wraps each card for sortable behavior within a column. `useDroppable` on each column accepts cards dropped directly onto the column area (empty columns).

### Optimistic UI
All store mutations update React state synchronously first. The `persist` middleware then serializes to localStorage asynchronously. UI feels instant.

### Animations
- **Cards**: `layout` prop on Framer Motion for smooth reordering
- **Column mount**: `initial/animate` scale + opacity
- **Modal**: spring physics for open/close
- **Activity sidebar**: slides in from right with spring

## Extending

To add a backend:
1. Replace the `createJSONStorage(() => localStorage)` in the Zustand persist config with your API calls
2. Replace the BroadcastChannel with WebSocket events
3. Add optimistic rollback by saving the previous state before mutations
