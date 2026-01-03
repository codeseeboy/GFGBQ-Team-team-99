"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Battery, BatteryCharging, Sparkles, Zap } from "lucide-react"

interface ModelCooldownProps {
  isRateLimited: boolean
  cooldownSeconds?: number
  onCooldownComplete?: () => void
}

export function ModelCooldown({ 
  isRateLimited, 
  cooldownSeconds = 60, 
  onCooldownComplete 
}: ModelCooldownProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isRateLimited) {
      setSecondsLeft(cooldownSeconds)
      setIsReady(false)
      return
    }

    setSecondsLeft(cooldownSeconds)
    setIsReady(false)

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsReady(true)
          onCooldownComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRateLimited, cooldownSeconds, onCooldownComplete])

  if (!isRateLimited) return null

  const progress = ((cooldownSeconds - secondsLeft) / cooldownSeconds) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className={`glass p-6 rounded-3xl border ${isReady ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'} backdrop-blur-xl shadow-2xl min-w-[280px]`}>
          {!isReady ? (
            // Tired State
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  y: [0, -3, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="text-5xl mb-4"
              >
                😴
              </motion.div>
              
              <h3 className="text-lg font-bold text-yellow-400 mb-1 flex items-center justify-center gap-2">
                <Battery className="w-5 h-5" />
                Models Recharging
              </h3>
              
              <p className="text-xs text-muted-foreground mb-4">
                Our AI needs a quick power nap! ⚡
              </p>

              {/* Countdown Timer */}
              <div className="relative mb-4">
                <motion.div
                  className="text-4xl font-black font-mono text-yellow-400"
                  key={secondsLeft}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {secondsLeft}s
                </motion.div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  until fully charged
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-[10px] text-muted-foreground mt-3 italic">
                💤 Gemini & Groq are taking a breather...
              </p>
            </div>
          ) : (
            // Ready State
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="text-5xl mb-4"
              >
                ⚡
              </motion.div>
              
              <h3 className="text-lg font-bold text-green-400 mb-1 flex items-center justify-center gap-2">
                <BatteryCharging className="w-5 h-5" />
                Fully Charged!
              </h3>
              
              <p className="text-xs text-green-300/80 mb-3">
                Models are refreshed and ready! 🚀
              </p>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center justify-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold"
              >
                <Sparkles className="w-3 h-3" />
                Ready for verification
                <Sparkles className="w-3 h-3" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Mini version for inline use
export function ModelStatusBadge({ isRateLimited, secondsLeft }: { isRateLimited: boolean; secondsLeft?: number }) {
  if (!isRateLimited) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-green-400 uppercase tracking-widest font-bold">
        <Zap className="w-3 h-3" />
        Models Ready
      </div>
    )
  }

  return (
    <motion.div
      animate={{ opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="flex items-center gap-1.5 text-[10px] text-yellow-400 uppercase tracking-widest font-bold"
    >
      <Battery className="w-3 h-3" />
      Recharging {secondsLeft ? `(${secondsLeft}s)` : '...'}
    </motion.div>
  )
}
