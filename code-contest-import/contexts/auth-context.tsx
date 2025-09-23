"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  _id: string
  username: string
  email: string
  fullName: string
  role: "student" | "teacher" | "admin"
  avatar?: string
  statistics?: any
}

interface AuthContextType {
  user: User | null
  login: (login: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    fullName: string
    role: "student" | "teacher"
  }) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Check for existing session (only on client side)
    const token = localStorage.getItem("auth_token")
    if (token) {
      // Verify token and get user profile
      apiClient.setToken(token)
      apiClient.getProfile()
        .then((response) => {
          if (response.success && response.data?.user) {
            setUser(response.data.user)
          } else {
            // Invalid token, clear it
            localStorage.removeItem("auth_token")
            apiClient.setToken(null)
          }
        })
        .catch((error) => {
          console.error('Error verifying token:', error)
          localStorage.removeItem("auth_token")
          apiClient.setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (login: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(login, password) as any
      
      // Debug: log the actual response structure
      console.log('Login response:', response)
      
      if (response.success) {
        // Handle different possible response structures
        const userData = response.data?.user || response.user
        const token = response.data?.token || response.token
        
        if (userData && token) {
          setUser(userData)
          localStorage.setItem("auth_token", token)
          apiClient.setToken(token)
        } else {
          console.error('Missing user or token in response:', response)
          throw new Error('Invalid response structure from server')
        }
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    fullName: string
    role: "student" | "teacher"
  }) => {
    setIsLoading(true)
    try {
      const response = await apiClient.register(userData) as any
      
      console.log('Register response:', response)
      
      if (response.success) {
        // Handle different possible response structures
        const userData = response.data?.user || response.user
        const token = response.data?.token || response.token
        
        if (userData && token) {
          setUser(userData)
          localStorage.setItem("auth_token", token)
          apiClient.setToken(token)
        } else {
          console.error('Missing user or token in response:', response)
          throw new Error('Invalid response structure from server')
        }
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem("auth_token")
      apiClient.setToken(null)
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user

  // Don't render children until mounted to avoid hydration mismatches
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        isLoading, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}