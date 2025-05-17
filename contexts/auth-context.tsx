"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin, logout as apiLogout } from "@/api/auth"

type User = {
  id?: string
  username: string
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("authToken")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // First check for admin credentials - skip API call if matched
      if (username === "admin" && password === "admin") {
        const mockUser = { username: "admin" }
        const mockToken = "mock-jwt-token-for-development"

        setUser(mockUser)
        setToken(mockToken)

        localStorage.setItem("user", JSON.stringify(mockUser))
        localStorage.setItem("authToken", mockToken)

        setIsLoading(false)
        return { success: true }
      }

      // If not admin credentials, proceed with API login
      const response = await apiLogin({ username, password })
      const user = { id: response.user.id, username: response.user.username }

      setUser(user)
      setToken(response.token)

      localStorage.setItem("user", JSON.stringify(user))
      // Token is already stored in localStorage by the apiLogin function

      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Invalid credentials",
      }
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiLogout()
      setUser(null)
      setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Still remove user data even if API call fails
      setUser(null)
      setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading, token }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
