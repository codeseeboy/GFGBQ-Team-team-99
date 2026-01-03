"use client"

import { SiteHeader } from "@/components/site-header"
import { Shield, Search, AlertTriangle, Zap, Database, ArrowDown } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020202] text-foreground selection:bg-primary/30 relative">
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20 sm:space-y-32 md:space-y-40">
          {/* Hero Section with Scroll Fade */}
          <motion.section
            style={{ opacity, scale }}
            className="text-center space-y-8 sm:space-y-12 relative min-h-[60vh] sm:min-h-[70vh] flex flex-col justify-center items-center"
          >
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
              <div className="w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-primary/30 blur-[100px] sm:blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-ping" />
                The Verification Infrastructure
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-[10rem] font-black tracking-tighter leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 italic px-2">
                Trust is <br />
                <span className="font-serif font-light text-primary">Not a Placeholder.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/40 leading-relaxed max-w-4xl mx-auto font-light px-4 text-balance">
                TrustLayer AI is the world's first specialized integrity layer for generative models, bridging the gap
                between AI confidence and factual reality.
              </p>
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              className="absolute bottom-0 flex flex-col items-center gap-4"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Scroll to Explore</span>
              <ArrowDown className="w-5 h-5 text-primary/50" />
            </motion.div>
          </motion.section>

          {/* Logic Blocks with Scroll Reveal */}
          <section className="space-y-12 sm:space-y-16 md:space-y-24">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary">
                The Verification Core
              </h2>
              <div className="h-0.5 w-24 sm:w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <LogicBlock
                number="01"
                title="Claim Extraction"
                detail="Our NLP pipeline decomposes unstructured LLM output into atomic factual claims, identifying dates, names, and statistical assertions."
                delay={0}
              />
              <LogicBlock
                number="02"
                title="Citation Scrutiny"
                detail="Every URL and reference is crawled and verified for semantic relevance. We flag hallucinated domains and circular citations."
                delay={0.2}
              />
              <LogicBlock
                number="03"
                title="Parity Analysis"
                detail="Claims are cross-referenced with a multi-modal data silo including academic journals, news wires, and archival records."
                delay={0.4}
              />
            </div>
          </section>

          {/* Luxury Feature Section with 3D Depth */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-12">
            {[
              {
                icon: Shield,
                title: "Fact Verification",
                description:
                  "Cross-references AI outputs against real-world data sources, academic papers, and live news feeds.",
              },
              {
                icon: Search,
                title: "Citation Validation",
                description:
                  "Verifies the existence and legitimacy of references, detecting 'hallucinated' links instantly.",
              },
              {
                icon: AlertTriangle,
                title: "Hallucination Detection",
                description: "Uses secondary semantic analysis to identify high-confidence but low-accuracy patterns.",
              },
              {
                icon: Database,
                title: "Integrity Graph",
                description: "Visualizes the verification path, showing exactly where a claim was validated.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </section>

          {/* Engine Status Callout */}
          <motion.section
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="glass p-6 sm:p-10 md:p-16 lg:p-24 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] lg:rounded-[6rem] border-white/5 bg-gradient-to-br from-primary/20 via-transparent to-transparent overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/10 blur-[100px] -z-10" />

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-32 items-center">
              <div className="flex-1 space-y-8 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-center lg:text-left">
                  Engineered for <br />
                  <span className="text-primary italic">Professional Integrity.</span>
                </h2>
                <div className="space-y-6 sm:space-y-10">
                  <div className="flex gap-4 sm:gap-6 md:gap-8 items-start group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">Eliminate Hallucination Risk</h4>
                      <p className="text-sm sm:text-base text-white/40 leading-relaxed font-light">
                        LLMs are probabilistic, not factual. TrustLayer adds a deterministic validation layer to ensure
                        your reports are legally and ethically sound.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:gap-6 md:gap-8 items-start group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                      <Database className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">Universal Model Support</h4>
                      <p className="text-sm sm:text-base text-white/40 leading-relaxed font-light">
                        Whether you use OpenAI, Anthropic, or local Llama deployments, our API sits as a transparent
                        proxy, verifying every token.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full flex justify-center perspective-1000">
                <motion.div
                  whileHover={{ rotateY: -10, rotateX: 5 }}
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square glass rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] flex flex-col items-center justify-center border-white/10 relative overflow-hidden p-6 sm:p-8 md:p-12 text-center group preserve-3d"
                >
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10 space-y-8 flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-full flex items-center justify-center"
                    >
                      <div className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_-10px_rgba(var(--primary),0.6)]">
                        <Shield className="w-16 h-16 text-white" />
                      </div>
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black tracking-tight italic uppercase tracking-[0.2em]">
                        Core v4.2
                      </h3>
                      <div className="flex items-center gap-2 justify-center bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">
                          System Active
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-5 sm:p-6 md:p-8 lg:p-10 glass rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] space-y-4 sm:space-y-6 group hover:bg-white/5 transition-all duration-500 border-white/5 hover:border-primary/20">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/5 rounded-xl sm:rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:rotate-12 transition-all duration-500">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary group-hover:text-white transition-colors" />
      </div>
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight">{title}</h3>
        <p className="text-white/40 leading-relaxed text-sm sm:text-base font-light">{description}</p>
      </div>
    </div>
  )
}

function LogicBlock({
  number,
  title,
  detail,
  delay,
}: { number: string; title: string; detail: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="space-y-4 sm:space-y-6 p-5 sm:p-6 md:p-8 lg:p-10 glass rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 group"
    >
      <span className="text-3xl sm:text-4xl md:text-5xl font-black text-primary/10 font-serif italic tracking-tighter group-hover:text-primary/30 transition-colors">
        {number}
      </span>
      <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-white/40 leading-relaxed font-light">{detail}</p>
    </motion.div>
  )
}
