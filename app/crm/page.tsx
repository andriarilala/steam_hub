"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useCRM } from "@/lib/crm-context"
import { Search, Filter, Download, Plus, Trash2, MessageSquare, Edit2, Tag, Mail, Phone } from "lucide-react"

export default function CRMPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { leads, searchLeads, filterLeadsByStatus, getLeadSegments, exportLeads, addNote, updateLead } = useCRM()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [noteText, setNoteText] = useState("")
  const [activeTab, setActiveTab] = useState("pipeline")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const segments = getLeadSegments()
  let displayedLeads = searchQuery ? searchLeads(searchQuery) : leads

  if (selectedStatus !== "all") {
    displayedLeads = displayedLeads.filter((l) => l.status === selectedStatus)
  }

  const statuses: Array<{ value: string; label: string; color: string }> = [
    { value: "new", label: "New", color: "bg-blue-500/20 text-blue-700" },
    { value: "contacted", label: "Contacted", color: "bg-yellow-500/20 text-yellow-700" },
    { value: "qualified", label: "Qualified", color: "bg-purple-500/20 text-purple-700" },
    { value: "nurturing", label: "Nurturing", color: "bg-green-500/20 text-green-700" },
    { value: "converted", label: "Converted", color: "bg-emerald-500/20 text-emerald-700" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Lead Management</h1>
              <p className="text-foreground/70">Manage and track all leads from PASS AVENIR</p>
            </div>
            <button
              onClick={() => exportLeads("csv")}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Segments */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {segments.map((seg) => (
              <div key={seg.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <p className="text-foreground/70 text-sm mb-2">{seg.name}</p>
                <p className="text-3xl font-bold text-primary">{seg.leadCount}</p>
                <p className="text-xs text-foreground/50 mt-2">{seg.criteria}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-border mb-8">
            {["pipeline", "all", "hot", "converted"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {tab === "pipeline" ? "Sales Pipeline" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(selectedStatus === status.value ? "all" : status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status.value
                      ? `${status.color} border-2 border-current`
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{lead.name}</h3>
                    <p className="text-sm text-foreground/70">{lead.position}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statuses.find((s) => s.value === lead.status)?.color || "bg-gray-500/20"
                    }`}
                  >
                    {statuses.find((s) => s.value === lead.status)?.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.organization && <p>{lead.organization}</p>}
                </div>

                {lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded hover:bg-muted/80 transition-colors text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Note
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded hover:bg-muted/80 transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>
            ))}
          </div>

          {displayedLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60">No leads found</p>
            </div>
          )}
        </div>
      </section>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
              <h2 className="text-2xl font-bold text-foreground">{selectedLead.name}</h2>
              <button onClick={() => setSelectedLead(null)} className="text-foreground/60 hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Details */}
              <div>
                <h3 className="font-bold text-foreground mb-4">Contact Details</h3>
                <div className="space-y-2 text-sm text-foreground/70">
                  <p>Email: {selectedLead.email}</p>
                  {selectedLead.phone && <p>Phone: {selectedLead.phone}</p>}
                  {selectedLead.organization && <p>Organization: {selectedLead.organization}</p>}
                  {selectedLead.position && <p>Position: {selectedLead.position}</p>}
                </div>
              </div>

              {/* Add Note */}
              <div>
                <h3 className="font-bold text-foreground mb-4">Add Note</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this lead..."
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
                <button
                  onClick={() => {
                    addNote(selectedLead.id, noteText)
                    setNoteText("")
                  }}
                  className="mt-3 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Save Note
                </button>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <h3 className="font-bold text-foreground mb-4">Notes</h3>
                  <p className="text-foreground/70 text-sm">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
