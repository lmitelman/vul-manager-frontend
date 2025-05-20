"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { login, user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        router.push("/")
      } else {
        setError(result.message || "Login failed")
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center strike-gradient-bg">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col strike-gradient-bg">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Image src="/images/strike-logo.svg" alt="Strike Logo" width={160} height={53} className="mb-4" />
          </div>

          <div className="bg-[#0A1128] border border-[#4F6DF5]/20 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-white mb-8 text-center">Log In</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700/30 text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-white block">
                  Email
                </label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john.doe@strike.sh"
                  className="border-[#4F6DF5]/30 text-white bg-[#111D3B] placeholder:text-gray-500 focus:border-[#4F6DF5] focus:ring-1 focus:ring-[#4F6DF5]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white block">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="border-[#4F6DF5]/30 text-white bg-[#111D3B] placeholder:text-gray-500 focus:border-[#4F6DF5] focus:ring-1 focus:ring-[#4F6DF5]"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#4F6DF5] hover:bg-[#4F6DF5]/90 text-white py-2 px-4 rounded-md transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center text-[#A0AEC0] text-sm">
            © {new Date().getFullYear()} Strike Security. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
