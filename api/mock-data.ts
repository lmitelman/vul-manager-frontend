import { generateId } from "@/lib/utils"
import type { Vulnerability } from "@/types/kanban"

// Helper to create a date string (past or future)
const createDate = (daysFromNow: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString()
}

// Initial mock vulnerabilities data
const initialVulnerabilities: Vulnerability[] = [
  {
    id: `vuln-${generateId()}`,
    title: "SQL Injection in Login Form",
    description: "The login form is vulnerable to SQL injection attacks, allowing attackers to bypass authentication.",
    status: "Pending Fix",
    severity: "Critical",
    cweId: "89",
    suggestedFix: "Use parameterized queries or prepared statements instead of string concatenation.",
    reportedAt: createDate(-5),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Cross-Site Scripting (XSS) in Comment Section",
    description:
      "User input in the comment section is not properly sanitized, allowing attackers to inject malicious scripts.",
    status: "Pending Fix",
    severity: "High",
    cweId: "79",
    suggestedFix: "Implement proper input validation and output encoding.",
    reportedAt: createDate(-3),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Insecure Direct Object Reference in User Profile",
    description: "Users can access other users' profiles by manipulating the user ID parameter.",
    status: "Pending Fix",
    severity: "Medium",
    cweId: "639",
    suggestedFix: "Implement proper access controls and validate user permissions.",
    reportedAt: createDate(-2),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Broken Authentication in Password Reset",
    description:
      "The password reset functionality does not properly verify the user's identity before allowing a password change.",
    status: "In Progress",
    severity: "High",
    cweId: "287",
    suggestedFix: "Implement proper authentication checks and use secure tokens with expiration times.",
    reportedAt: createDate(-7),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Insecure Cryptographic Storage of Passwords",
    description:
      "User passwords are stored using MD5 hashing without salting, making them vulnerable to rainbow table attacks.",
    status: "In Progress",
    severity: "Critical",
    cweId: "327",
    suggestedFix: "Use a strong, adaptive hashing algorithm like bcrypt or Argon2 with proper salting.",
    reportedAt: createDate(-6),
  },
  {
    id: `vuln-${generateId()}`,
    title: "CSRF Vulnerability in Account Settings",
    description: "The account settings page is vulnerable to Cross-Site Request Forgery attacks.",
    status: "Solved",
    severity: "Medium",
    cweId: "352",
    suggestedFix: "Implement anti-CSRF tokens and validate them on the server side.",
    reportedAt: createDate(-15),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Server Misconfiguration Exposing .git Directory",
    description:
      "The .git directory is accessible from the web, potentially exposing source code and sensitive information.",
    status: "Solved",
    severity: "Medium",
    cweId: "552",
    suggestedFix: "Configure the web server to block access to .git and other sensitive directories.",
    reportedAt: createDate(-12),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Missing HTTP Security Headers",
    description:
      "The application is missing important security headers like Content-Security-Policy and X-XSS-Protection.",
    status: "Solved",
    severity: "Low",
    cweId: "693",
    suggestedFix: "Add appropriate security headers to all HTTP responses.",
    reportedAt: createDate(-10),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Potential Path Traversal in File Upload",
    description: "Scanner reported a potential path traversal vulnerability in the file upload functionality.",
    status: "False Positive",
    severity: "Low",
    cweId: "22",
    suggestedFix: "N/A - Verified that proper validation is in place.",
    reportedAt: createDate(-8),
  },
  {
    id: `vuln-${generateId()}`,
    title: "Reported DOM-based XSS in Search Function",
    description: "Automated scanner reported a potential DOM-based XSS vulnerability in the search function.",
    status: "False Positive",
    severity: "Medium",
    cweId: "79",
    suggestedFix: "N/A - Manual testing confirmed proper output encoding is implemented.",
    reportedAt: createDate(-9),
  },
]

// Create a class to manage mock data with persistence
class MockVulnerabilityService {
  private vulnerabilities: Vulnerability[]

  constructor() {
    // Try to load from localStorage first, or use initial data
    const storedData = localStorage.getItem("mockVulnerabilities")
    this.vulnerabilities = storedData ? JSON.parse(storedData) : [...initialVulnerabilities]
  }

  // Save current state to localStorage
  private saveToStorage() {
    localStorage.setItem("mockVulnerabilities", JSON.stringify(this.vulnerabilities))
  }

  // Get all vulnerabilities
  getAll(): Promise<Vulnerability[]> {
    return Promise.resolve([...this.vulnerabilities])
  }

  // Create a new vulnerability
  create(vulnerability: Omit<Vulnerability, "id">): Promise<Vulnerability> {
    const newVulnerability = {
      ...vulnerability,
      id: `vuln-${generateId()}`,
    } as Vulnerability

    this.vulnerabilities.push(newVulnerability)
    this.saveToStorage()

    return Promise.resolve({ ...newVulnerability })
  }

  // Update an existing vulnerability
  update(id: string, updates: Partial<Vulnerability>): Promise<Vulnerability> {
    const index = this.vulnerabilities.findIndex((v) => v.id === id)

    if (index === -1) {
      return Promise.reject(new Error(`Vulnerability with ID ${id} not found`))
    }

    const updatedVulnerability = {
      ...this.vulnerabilities[index],
      ...updates,
    }

    this.vulnerabilities[index] = updatedVulnerability
    this.saveToStorage()

    return Promise.resolve({ ...updatedVulnerability })
  }

  // Delete a vulnerability
  delete(id: string): Promise<void> {
    const index = this.vulnerabilities.findIndex((v) => v.id === id)

    if (index === -1) {
      return Promise.reject(new Error(`Vulnerability with ID ${id} not found`))
    }

    this.vulnerabilities.splice(index, 1)
    this.saveToStorage()

    return Promise.resolve()
  }

  // Reset to initial data (useful for testing)
  reset(): Promise<void> {
    this.vulnerabilities = [...initialVulnerabilities]
    this.saveToStorage()
    return Promise.resolve()
  }
}

// Export a singleton instance
export const mockVulnerabilityService = new MockVulnerabilityService()
