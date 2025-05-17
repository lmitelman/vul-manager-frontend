import ProtectedRoute from "@/components/protected-route"
import KanbanBoard from "@/components/kanban-board"

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">
        <KanbanBoard />
      </main>
    </ProtectedRoute>
  )
}
