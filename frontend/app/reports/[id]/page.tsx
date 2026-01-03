"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { ResultsArea } from "@/components/dashboard/results-area"
import { MobileInsightSummary, InsightRail } from "@/components/dashboard/insight-rail"
import { getReportById, AnalysisResult } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Calendar, FileText, Loader2, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { generateReportPDF } from "@/lib/pdf-generator"

interface ReportData extends AnalysisResult {
  originalText: string
  createdAt: string
}

export default function ReportViewPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)

  const { isLoggedIn, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/auth")
      return
    }

    if (isLoggedIn && reportId) {
      fetchReport()
    }
  }, [isLoggedIn, authLoading, reportId, router])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await getReportById(reportId)
      setReport(data)
    } catch (err: any) {
      console.error("Failed to fetch report:", err)
      setError(err.message || "Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">Failed to Load Report</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="glow-primary">
            <Link href="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!report) {
    return null
  }

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    } catch {
      return dateStr
    }
  }

  const handleDownloadPDF = async () => {
    if (report && !downloading) {
      setDownloading(true)
      try {
        await generateReportPDF(report, reportId)
      } catch (err) {
        console.error("PDF generation failed:", err)
        alert("Failed to generate PDF. Please try again.")
      } finally {
        setDownloading(false)
      }
    }
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
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 md:mb-10"
            >
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 text-xs text-primary font-bold hover:underline mb-4 uppercase tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Reports
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                        Verification Report
                      </h1>
                      <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                        ID: {reportId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">{formatDate(report.createdAt)}</span>
                    <span className="sm:hidden">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm gap-2 disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              </div>
            </motion.header>

            {/* Original Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/10 mb-6"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Original Text Analyzed
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">
                "{report.originalText}"
              </p>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ResultsArea
                analyzing={false}
                data={report}
                originalContent={report.originalText}
              />
            </motion.div>

            {/* Mobile Insight Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <MobileInsightSummary
                visible={true}
                sources={report.sources || []}
                score={report.score}
                claims={report.claims}
              />
            </motion.div>
          </div>
        </div>

        {/* Desktop Insight Rail */}
        <InsightRail
          visible={true}
          sources={report.sources || []}
          score={report.score}
          claims={report.claims}
        />
      </main>
    </div>
  )
}
