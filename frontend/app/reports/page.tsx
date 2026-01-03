"use client"

import { Suspense, useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { History, Search, Filter, Settings2, FileText, ChevronRight, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getReports, deleteReport, Report } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const { isLoggedIn, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/auth")
      return
    }

    if (isLoggedIn) {
      fetchReports()
    }
  }, [isLoggedIn, authLoading, router])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await getReports()
      setReports(data)
    } catch (err: any) {
      setError(err.message || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return
    
    try {
      setDeleting(id)
      await deleteReport(id)
      setReports(reports.filter(r => r.id !== id))
    } catch (err: any) {
      alert("Failed to delete report")
    } finally {
      setDeleting(null)
    }
  }

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden selection:bg-primary/30">
      <MobileHeader />
      
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 pt-20 lg:pt-10">
        <Suspense fallback={null}>
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                  <History className="w-6 md:w-8 h-6 md:h-8 text-primary" /> Reports History
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Audit log of all AI verification sessions.</p>
              </div>
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-white/10 w-full sm:w-64 h-10 rounded-xl bg-transparent"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass border-white/10 bg-transparent h-10 px-4 gap-2"
                  onClick={fetchReports}
                >
                  <Filter className="w-4 h-4" /> Refresh
                </Button>
              </div>
            </header>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="glass rounded-2xl md:rounded-[3rem] overflow-hidden border-white/10">
              {loading ? (
                <div className="p-12 md:p-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading reports...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                <>
                  {/* Mobile Card Layout */}
                  <div className="md:hidden divide-y divide-white/5">
                    {filteredReports.map((report) => (
                      <div key={report.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold tracking-tight text-sm truncate">{report.title}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">#{report.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${
                              report.status === "Verified"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : report.status === "Flagged"
                                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${report.score}%`, boxShadow: "0 0 10px var(--color-primary)" }}
                                />
                              </div>
                              <span className="text-xs font-bold font-mono">{report.score}%</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{report.timestamp}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10"
                              onClick={() => handleDelete(report.id)}
                              disabled={deleting === report.id}
                            >
                              {deleting === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 px-4 rounded-lg bg-primary text-white font-bold text-xs"
                              asChild
                            >
                              <Link href={`/reports/${report.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/5 bg-white/5">
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <th className="px-8 py-6">ID / Report Title</th>
                          <th className="px-8 py-6">Trust Score</th>
                          <th className="px-8 py-6">Status</th>
                          <th className="px-8 py-6">Time</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold tracking-tight">{report.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">{report.id.slice(0, 12)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${report.score}%`, boxShadow: "0 0 10px var(--color-primary)" }}
                                  />
                                </div>
                                <span className="text-sm font-bold font-mono">{report.score}%</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-1 rounded-md whitespace-nowrap ${
                                  report.status === "Verified"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : report.status === "Flagged"
                                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                                }`}
                              >
                                {report.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-sm text-muted-foreground font-medium">
                              {report.timestamp}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10"
                                  onClick={() => handleDelete(report.id)}
                                  disabled={deleting === report.id}
                                >
                                  {deleting === report.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 group-hover:bg-primary group-hover:text-white transition-all text-[11px] font-bold"
                                  asChild
                                >
                                  <Link href={`/reports/${report.id}`}>
                                    VIEW <ChevronRight className="w-3 h-3 ml-1" />
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-12 md:p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">No reports available.</h3>
                  <p className="text-muted-foreground text-sm">
                    Start your first verification to generate an audit report.
                  </p>
                  <Button className="mt-4 glow-primary" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Suspense>
      </main>
    </div>
  )
}
