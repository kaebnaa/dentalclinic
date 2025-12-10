"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "./api"

export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  dateOfBirth?: string
  address?: string
  specialization?: string
  licenseNumber?: string
  branchId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  dateOfBirth: string
  address: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "patient@demo.com",
    name: "John Patient",
    role: "patient",
    phone: "+1234567890",
    dateOfBirth: "1990-01-01",
    address: "123 Main St, City, State",
  },
  {
    id: "2",
    email: "doctor@demo.com",
    name: "Dr. Sarah Smith",
    role: "doctor",
    phone: "+1234567891",
    specialization: "General Dentistry",
    licenseNumber: "DDS-12345",
    branchId: "branch-1",
  },
  {
    id: "3",
    email: "admin@demo.com",
    name: "Admin User",
    role: "admin",
    phone: "+1234567892",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use sessionStorage instead of localStorage for better security
    // sessionStorage is cleared when tab closes, reducing XSS attack window
    const storedUser = sessionStorage.getItem("dental_clinic_user")
    const storedToken = sessionStorage.getItem("token")
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        // Clear invalid data
        sessionStorage.removeItem("dental_clinic_user")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("refresh_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      
      if (response.token && response.user) {
        // Use sessionStorage instead of localStorage for better security
        // sessionStorage is cleared when tab closes, reducing XSS attack window
        sessionStorage.setItem("token", response.token)
        if (response.refresh_token) {
          sessionStorage.setItem("refresh_token", response.refresh_token)
        }
        
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          phone: response.user.phone,
        }
        
        setUser(userData)
        sessionStorage.setItem("dental_clinic_user", JSON.stringify(userData))
        
        return { success: true }
      }
      
      return { success: false, error: response.message || "Login failed" }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      }
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("dental_clinic_user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("refresh_token")
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role || 'patient',
      })
      
      if (response.token && response.user) {
        // Use sessionStorage instead of localStorage for better security
        sessionStorage.setItem("token", response.token)
        if (response.refresh_token) {
          sessionStorage.setItem("refresh_token", response.refresh_token)
        }
        
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          phone: response.user.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
        }
        
        setUser(userData)
        sessionStorage.setItem("dental_clinic_user", JSON.stringify(userData))
        
        return { success: true }
      }
      
      return { success: false, error: response.message || "Registration failed" }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      }
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
