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
  vulnerabilities: Vulnerability[]
  color?: string
}