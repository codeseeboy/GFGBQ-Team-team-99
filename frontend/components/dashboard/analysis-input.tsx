/**
 * AnalysisInput Component - Text Input & Analysis Trigger
 * 
 * Main input area for users to paste AI-generated responses for verification.
 * Features:
 * - Large textarea with character counter (max 12,000 chars)
 * - Real-time verification log streaming
 * - Analyze and auto-detect buttons
 * - Loading state with disabled input during analysis
 * 
 * @component
 * @example
 * <AnalysisInput onAnalyze={handleAnalyze} analyzing={isAnalyzing} />
 */

"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { VerificationLog } from "./verification-log"

/**
 * AnalysisInput Props
 * @property {(val: string) => void} onAnalyze - Callback when analyze button is clicked
 * @property {boolean} analyzing - Whether analysis is currently running
 */
export function AnalysisInput({ onAnalyze, analyzing }: { onAnalyze: (val: string) => void; analyzing: boolean }) {
  const [text, setText] = useState("")

  return (
    <div className="glass p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10">
        {/* Header section with title and source detector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              Paste AI-Generated Response <Sparkles className="w-4 h-4 text-primary" />
            </h2>
            {/* List of supported LLM providers */}
            <p className="text-[10px] sm:text-xs text-muted-foreground">Powered by Gemini 2.5 Flash • Groq LLaMA-3.3 • OpenRouter</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-7 bg-white/5 border border-white/5 hover:bg-white/10 uppercase tracking-widest font-bold hidden sm:flex"
          >
            Auto-Detect Source
          </Button>
        </div>

        {/* Text input area with character counter */}
        <div className="relative">
          <Textarea
            placeholder="Paste the LLM output here for deep verification..."
            className="min-h-[150px] sm:min-h-[200px] bg-black/40 border-white/10 focus-visible:ring-primary/50 text-sm sm:text-base leading-relaxed resize-none rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all focus:bg-black/60"
            disabled={analyzing}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {/* Character counter - shows current / max */}
          <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 text-[10px] text-muted-foreground font-mono">
            {text.length.toLocaleString()} / 12,000 chars
          </div>
        </div>

        {/* Live verification log stream from backend */}
        <VerificationLog isActive={analyzing} />

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase px-2 py-0.5">
              Claim Extraction
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase px-2 py-0.5">
              Citation Check
            </Badge>
          </div>
          <Button
            onClick={() => onAnalyze(text)}
            disabled={analyzing || !text.trim()}
            className="h-11 sm:h-12 px-6 sm:px-10 font-bold glow-primary rounded-xl transition-all active:scale-95 w-full sm:w-auto"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" /> Start Verification
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
