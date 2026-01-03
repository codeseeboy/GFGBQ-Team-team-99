"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Globe, Search, CheckCircle2, XCircle, AlertCircle, Sparkles, Database, Cpu } from "lucide-react"

interface LogEntry {
  type: string
  message: string
  timestamp: number
  status?: "success" | "pending" | "error"
}

interface VerificationLogProps {
  isActive: boolean
}

export function VerificationLog({ isActive }: VerificationLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (isActive && !eventSourceRef.current) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
      const eventSource = new EventSource(`${apiUrl}/logs/stream`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data) as LogEntry
          setLogs(prev => [...prev.slice(-50), entry]) // Keep last 50 logs
        } catch (e) {
          console.error("Failed to parse log:", e)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [isActive])

  // Clear logs when not active
  useEffect(() => {
    if (!isActive) {
      setLogs([])
    }
  }, [isActive])

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getIcon = (type: string, status?: string) => {
    if (status === "error") return <XCircle className="w-3 h-3 text-red-400" />
    
    switch (type) {
      case "extract":
        return <Sparkles className="w-3 h-3 text-purple-400" />
      case "entity":
        return <Cpu className="w-3 h-3 text-blue-400" />
      case "wikipedia":
        return <Globe className="w-3 h-3 text-blue-400" />
      case "search":
        return <Search className="w-3 h-3 text-yellow-400" />
      case "verdict":
        if (status === "success") {
          return <CheckCircle2 className="w-3 h-3 text-green-400" />
        }
        return <AlertCircle className="w-3 h-3 text-yellow-400" />
      case "score":
        return <Database className="w-3 h-3 text-primary" />
      default:
        return <Terminal className="w-3 h-3 text-white/50" />
    }
  }

  const getColor = (type: string, status?: string) => {
    if (status === "error") return "text-red-400"
    if (status === "pending") return "text-white/60"
    
    switch (type) {
      case "extract": return "text-purple-400"
      case "entity": return "text-blue-300"
      case "wikipedia": return "text-blue-400"
      case "search": return "text-yellow-400"
      case "verdict": return "text-green-400"
      case "score": return "text-primary"
      default: return "text-white/70"
    }
  }

  const getPrefix = (type: string) => {
    switch (type) {
      case "extract": return "[Extract]"
      case "entity": return "[Entity]"
      case "wikipedia": return "[Wikipedia]"
      case "search": return "[WebSearch]"
      case "verdict": return "[Verdict]"
      case "score": return "[Score]"
      default: return "[Info]"
    }
  }

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 glass rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            Verification Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] text-white/40 font-mono">
            {isConnected ? 'LIVE' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Log Container */}
      <div
        ref={logContainerRef}
        className="h-[200px] overflow-y-auto p-4 font-mono text-xs space-y-1 custom-scrollbar bg-black/60"
      >
        <AnimatePresence>
          {logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/30"
            >
              <Terminal className="w-3 h-3" />
              <span>Waiting for verification data...</span>
            </motion.div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2"
              >
                {getIcon(log.type, log.status)}
                <span className={`${getColor(log.type, log.status)} font-semibold`}>
                  {getPrefix(log.type)}
                </span>
                <span className="text-white/80 flex-1">{log.message}</span>
                {log.status === "pending" && (
                  <span className="text-white/30 animate-pulse">...</span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
