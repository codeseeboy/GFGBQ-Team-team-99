"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-primary/20 blur-[100px] sm:blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-blue-500/10 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-xs font-bold text-primary mb-6 sm:mb-8 tracking-widest uppercase">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-primary" /> Integrity Standard 2.0
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black tracking-tight mb-6 sm:mb-8 text-balance bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-[0.9]">
              Trust AI. <br />
              <span className="italic font-serif text-primary font-light">Verify First.</span>
            </h1>
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl lg:text-2xl text-white/50 mb-8 sm:mb-12 leading-relaxed font-light px-2 lg:px-0">
              Detect hallucinations, validate citations, and measure trust in AI-generated responses—in real time. The
              global standard for LLM integrity.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold glow-primary rounded-xl sm:rounded-2xl group transition-all hover:scale-105 w-full sm:w-auto"
                asChild
              >
                <Link href="/dashboard">
                  Start Verification{" "}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold glass bg-transparent rounded-xl sm:rounded-2xl border-white/10 hover:bg-white/5 w-full sm:w-auto"
                asChild
              >
                <Link href="/engine">Technical Engine</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full lg:w-auto perspective-1000"
          >
            <div className="glass rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/10 to-transparent">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/40" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/40" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/40" />
                </div>
                <div className="text-[8px] sm:text-[10px] font-mono text-white/30 tracking-widest uppercase">
                  Analysis Engine v4.2
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase">Scrutiny Active</span>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-white/90">
                    "The{" "}
                    <span className="text-red-400 font-medium underline decoration-red-400/30">first satellite</span>{" "}
                    was launched by the{" "}
                    <span className="text-yellow-400 font-medium underline decoration-yellow-400/30">UK in 1957</span>
                    ..."
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[
                    { label: "Trust Score", value: "42%", color: "text-red-500" },
                    { label: "Ground Truth", value: "Low", color: "text-yellow-500" },
                    { label: "Status", value: "Critical", color: "text-red-500" },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col text-center sm:text-left">
                      <span className="text-[8px] sm:text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5 sm:mb-1">
                        {stat.label}
                      </span>
                      <span className={`text-lg sm:text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Features() {
  const features = [
    {
      title: "Claim-Level Verification",
      description:
        "Every sentence is decomposed into atomic claims and cross-referenced with multiple ground-truth sources.",
      icon: Search,
    },
    {
      title: "Hallucination Detection",
      description:
        "Advanced semantic modeling identifies subtle factual drift and complete hallucinations in real-time.",
      icon: Zap,
    },
    {
      title: "Citation Integrity",
      description:
        "Never guess where data came from. We generate verifiable links for every verified claim automatically.",
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-5 sm:p-6 glass rounded-xl border-white/5 hover:border-primary/20 transition-all group">
            <f.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
