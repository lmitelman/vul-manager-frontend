"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin, logout as apiLogout } from "@/api/auth"

type User = {
  id: string
  username: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("accessToken")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await apiLogin({ email, password })
      const user = { id: response.user.id, username: response.user.username }

      setUser(user)
      setToken(response.accessToken)

      localStorage.setItem("user", JSON.stringify(user))
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
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      router.push("/login")
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
