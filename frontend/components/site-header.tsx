"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleVerifyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const token = localStorage.getItem("token")
    if (!token) {
      e.preventDefault()
      router.push("/auth")
    }
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-3 glass border-b" : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              TrustLayer <span className="text-primary italic">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
            {["Dashboard", "Reports", "Engine", "Integrations"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-white/50 hover:text-white transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 transition-all" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button className="glow-primary rounded-full px-8 h-11 font-bold" asChild>
              <Link href="/dashboard" onClick={handleVerifyClick}>Verify Now</Link>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-b border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {["Dashboard", "Reports", "Engine", "Integrations"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full glass py-6 text-lg font-bold bg-transparent" asChild>
                  <Link href="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-full glow-primary py-6 text-lg font-bold" asChild>
                  <Link href="/dashboard" onClick={(e) => {
                    setIsOpen(false)
                    handleVerifyClick(e)
                  }}>Verify Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
