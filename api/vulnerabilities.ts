import { API_BASE_URL, ENDPOINTS, getAuthHeader } from "./config"
import type { Vulnerability } from "@/types/kanban"

const handleApiError = (error: any) => {
  console.error("API Error:", error)

  if (error.response) {
    const message = error.response.data?.message || "An error occurred"
    throw new Error(message)
  } else if (error.request) {
    throw new Error("No response from server. Please check your connection.")
  } else {
    throw new Error(error.message || "An unexpected error occurred")
  }
}

export const fetchVulnerabilities = async (): Promise<Vulnerability[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.VULNERABILITIES}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader() as Record<string, string>,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
        throw new Error("Your session has expired. Please log in again.")
      }
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    return handleApiError(error)
  }
}

export const createVulnerability = async (vulnerability: Omit<Vulnerability, "id">): Promise<Vulnerability> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.VULNERABILITIES}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader() as Record<string, string>,
      },
      body: JSON.stringify(vulnerability),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken")
        throw new Error("Your session has expired. Please log in again.")
      }
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    return handleApiError(error)
  }
}

export const updateVulnerability = async (
  id: string,
  vulnerability: Partial<Vulnerability>,
): Promise<Vulnerability> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.VULNERABILITY(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader() as Record<string, string>,
    },
    body: JSON.stringify(vulnerability),
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("authToken")
      throw new Error("Your session has expired. Please log in again.")
    }
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export const deleteVulnerability = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.VULNERABILITY(id)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader() as Record<string, string>,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("authToken")
      throw new Error("Your session has expired. Please log in again.")
    }
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
  }
}
