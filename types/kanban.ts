export interface Vulnerability {
  id: string
  title: string
  description?: string
  status: string
  severity: VulnSeverity
  cweId?: string
  suggestedFix?: string
  createdAt: string
  assignedTo?: string
}

export interface Column {
  id: string
  title: string
  vulnerabilities: Vulnerability[]
  color?: string
}

export enum VulnStatus {
  PENDING_FIX = "PENDING_FIX",
  IN_PROGRESS = "IN_PROGRESS",
  SOLVED = "SOLVED",
  FALSE_POSITIVE = "FALSE_POSITIVE",
}

export enum VulnSeverity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low"
}