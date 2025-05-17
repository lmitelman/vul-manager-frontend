export interface Task {
  id: string
  title: string
  description?: string
  status: string
  dueDate: string | null
  subtasks: Subtask[]
  customFields: CustomField[]
  createdAt: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface CustomField {
  id: string
  name: string
  value: string
}

export interface Vulnerability {
  id: string
  title: string
  description?: string
  status: string
  severity: "Critical" | "High" | "Medium" | "Low"
  cweId?: string
  suggestedFix?: string
  reportedAt: string
  assignedTo?: string
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
  vulnerabilities: Vulnerability[]
  color?: string
}

export interface Rule {
  id: string
  name: string
  condition: Condition
  action: Action
  enabled: boolean
}

interface Condition {
  type: "due-date" | "subtasks-completed" | "custom-field"
  operator: "is-overdue" | "all-completed" | "equals" | "not-equals" | "contains"
  field?: string
  value?: string
}

interface Action {
  type: "move-to-column"
  targetColumnId: string
}
