"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, getMe, login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const { user } = await getMe()
          setUser(user)
        } catch (err) {
          // Token invalid, clear it
          apiLogout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    setUser(response.user)
    router.push("/dashboard")
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRegister(name, email, password)
    setUser(response.user)
    router.push("/dashboard")
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    router.push("/auth")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
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

// HOC for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isLoggedIn, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !isLoggedIn) {
        router.push("/auth")
      }
    }, [loading, isLoggedIn, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )
    }

    if (!isLoggedIn) {
      return null
    }

    return <Component {...props} />
  }
}
