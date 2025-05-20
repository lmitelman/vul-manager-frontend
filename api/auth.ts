import { API_BASE_URL } from "./config"

// Types
interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    username: string
  }
  accessToken: string
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    localStorage.setItem("accessToken", data.accessToken)

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = async (): Promise<void> => {
  try {
    // You might want to call a logout endpoint here
    // const response = await fetch(`${API_BASE_URL}/api/logout`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     ...getAuthHeader(),
    //   },
    // });

    // Clear the token regardless of the response
    localStorage.removeItem("accessToken")
  } catch (error) {
    console.error("Logout error:", error)
    localStorage.removeItem("accessToken")
    throw error
  }
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("accessToken")
}
