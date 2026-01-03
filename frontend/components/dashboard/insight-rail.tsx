import { ExternalLink, Database, AlertTriangle, Fingerprint, CheckCircle2, Info } from "lucide-react"

export function InsightRail({ visible, sources, score, claims }: { visible: boolean; sources: any[]; score?: number; claims?: any[] }) {
  // Calculate verification stats
  const verifiedCount = claims?.filter((c: any) => c.status === "verified").length || 0
  const uncertainCount = claims?.filter((c: any) => c.status === "uncertain").length || 0
  const hallucinatedCount = claims?.filter((c: any) => c.status === "hallucinated").length || 0
  const totalClaims = claims?.length || 0
  
  const hasHallucinations = hallucinatedCount > 0
  const isHighConfidence = (score || 0) >= 80
  
  return (
    <aside
      className={`fixed inset-y-0 right-0 w-80 glass border-l border-white/5 p-6 flex flex-col gap-8 transition-all duration-500 z-40 lg:relative lg:translate-x-0 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
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
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex flex-col">
        <span className="text-xs font-medium group-hover:text-primary transition-colors">{title}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          {url} <ExternalLink className="w-2 h-2" />
        </span>
      </div>
      {verified && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
      {suspicious && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
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
