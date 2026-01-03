"use client"

import { ExternalLink, Database, AlertTriangle, Fingerprint, CheckCircle2, Info, ChevronDown } from "lucide-react"
import { useState } from "react"

// Mobile-friendly inline summary that appears on smaller screens
export function MobileInsightSummary({ visible, sources, score, claims }: { visible: boolean; sources: any[]; score?: number; claims?: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const verifiedCount = claims?.filter((c: any) => c.status === "verified").length || 0
  const uncertainCount = claims?.filter((c: any) => c.status === "uncertain").length || 0
  const hallucinatedCount = claims?.filter((c: any) => c.status === "hallucinated").length || 0
  const totalClaims = claims?.length || 0
  
  const hasHallucinations = hallucinatedCount > 0
  const isHighConfidence = (score || 0) >= 80
  
  if (!visible) return null
  
  return (
    <div className="xl:hidden glass rounded-2xl border-white/10 overflow-hidden">
      {/* Collapsed Summary Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            hasHallucinations ? "bg-red-500/20" : isHighConfidence ? "bg-green-500/20" : "bg-yellow-500/20"
          }`}>
            {hasHallucinations ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : isHighConfidence ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Info className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">
              {hasHallucinations ? "Issues Detected" : isHighConfidence ? "Verification Success" : "Review Recommended"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {verifiedCount}/{totalClaims} verified • {sources.length} sources
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <p className="text-lg font-bold">{score || 0}%</p>
              <p className="text-[9px] text-muted-foreground uppercase">Score</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <p className="text-lg font-bold text-green-500">{verifiedCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Verified</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-500/10">
              <p className="text-lg font-bold text-yellow-500">{uncertainCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Uncertain</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-500/10">
              <p className="text-lg font-bold text-red-500">{hallucinatedCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Halluc.</p>
            </div>
          </div>
          
          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                <Database className="w-3 h-3" /> Sources ({sources.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sources.slice(0, 5).map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function InsightRail({ visible, sources, score, claims }: { visible: boolean; sources: any[]; score?: number; claims?: any[] }) {
  // Calculate verification stats
  const verifiedCount = claims?.filter((c: any) => c.status === "verified").length || 0
  const uncertainCount = claims?.filter((c: any) => c.status === "uncertain").length || 0
  const hallucinatedCount = claims?.filter((c: any) => c.status === "hallucinated").length || 0
  const totalClaims = claims?.length || 0
  
  const hasHallucinations = hallucinatedCount > 0
  const isHighConfidence = (score || 0) >= 80
  
  // Hide completely when not visible
  if (!visible) {
    return null
  }
  
  return (
    <aside
      className="hidden xl:flex w-80 glass border-l border-white/5 p-6 flex-col gap-8 transition-all duration-500 z-40 overflow-y-auto max-h-screen custom-scrollbar shrink-0"
    >
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Database className="w-3 h-3" /> Evidence Sources
        </h3>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <SourceItem
              key={index}
              title={source.title}
              url={source.url}
              verified={source.verified}
              suspicious={source.suspicious}
            />
          ))}
        </div>
      </section>

      {isHighConfidence && hallucinatedCount === 0 ? (
        <section className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" /> Verification Success
          </h3>
          <p className="text-xs leading-relaxed text-green-100/80">
            No hallucinations detected. 
            {uncertainCount > 0 
              ? ` ${uncertainCount} claim${uncertainCount !== 1 ? 's' : ''} marked uncertain due to conservative verification thresholds.`
              : ` All ${verifiedCount} claims verified against trusted sources.`
            }
          </p>
        </section>
      ) : hasHallucinations ? (
        <section className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> Hallucination Detected
          </h3>
          <p className="text-xs leading-relaxed text-red-100/80">
            {hallucinatedCount} claim{hallucinatedCount !== 1 ? 's' : ''} found to contradict verified sources. 
            Manual review recommended before publishing.
          </p>
        </section>
      ) : uncertainCount > 0 ? (
        <section className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-3 flex items-center gap-2">
            <Info className="w-3 h-3" /> Partial Verification
          </h3>
          <p className="text-xs leading-relaxed text-yellow-100/80">
            {uncertainCount} claim{uncertainCount !== 1 ? 's' : ''} could not be fully verified. 
            These may be too specific or recent for available databases.
          </p>
        </section>
      ) : null}

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Fingerprint className="w-3 h-3" /> Verification Summary
        </h3>
        <div className="space-y-4">
          <MetaItem label="Verified Claims" value={`${verifiedCount}/${totalClaims}`} highlight={verifiedCount === totalClaims} />
          <MetaItem label="Uncertain" value={String(uncertainCount)} />
          <MetaItem label="Hallucinated" value={String(hallucinatedCount)} warning={hallucinatedCount > 0} />
          <MetaItem label="Trust Score" value={`${score || 0}%`} highlight={isHighConfidence} />
        </div>
      </section>

      <div className="mt-auto p-4 glass rounded-xl border-primary/20">
        <p className="text-[10px] text-muted-foreground mb-2">Verification Hash</p>
        <code className="text-[9px] font-mono break-all opacity-50">
          {`0x${Date.now().toString(16)}_verify_${(score || 0).toString(16)}`}
        </code>
      </div>
    </aside>
  )
}

function SourceItem({
  title,
  url,
  verified = false,
  suspicious = false,
}: { title: string; url: string; verified?: boolean; suspicious?: boolean }) {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div 
      className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
      onClick={handleClick}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs font-medium group-hover:text-primary transition-colors">{title}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
          {url?.replace(/^https?:\/\//, '').slice(0, 40)}... <ExternalLink className="w-2 h-2 shrink-0" />
        </span>
      </div>
      {verified && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0 ml-2" />}
      {suspicious && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0 ml-2" />}
    </div>
  )
}

function MetaItem({ label, value, highlight = false, warning = false }: { label: string; value: string; highlight?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono font-bold ${warning ? "text-red-500" : highlight ? "text-green-500" : "text-white/90"}`}>
        {value}
      </span>
    </div>
  )
}
