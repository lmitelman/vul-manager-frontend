"use client"

import { useState, useEffect } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import Column from "./column"
import TaskDetailModal from "./task-detail-modal"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType } from "@/types/kanban"
import { generateId } from "@/lib/utils"
import Image from "next/image"

// Mock data for initial tasks
const generateMockTasks = (): { [key: string]: Task[] } => {
  // Helper to create a date string (past or future)
  const createDate = (daysFromNow: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString()
  }

  // To Do tasks
  const todoTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Research competitor products",
      description: "Analyze top 5 competitor products and create a comparison report",
      status: "To Do",
      dueDate: createDate(5),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Identify top competitors", completed: false },
        { id: `subtask-${generateId()}`, title: "Create comparison criteria", completed: false },
        { id: `subtask-${generateId()}`, title: "Gather product information", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Estimated Hours", value: "8" },
      ],
      createdAt: createDate(-2),
    },
    {
      id: `task-${generateId()}`,
      title: "Design new landing page",
      description: "Create wireframes and mockups for the new product landing page",
      status: "To Do",
      dueDate: createDate(7),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Research design trends", completed: false },
        { id: `subtask-${generateId()}`, title: "Create wireframes", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Assigned To", value: "Sarah" },
      ],
      createdAt: createDate(-1),
    },
    {
      id: `task-${generateId()}`,
      title: "Update documentation",
      description: "Update the user documentation with the latest features",
      status: "To Do",
      dueDate: createDate(3),
      subtasks: [],
      customFields: [{ id: `field-${generateId()}`, name: "Priority", value: "Low" }],
      createdAt: createDate(-3),
    },
  ]

  // In Progress tasks
  const inProgressTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Implement authentication flow",
      description: "Create login, registration, and password reset functionality",
      status: "In Progress",
      dueDate: createDate(2),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Design authentication screens", completed: true },
        { id: `subtask-${generateId()}`, title: "Implement login functionality", completed: true },
        { id: `subtask-${generateId()}`, title: "Implement registration", completed: false },
        { id: `subtask-${generateId()}`, title: "Implement password reset", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Assigned To", value: "Michael" },
        { id: `field-${generateId()}`, name: "Story Points", value: "8" },
      ],
      createdAt: createDate(-5),
    },
    {
      id: `task-${generateId()}`,
      title: "Optimize database queries",
      description: "Improve performance of slow database queries on the dashboard",
      status: "In Progress",
      dueDate: createDate(1),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Identify slow queries", completed: true },
        { id: `subtask-${generateId()}`, title: "Add indexes", completed: false },
        { id: `subtask-${generateId()}`, title: "Rewrite complex queries", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Estimated Hours", value: "6" },
      ],
      createdAt: createDate(-4),
    },
  ]

  // Blocked tasks
  const blockedTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Fix payment integration",
      description: "Resolve issues with the Stripe payment integration",
      status: "Blocked",
      dueDate: createDate(-1), // Overdue
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Investigate error logs", completed: true },
        { id: `subtask-${generateId()}`, title: "Contact Stripe support", completed: true },
        { id: `subtask-${generateId()}`, title: "Update API integration", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Critical" },
        { id: `field-${generateId()}`, name: "Blocker", value: "Waiting for API documentation" },
      ],
      createdAt: createDate(-7),
    },
    {
      id: `task-${generateId()}`,
      title: "Finalize third-party integrations",
      description: "Complete integration with analytics and marketing tools",
      status: "Blocked",
      dueDate: createDate(-2), // Overdue
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Set up Google Analytics", completed: true },
        { id: `subtask-${generateId()}`, title: "Integrate Mailchimp", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Blocker", value: "Waiting for API keys" },
      ],
      createdAt: createDate(-6),
    },
  ]

  // Completed tasks
  const completedTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Create project proposal",
      description: "Draft and finalize the project proposal document",
      status: "Completed",
      dueDate: createDate(-5),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Research market needs", completed: true },
        { id: `subtask-${generateId()}`, title: "Define project scope", completed: true },
        { id: `subtask-${generateId()}`, title: "Create budget estimate", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Completed On", value: createDate(-6).split("T")[0] },
      ],
      createdAt: createDate(-10),
    },
    {
      id: `task-${generateId()}`,
      title: "Set up development environment",
      description: "Configure development, staging, and production environments",
      status: "Completed",
      dueDate: createDate(-8),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Set up local environment", completed: true },
        { id: `subtask-${generateId()}`, title: "Configure staging server", completed: true },
        { id: `subtask-${generateId()}`, title: "Set up CI/CD pipeline", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Completed By", value: "David" },
      ],
      createdAt: createDate(-12),
    },
    {
      id: `task-${generateId()}`,
      title: "Initial user research",
      description: "Conduct interviews and surveys with potential users",
      status: "Completed",
      dueDate: createDate(-15),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Create research questions", completed: true },
        { id: `subtask-${generateId()}`, title: "Recruit participants", completed: true },
        { id: `subtask-${generateId()}`, title: "Analyze results", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Participants", value: "12" },
      ],
      createdAt: createDate(-20),
    },
  ]

  return {
    "To Do": todoTasks,
    "In Progress": inProgressTasks,
    Blocked: blockedTasks,
    Completed: completedTasks,
  }
}

