"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Shield, Database, Globe, Brain, CheckCircle2 } from "lucide-react"

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1])

  return (
    <section ref={containerRef} className="relative py-20 sm:py-32 md:py-40 px-4 sm:px-6">
      <motion.div style={{ opacity, scale }} className="container mx-auto">
        <div className="text-center mb-16 sm:mb-24 md:mb-32">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-4 sm:mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            The Integrity <span className="text-primary italic">Pipeline</span>
          </h2>
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-white/50 font-light px-2">
            How we solve the AI hallucination crisis through multi-layered verification nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              title: "Claim Extraction",
              icon: Brain,
              desc: "Parsing raw LLM output into verifiable atomic facts.",
              step: "01",
            },
            {
              title: "Source Indexing",
              icon: Database,
              desc: "Connecting to 500M+ real-time academic and web sources.",
              step: "02",
            },
            {
              title: "Cross-Validation",
              icon: Globe,
              desc: "Comparing claims against multiple independent databases.",
              step: "03",
            },
            {
              title: "Certified Output",
              icon: CheckCircle2,
              desc: "Delivering trust-stamped content with real citations.",
              step: "04",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/5 relative group overflow-hidden"
            >
              <div className="absolute top-3 sm:top-4 right-4 sm:right-6 text-4xl sm:text-5xl md:text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                {item.step}
              </div>
              <item.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">{item.title}</h3>
              <p className="text-sm sm:text-base text-white/50 leading-relaxed font-light">{item.desc}</p>
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export function ImpactSection() {
  return (
    <section className="py-20 sm:py-32 md:py-40 bg-black/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          <div className="flex-1 space-y-8 sm:space-y-12">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <span className="text-primary font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-xs sm:text-sm">Scalable Impact</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
                Designed for the <br className="hidden sm:block" /> <span className="italic text-primary">Enterprise Scale.</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Whether you're a legal firm verifying research or a medical institute validating diagnostic reports,
                TrustLayer scales to your integrity needs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:gap-12">
              {[
                { label: "Requests/sec", val: "12,000+" },
                { label: "Accuracy Rate", val: "99.99%" },
                { label: "Trust Nodes", val: "850+" },
                { label: "Latency", val: "<40ms" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1 sm:space-y-2 text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{stat.val}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/30 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square max-w-md lg:max-w-lg">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] sm:blur-[100px] animate-pulse rounded-full" />
            <div className="relative h-full w-full glass rounded-[2rem] sm:rounded-[3rem] border-white/10 p-6 sm:p-8 md:p-12 overflow-hidden preserve-3d">
              <div className="scanner-overlay" />
              <div className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 sm:pb-4">
                  <div className="text-[10px] sm:text-xs font-mono text-white/40">NODE_VERIFICATION_STATUS</div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-green-500">SECURE</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 flex gap-3 sm:gap-4 items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="h-2 w-16 sm:w-24 bg-white/10 rounded" />
                        <div className="h-1.5 w-12 sm:w-16 bg-white/5 rounded" />
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-primary shrink-0">VERIFIED</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  <div className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                    Live Integrity Feed
                  </div>
                  <div className="h-24 sm:h-32 rounded-lg sm:rounded-xl bg-black/40 border border-white/5 p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] text-primary/60 overflow-hidden leading-relaxed">
                    [SYSTEM] Claim_ID_482 verified via Academic_Mesh_v2 <br />
                    [SYSTEM] Cross-check parity confirmed (Score: 0.98) <br />
                    [SYSTEM] Hallucination drift detected in segment 4 <br />
                    [SYSTEM] Mitigating response... DONE <br />
                    [SYSTEM] Awaiting next integrity cycle...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
