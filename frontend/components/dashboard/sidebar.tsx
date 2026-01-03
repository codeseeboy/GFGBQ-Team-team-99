"use client"

import { Shield, LayoutDashboard, History, Info, Zap, Menu, X, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isLoggedIn } = useAuth()

  // <CHANGE> Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* <CHANGE> Mobile Header with Toggle */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass sticky top-0 z-30 w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-lg uppercase">TrustLayer</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-40"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* <CHANGE> Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* <CHANGE> Responsive Sidebar with fixed mobile position */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 md:w-20 lg:w-24 glass border-r border-white/10 flex flex-col items-center py-8 
        transition-transform duration-500 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Link href="/" className="mb-12 hidden md:block">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 group transition-all hover:rotate-12">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </Link>

        {/* <CHANGE> Mobile Logo in Sidebar */}
        <div className="md:hidden w-full px-8 mb-8">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-black tracking-tighter text-2xl uppercase">TrustLayer</span>
          </div>
          {isLoggedIn && user && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-6 md:gap-10 flex-1 w-full px-4 md:px-0">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Verify" active={pathname === "/dashboard"} />
          <NavItem href="/reports" icon={History} label="Reports" active={pathname === "/reports"} activeLabel />
          <NavItem href="/about" icon={Info} label="About" active={pathname === "/about"} activeLabel />
        </nav>

        <div className="flex flex-col gap-4 mt-auto px-4 md:px-0 w-full items-center">
          {/* User info for desktop */}
          {isLoggedIn && user && (
            <div className="hidden md:block group relative w-full md:w-auto">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto cursor-pointer">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 glass rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {user.name}
              </div>
            </div>
          )}
          
          {/* Logout button */}
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="group relative w-full md:w-auto flex justify-center items-center gap-3 px-4 py-3 md:p-3 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
              <span className="md:hidden text-sm font-bold text-muted-foreground group-hover:text-red-500">Logout</span>
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 glass rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden md:block pointer-events-none">
                Logout
              </div>
            </button>
          ) : (
            <Link
              href="/auth"
              className="group relative w-full md:w-auto flex justify-center items-center gap-3 px-4 py-3 md:p-3 rounded-xl hover:bg-primary/10 transition-colors"
            >
              <User className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              <span className="md:hidden text-sm font-bold text-muted-foreground group-hover:text-primary">Login</span>
            </Link>
          )}

          <div className="group relative w-full md:w-auto flex justify-center">
            <div className="w-full md:w-10 h-12 md:h-10 rounded-xl md:rounded-full border border-primary/20 flex items-center justify-center bg-primary/5 cursor-help gap-3 px-4 md:px-0">
              <Zap className="w-4 h-4 text-primary" />
              <span className="md:hidden text-xs font-bold text-primary uppercase tracking-widest">Premium Node</span>
            </div>
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 glass rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden md:block pointer-events-none">
              Premium Node Active
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
  activeLabel = false
}: { href: string; icon: any; label: string; active?: boolean; activeLabel?: boolean }) {
  return (
    <Link href={href} className="group relative flex items-center md:flex-col w-full md:w-auto px-4 md:px-0">
      <div
        className={`p-3 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center gap-4 md:block ${
          active ? "bg-primary/20 text-primary shadow-lg shadow-primary/10 border border-primary/20 w-full md:w-auto" : "text-muted-foreground hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="md:hidden font-bold tracking-tight text-sm">{label}</span>
      </div>
      <span
        className={`hidden md:block text-[10px] mt-2 font-bold uppercase tracking-tighter transition-colors ${active ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"}`}
      >
        {label}
      </span>
      {active && (
        <div className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-6 md:h-8 bg-primary rounded-r-full glow-primary hidden md:block" />
      )}
    </Link>
  )
}