export default function KanbanBoard() {
  const { toast } = useToast()
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null)

  // Initialize with default columns and mock data
  useEffect(() => {
    const mockTasks = generateMockTasks()

    const initialColumns: ColumnType[] = [
      {
        id: "column-1",
        title: "Pending Fix",
        tasks: mockTasks["To Do"],
        color: "bg-[#111D3B]",
      },
      {
        id: "column-2",
        title: "In Progress",
        tasks: mockTasks["In Progress"],
        color: "bg-[#152142]",
      },
      {
        id: "column-3",
        title: "Solved",
        tasks: mockTasks["Completed"],
        color: "bg-[#111D3B]",
      },
      {
        id: "column-4",
        title: "False Positive",
        tasks: mockTasks["Blocked"],
        color: "bg-[#152142]",
      },
    ]
    setColumns(initialColumns)
  }, [])

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If there's no destination or the item is dropped in the same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Create new arrays for the columns
    const newColumns = [...columns]
    const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId)
    const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId)

    // Find the task being moved
    const task = sourceColumn.tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Remove the task from the source column
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      tasks: sourceColumn.tasks.filter((t) => t.id !== draggableId),
    }

    // Add the task to the destination column with updated status
    const updatedTask = { ...task, status: destColumn.title }
    newColumns[destColIndex] = {
      ...destColumn,
      tasks: [
        ...destColumn.tasks.slice(0, destination.index),
        updatedTask,
        ...destColumn.tasks.slice(destination.index),
      ],
    }

    setColumns(newColumns)

    // Update selected task if it's the one being moved
    if (selectedTask && selectedTask.id === draggableId) {
      setSelectedTask({ ...updatedTask })
    }

    toast({
      title: "Task moved",
      description: `"${task.title}" moved to ${destColumn.title}`,
    })
  }

  const handleTaskClick = (task: Task) => {
    // Find the most current version of the task from columns
    const currentTask = columns.flatMap((col) => col.tasks).find((t) => t.id === task.id) || task
    setSelectedTask({ ...currentTask })
    setIsCreatingTask(false)
    setIsTaskModalOpen(true)
  }

  const handleCreateNewTask = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return

    // Create an empty task with default values
    const newTask: Task = {
      id: `task-${generateId()}`,
      title: "",
      description: "",
      status: column.title,
      dueDate: null,
      subtasks: [],
      customFields: [
        { id: `field-${generateId()}`, name: "Criticality", value: "Medium" },
        { id: `field-${generateId()}`, name: "CWE", value: "" },
        { id: `field-${generateId()}`, name: "Suggested Fix", value: "" },
      ],
      createdAt: new Date().toISOString(),
    }

    setSelectedTask(newTask)
    setIsCreatingTask(true)
    setNewTaskColumnId(columnId)
    setIsTaskModalOpen(true)
  }

  const addTask = (columnId: string, task: Task) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: [...column.tasks, task],
        }
      }
      return column
    })
    setColumns(newColumns)
    toast({
      title: "Task created",
      description: `"${task.title}" added to ${columns.find((col) => col.id === columnId)?.title}`,
    })
  }

  const updateTask = (updatedTask: Task) => {
    // Find which column currently contains the task
    let sourceColumnIndex = -1
    let taskIndex = -1

    // Find the task in the current columns
    columns.forEach((column, colIndex) => {
      const index = column.tasks.findIndex((task) => task.id === updatedTask.id)
      if (index !== -1) {
        sourceColumnIndex = colIndex
        taskIndex = index
      }
    })

    // If we're creating a new task, add it to the specified column
    if (isCreatingTask && newTaskColumnId) {
      addTask(newTaskColumnId, updatedTask)
      setIsCreatingTask(false)
      setNewTaskColumnId(null)
      return
    }

    if (sourceColumnIndex === -1) return // Task not found

    // Create a copy of the columns
    const newColumns = [...columns]
    const sourceColumn = newColumns[sourceColumnIndex]

    // If status hasn't changed, just update the task in place
    if (sourceColumn.title === updatedTask.status) {
      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      }
    } else {
      // Status has changed, need to move the task to a different column

      // Remove the task from the source column
      newColumns[sourceColumnIndex] = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.filter((task) => task.id !== updatedTask.id),
      }

      // Find the destination column
      const destColumnIndex = newColumns.findIndex((col) => col.title === updatedTask.status)

      if (destColumnIndex !== -1) {
        // Add the task to the destination column
        newColumns[destColumnIndex] = {
          ...newColumns[destColumnIndex],
          tasks: [...newColumns[destColumnIndex].tasks, updatedTask],
        }
      } else {
        // If destination column not found, add the task back to the source column
        newColumns[sourceColumnIndex].tasks.push(updatedTask)
      }
    }

    setColumns(newColumns)
    setSelectedTask(updatedTask)

    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated`,
    })
  }

  const deleteTask = (taskId: string) => {
    const newColumns = columns.map((column) => {
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }
    })
    setColumns(newColumns)
    setSelectedTask(null)
    toast({
      title: "Task deleted",
      description: "The task has been deleted",
    })
  }

  const duplicateTask = (task: Task, columnId?: string) => {
    // Create a deep copy of the task with a new ID
    const duplicatedTask: Task = {
      ...JSON.parse(JSON.stringify(task)),
      id: `task-${generateId()}`,
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
    }

    // If columnId is provided, add to that column, otherwise add to the same column as the original
    const targetColumnId = columnId || columns.find((col) => col.tasks.some((t) => t.id === task.id))?.id

    if (targetColumnId) {
      addTask(targetColumnId, duplicatedTask)
      toast({
        title: "Task duplicated",
        description: `"${duplicatedTask.title}" created`,
      })
    }
  }

  const updateColumn = (columnId: string, updates: Partial<ColumnType>) => {
    const newColumns = columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column))
    setColumns(newColumns)
  }

  const deleteColumn = (columnId: string) => {
    // Check if column has tasks
    const column = columns.find((col) => col.id === columnId)
    if (column && column.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "Please move or delete all tasks in this column first",
        variant: "destructive",
      })
      return
    }

    setColumns(columns.filter((col) => col.id !== columnId))
    toast({
      title: "Column deleted",
      description: `"${column?.title}" column has been deleted`,
    })
  }

  return (
    <div className="flex flex-col h-screen strike-gradient-bg">
      <header className="bg-[#0A1128] border-b border-[#4F6DF5]/20 p-4 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Image src="/images/strike-logo.svg" alt="Strike Logo" width={120} height={40} className="mr-6" />
            <h1 className="text-2xl font-bold text-white">Vulnerability Management</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full max-w-7xl mx-auto">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={addTask}
                onTaskClick={handleTaskClick}
                onDeleteColumn={() => deleteColumn(column.id)}
                onUpdateColumn={updateColumn}
                onDuplicateTask={duplicateTask}
                onCreateNewTask={handleCreateNewTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <TaskDetailModal
        task={selectedTask}
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onDuplicate={duplicateTask}
        columns={columns}
        isCreating={isCreatingTask}
      />
    </div>
  )
}
