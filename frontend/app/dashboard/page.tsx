"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AnalysisInput } from "@/components/dashboard/analysis-input"
import { ResultsArea } from "@/components/dashboard/results-area"
import { InsightRail, MobileInsightSummary } from "@/components/dashboard/insight-rail"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { ModelCooldown } from "@/components/dashboard/model-cooldown"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, Shield, Zap, Briefcase, HeartPulse, Scale, Loader2 } from "lucide-react"
import { analyzeText, AnalysisResult } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [content, setContent] = useState("")
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const { user, isLoggedIn, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/auth")
    }
  }, [authLoading, isLoggedIn, router])

  const handleAnalyze = async (input: string) => {
    if (!input.trim()) return
    setContent(input)
    setAnalyzing(true)
    setHasResults(false)
    setError(null)

    try {
      const result = await analyzeText(input)
      setAnalysisData(result)
      setHasResults(true)
      
      // Check if claims are uncertain (indicates rate limiting)
      const uncertainCount = result.claims?.filter((c: any) => c.status === "uncertain").length || 0
      const totalClaims = result.claims?.length || 0
      
      // Show cooldown if: 3+ uncertain claims OR more than 30% uncertain
      if (uncertainCount >= 3 || (totalClaims > 0 && uncertainCount / totalClaims >= 0.3)) {
        // Rate limit detected - showing cooldown UI
        setIsRateLimited(true)
      }
    } catch (err) {
      console.error("Analysis failed:", err)
      const errorMsg = err instanceof Error ? err.message : "Analysis failed. Please try again."
      setError(errorMsg)
      
      // Check for rate limit error
      if (errorMsg.toLowerCase().includes("rate") || errorMsg.includes("429")) {
        setIsRateLimited(true)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCooldownComplete = () => {
    // Keep the "ready" state visible for a few seconds before hiding
    setTimeout(() => {
      setIsRateLimited(false)
    }, 3000)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#020202] overflow-hidden selection:bg-primary/30 relative">
      {/* Background depth layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <MobileHeader />

      <div className="hidden lg:flex relative z-10">
        <Sidebar />
      </div>

      <main className="flex-1 flex overflow-hidden pt-16 lg:pt-0 relative z-10">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-8 space-y-6 md:space-y-8">
          <div className="max-w-5xl mx-auto w-full pt-2 sm:pt-4">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6"
            >
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/40">
                    Neural Engine Online
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter italic">
                  Verification <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-white/40 text-sm md:text-base font-light">
                  Standard Analysis Mode • <span className="text-primary font-bold">V4.2 SCRUTINY</span>
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#020202] bg-primary/20" />
                  ))}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-white/60 uppercase tracking-widest px-2">
                  Active Analysts
                </span>
              </div>
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 md:mb-8"
            >
              {[
                { icon: Shield, label: "Integrity Checks", value: "2,482", color: "text-primary" },
                { icon: Users, label: "Active Users", value: "1,240", color: "text-blue-400" },
                { icon: TrendingUp, label: "Accuracy Rate", value: "99.8%", color: "text-green-400" },
                { icon: Zap, label: "Avg Response", value: "38ms", color: "text-yellow-400" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-white/5 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                    <span className="text-lg sm:text-xl md:text-2xl font-black">{stat.value}</span>
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AnalysisInput onAnalyze={handleAnalyze} analyzing={analyzing} />
            </motion.div>

            {!analyzing && !hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-20 space-y-12"
              >
                <div className="text-center space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight italic text-white/90">
                    Real-World <span className="text-primary">Impact Hub</span>
                  </h2>
                  <p className="text-sm sm:text-base text-white/40 max-w-2xl mx-auto font-light px-2">
                    TrustLayer AI is engineered for mission-critical sectors where hallucination-free output is
                    non-negotiable.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    {
                      icon: Scale,
                      title: "Legal Research",
                      desc: "Verify case law citations and prevent 'hallucinated' legal precedents in filings.",
                      tag: "Compliance",
                    },
                    {
                      icon: HeartPulse,
                      title: "Medical Validation",
                      desc: "Cross-check diagnostic summaries against PubMed and clinical trial registries.",
                      tag: "Patient Safety",
                    },
                    {
                      icon: Briefcase,
                      title: "Enterprise IP",
                      desc: "Ensure internal documentation and external reports maintain factual parity with source code.",
                      tag: "Security",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="glass p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/5 group hover:border-primary/30 transition-all hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary tracking-widest uppercase py-1 px-2 sm:px-3 rounded-full bg-primary/10">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 glass rounded-2xl border-red-500/20 bg-red-500/5"
              >
                <p className="text-red-400 text-center">{error}</p>
              </motion.div>
            )}

            <AnimatePresence>
              {(analyzing || hasResults) && analysisData && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="mt-12 space-y-6"
                >
                  <ResultsArea analyzing={analyzing} data={analysisData} originalContent={content} />
                  
                  {/* Mobile Insight Summary - shows only on mobile/tablet */}
                  <MobileInsightSummary
                    visible={hasResults}
                    sources={analysisData?.sources || []}
                    score={analysisData?.score}
                    claims={analysisData?.claims}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <InsightRail 
          visible={hasResults} 
          sources={analysisData?.sources || []} 
          score={analysisData?.score}
          claims={analysisData?.claims}
        />
      </main>

      {/* Rate Limit Cooldown Modal */}
      <ModelCooldown 
        isRateLimited={isRateLimited} 
        cooldownSeconds={60}
        onCooldownComplete={handleCooldownComplete}
      />
    </div>
  )
}
