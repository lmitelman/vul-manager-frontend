import { API_BASE_URL } from "./config"

// Types
interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    username: string
    // Add other user properties as needed
  }
  token: string
}

/**
 * Login user
 * @param credentials User credentials
 * @returns Promise with login response
 *
 * NOTE: This function should only be called for non-admin credentials.
 * Admin credentials (username: "admin", password: "admin") should be
 * handled directly in the auth context to skip the API call.
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Double-check to ensure we're not calling the API with admin credentials
  if (credentials.username === "admin" && credentials.password === "admin") {
    console.warn("API login called with admin credentials. This should be handled in the auth context.")
    return {
      user: { id: "admin-id", username: "admin" },
      token: "mock-jwt-token-for-development",
    }
  }

  try {
    // REPLACE THIS URL with your actual login endpoint
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      // Try to parse error message from response
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Store the token for future requests
    localStorage.setItem("authToken", data.token)

    // IMPORTANT: In a real implementation, you might want to:
    // 1. Check token expiration
    // 2. Set up token refresh mechanisms
    // 3. Use secure HTTP-only cookies instead of localStorage for better security

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

/**
 * Logout user
 */
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
    localStorage.removeItem("authToken")
  } catch (error) {
    console.error("Logout error:", error)
    // Still remove the token even if the API call fails
    localStorage.removeItem("authToken")
    throw error
  }
}

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken")
}
