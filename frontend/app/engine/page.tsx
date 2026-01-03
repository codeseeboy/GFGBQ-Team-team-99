"use client"

import { SiteHeader } from "@/components/site-header"
import { Shield, Zap, Search, Fingerprint, Activity, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Suspense } from "react"

function EngineLabContent() {
  return (
    <section className="pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-8 lg:space-y-12">
            <div className="space-y-4 sm:space-y-6">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] sm:text-xs font-bold text-red-500 tracking-widest uppercase">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" /> Real-time Lab
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
                The <span className="italic text-primary">Scrutiny</span> Engine.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/50 font-light leading-relaxed">
                Experience the raw integrity logic as it flags hallucinations and verifies citations in sub-40ms cycles.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { label: "Semantic Parity", val: "ACTIVE", icon: Fingerprint },
                { label: "Citation Scrutiny", val: "ENABLED", icon: Search },
                { label: "Hallucination Mask", val: "SYSTEM_OK", icon: Shield },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-6 glass rounded-xl sm:rounded-2xl border-white/5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-bold tracking-widest text-white/40 uppercase">{item.label}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-primary">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative glass rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border-white/10 p-4 sm:p-6 md:p-12 overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex flex-col">
              <div className="scanner-overlay" />

              <div className="flex items-center justify-between mb-12 relative z-10 px-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">
                    LIVE_ANALYSIS_STREAM
                  </div>
                  <div className="text-sm font-mono text-primary flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    SYSTEM_STATUS_NOMINAL
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-white/60">
                    ID: TRX_9482_ALPHA
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-12 relative z-10 custom-scrollbar overflow-y-auto px-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5 space-y-4 sm:space-y-6"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase">Input detected</span>
                  </div>
                  <p className="text-lg sm:text-2xl md:text-3xl font-light leading-relaxed text-white/90 italic">
                    "Recent findings suggest that{" "}
                    <span className="text-red-400 underline decoration-red-400/30">
                      the moon's core is made of liquid titanium
                    </span>{" "}
                    according to a 2024 Nature study..."
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-[1.5rem] md:rounded-[2rem] bg-red-500/5 border border-red-500/10 space-y-4 sm:space-y-6"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest text-red-500 uppercase">
                        Hallucination Alert
                      </span>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase">CONFIDENCE</div>
                      <div className="text-2xl sm:text-3xl font-black text-white">94.2%</div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                      Factual drift detected. Liquid titanium core hypothesis is not supported by current seismic data
                      or the cited Nature publication.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-[1.5rem] md:rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4 sm:space-y-6"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase">Citation Audit</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] sm:text-[10px] font-mono text-white/40">NATURE_VOL_42</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-red-500 tracking-widest font-bold uppercase">
                          NOT_FOUND
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] sm:text-[10px] font-mono text-white/40">DOI_10.1038_SCI</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-green-500 tracking-widest font-bold uppercase">
                          VALIDATED
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                      The AI fabricated a specific volume and page number that does not exist in the referenced journal
                      archives.
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="mt-auto pt-6 sm:pt-8 md:pt-12 border-t border-white/5 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12">
                  <div className="space-y-1">
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-widest">Trust Index</div>
                    <div className="text-xl sm:text-2xl font-black text-red-500">LOW (12/100)</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-widest">Mitigation</div>
                    <div className="text-xl sm:text-2xl font-black text-white">AUTORUN</div>
                  </div>
                </div>
                <button className="w-full md:w-auto px-6 sm:px-8 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all">
                  Generate Full Integrity Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function EngineLabPage() {
  return (
    <main className="relative min-h-screen">
      <SiteHeader />
      <Suspense fallback={null}>
        <EngineLabContent />
      </Suspense>
    </main>
  )
}
