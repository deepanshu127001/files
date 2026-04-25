import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/components/dashboard/Dashboard'
import BoardPage from '@/components/board/BoardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
