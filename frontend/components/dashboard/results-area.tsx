"use client"

import { ShieldCheck, AlertCircle, CheckCircle2, Search, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Badge, Button } from "@/components/ui"

export function ResultsArea({
  analyzing,
  data,
  originalContent,
}: {
  analyzing: boolean
  data: any
  originalContent: string
}) {
  // Calculate claim stats
  const verifiedCount = data?.claims?.filter((c: any) => c.status === "verified").length || 0
  const uncertainCount = data?.claims?.filter((c: any) => c.status === "uncertain").length || 0
  const hallucinatedCount = data?.claims?.filter((c: any) => c.status === "hallucinated").length || 0
  const totalClaims = data?.claims?.length || 0

  // Determine confidence display based on score and hallucination count
  const getConfidenceInfo = (score: number) => {
    const hasHallucinations = hallucinatedCount > 0
    const hasUncertain = uncertainCount > 0
    
    if (hasHallucinations) {
      return { label: "Review Required", icon: AlertCircle, color: "text-red-500", message: `${hallucinatedCount} claim(s) contradicted by sources. Manual review recommended.` }
    }
    if (score >= 70) {
      const uncertainMsg = hasUncertain ? ` ${uncertainCount} claim(s) marked uncertain due to conservative thresholds.` : ""
      return { label: "High Confidence", icon: CheckCircle2, color: "text-green-500", message: `No hallucinations detected.${uncertainMsg}` }
    }
    if (score >= 50) {
      return { label: "Moderate Confidence", icon: AlertCircle, color: "text-yellow-500", message: "Most claims verified. Some claims marked uncertain due to limited direct evidence." }
    }
    return { label: "Review Recommended", icon: AlertCircle, color: "text-orange-500", message: "Many claims could not be directly verified. Consider manual fact-checking." }
  }

  const confidenceInfo = data ? getConfidenceInfo(data.score) : getConfidenceInfo(0)
  const ConfidenceIcon = confidenceInfo.icon

  if (analyzing) {
    return (
      <div className="space-y-6 pt-6">
        <div className="h-48 glass rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-4">
            <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-lg font-bold">Scanning for Citations</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Cross-referencing 14,000+ indexed sources for factual parity...
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-32 glass rounded-3xl animate-pulse bg-white/5" />
          <div className="h-32 glass rounded-3xl animate-pulse bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-24 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Trust Score Card */}
        <div className="md:col-span-1 glass p-8 rounded-[2.5rem] border-primary/20 flex flex-col items-center justify-center text-center bg-gradient-to-b from-primary/5 to-transparent">
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="74"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/5"
              />
              <circle
                cx="80"
                cy="80"
                r="74"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="465"
                strokeDashoffset={465 - (465 * data.score) / 100}
                className={hallucinatedCount === 0 ? "text-green-500" : hallucinatedCount <= 2 ? "text-yellow-500" : "text-red-500"}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{data.score}</span>
              <span className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                Trust Score
              </span>
            </div>
          </div>
          <h3 className={`font-black mb-2 flex items-center gap-2 text-lg uppercase tracking-tight ${confidenceInfo.color}`}>
            {confidenceInfo.label} <ConfidenceIcon className="w-5 h-5" />
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed px-4">
            {confidenceInfo.message}
          </p>
        </div>

        {/* Claim Analysis Summary */}
        <div className="md:col-span-2 glass p-8 rounded-[2.5rem]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center justify-between">
            Segmented Claims
            <Badge variant="secondary" className="bg-white/5 font-mono">
              {data.claims.length} DETECTED
            </Badge>
          </h3>

          <div className="space-y-4">
            {data.claims.map((item: any, i: number) => (
              <ClaimCard key={i} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Verified Output */}
      <div className={`glass p-10 rounded-[3rem] relative overflow-hidden group ${hallucinatedCount === 0 ? "border-green-500/30" : "border-red-500/30"}`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className={`w-32 h-32 ${hallucinatedCount === 0 ? "text-green-500" : "text-red-500"}`} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hallucinatedCount === 0 ? "bg-green-500" : "bg-red-500"}`}>
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {hallucinatedCount === 0 ? "Verification Complete" : "Issues Detected"}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="glass rounded-full border-primary/20 text-primary font-bold bg-transparent"
            >
              DOWNLOAD PDF REPORT
            </Button>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-xl font-medium leading-relaxed text-white/90 italic">"{originalContent}"</p>
            <div className="h-px bg-white/10 my-8" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              {hallucinatedCount === 0 ? (
                <>
                  All {totalClaims} claims were evaluated against trusted sources. <span className="text-green-500 font-bold">No hallucinations detected.</span>
                  {uncertainCount > 0 && (
                    <> {uncertainCount} claim{uncertainCount !== 1 ? 's are' : ' is'} marked as uncertain due to conservative verification thresholds.</>
                  )}
                </>
              ) : (
                <>
                  {hallucinatedCount} claim{hallucinatedCount !== 1 ? 's were' : ' was'} found to <span className="text-red-500 font-bold">contradict verified sources</span>. 
                  Manual review recommended before publishing.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ClaimCard({
  status,
  confidence,
  claim,
  explanation,
}: { status: "verified" | "uncertain" | "hallucinated"; confidence: number; claim: string; explanation: string }) {
  const styles = {
    verified: { border: "border-l-green-500", icon: CheckCircle2, text: "text-green-500", bg: "bg-green-500/5" },
    uncertain: { border: "border-l-yellow-500", icon: AlertCircle, text: "text-yellow-500", bg: "bg-yellow-500/5" },
    hallucinated: { border: "border-l-red-500", icon: AlertCircle, text: "text-red-500", bg: "bg-red-500/5" },
  }[status]

  const Icon = styles.icon

  return (
    <div
      className={`p-4 glass rounded-xl border-l-4 ${styles.border} ${styles.bg} transition-all hover:scale-[1.01] cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${styles.text}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>{status}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground opacity-60">{confidence}% Confidence</span>
      </div>
      <p className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">{claim}</p>
      <p className="text-xs text-muted-foreground italic leading-relaxed">{explanation}</p>
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-white transition-colors">
          Inspect Evidence <Search className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
