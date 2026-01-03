"use client"

import { Menu, X, Shield } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Verify" },
    { href: "/reports", label: "Reports" },
    { href: "/settings", label: "Settings" },
    { href: "/about", label: "About" },
  ]

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-white/10 z-50 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            TrustLayer <span className="text-primary">AI</span>
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="relative z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-xl z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <nav 
            className="lg:hidden fixed top-20 left-4 right-4 glass rounded-3xl border border-white/10 p-6 space-y-2 z-50 animate-slide-in-from-top"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-4 rounded-2xl font-semibold text-base transition-all ${
                  pathname === item.href
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
