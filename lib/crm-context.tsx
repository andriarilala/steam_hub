"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  organization?: string
  position?: string
  interests: string[]
  status: "new" | "contacted" | "qualified" | "nurturing" | "converted"
  source: "form" | "booth" | "email" | "networking" | "social"
  notes: string
  lastInteraction: string
  createdAt: string
  tags: string[]
}

export interface LeadSegment {
  id: string
  name: string
  criteria: string
  leadCount: number
}

interface CRMContextType {
  leads: Lead[]
  isLoading: boolean
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  searchLeads: (query: string) => Lead[]
  filterLeadsByStatus: (status: Lead["status"]) => Lead[]
  getLeadSegments: () => LeadSegment[]
  exportLeads: (format: "csv" | "json") => void
  addNote: (leadId: string, note: string) => void
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

// Demo leads generator
function generateDemoLeads(): Lead[] {
  return [
    {
      id: "lead_1",
      name: "Amara Diallo",
      email: "amara.diallo@tech.com",
      phone: "+234 812 345 6789",
      organization: "Tech Innovations Ltd",
      position: "Business Development Manager",
      interests: ["Technology", "Innovation", "Partnerships"],
      status: "qualified",
      source: "booth",
      notes: "Very interested in partnership opportunities. Follow up next week.",
      lastInteraction: "March 15, 2025",
      createdAt: "2025-03-15T10:30:00Z",
      tags: ["hot-lead", "partnership"],
    },
    {
      id: "lead_2",
      name: "John Smith",
      email: "john.smith@global.com",
      phone: "+1 555 123 4567",
      organization: "Global Innovations Corp",
      position: "Recruiting Manager",
      interests: ["Talent", "Education", "Development"],
      status: "contacted",
      source: "form",
      notes: "Looking for internship partnerships.",
      lastInteraction: "March 14, 2025",
      createdAt: "2025-03-14T14:20:00Z",
      tags: ["recruitment"],
    },
    {
      id: "lead_3",
      name: "Marie Dupont",
      email: "marie.dupont@education.com",
      phone: "+33 1 23 45 67 89",
      organization: "European Education Foundation",
      position: "Director",
      interests: ["Education", "Sponsorship", "Youth"],
      status: "new",
      source: "email",
      notes: "Initial inquiry about sponsorship packages.",
      lastInteraction: "March 16, 2025",
      createdAt: "2025-03-16T09:00:00Z",
      tags: ["sponsor-inquiry"],
    },
    {
      id: "lead_4",
      name: "David Chen",
      email: "d.chen@venture.com",
      phone: "+886 2 1234 5678",
      organization: "Asia Ventures",
      position: "Investment Manager",
      interests: ["Startups", "Innovation", "Investment"],
      status: "nurturing",
      source: "networking",
      notes: "Met at opening ceremony. Sent follow-up proposal.",
      lastInteraction: "March 16, 2025",
      createdAt: "2025-03-16T11:30:00Z",
      tags: ["investor", "hot-lead"],
    },
    {
      id: "lead_5",
      name: "Zainab Ahmed",
      email: "zainab@agency.com",
      phone: "+216 71 123 456",
      organization: "African Digital Agency",
      position: "CEO",
      interests: ["Digital", "Marketing", "Technology"],
      status: "converted",
      source: "social",
      notes: "Signed partnership agreement on March 16.",
      lastInteraction: "March 16, 2025",
      createdAt: "2025-03-13T16:45:00Z",
      tags: ["partner", "converted"],
    },
  ]
}

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLeads(generateDemoLeads())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const addLead = (lead: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setLeads([...leads, newLead])
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)))
  }

  const deleteLead = (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id))
  }

  const searchLeads = (query: string) => {
    const q = query.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.organization?.toLowerCase().includes(q)
    )
  }

  const filterLeadsByStatus = (status: Lead["status"]) => {
    return leads.filter((lead) => lead.status === status)
  }

  const getLeadSegments = (): LeadSegment[] => {
    return [
      {
        id: "seg_1",
        name: "Hot Leads",
        criteria: "Status: Qualified & Contacted",
        leadCount: leads.filter((l) => (l.status === "qualified" || l.status === "contacted") && l.tags.includes("hot-lead")).length,
      },
      {
        id: "seg_2",
        name: "Partnership Prospects",
        criteria: "Interests: Partnership",
        leadCount: leads.filter((l) => l.interests.includes("Partnerships")).length,
      },
      {
        id: "seg_3",
        name: "Sponsors",
        criteria: "Tags: Sponsor",
        leadCount: leads.filter((l) => l.tags.includes("sponsor-inquiry")).length,
      },
      {
        id: "seg_4",
        name: "Converted",
        criteria: "Status: Converted",
        leadCount: leads.filter((l) => l.status === "converted").length,
      },
    ]
  }

  const exportLeads = (format: "csv" | "json") => {
    let content: string
    let filename: string

    if (format === "csv") {
      const headers = ["Name", "Email", "Organization", "Position", "Status", "Source", "Created Date"]
      const rows = leads.map((lead) => [
        lead.name,
        lead.email,
        lead.organization || "",
        lead.position || "",
        lead.status,
        lead.source,
        new Date(lead.createdAt).toLocaleDateString(),
      ])

      content = [headers, ...rows].map((row) => row.join(",")).join("\n")
      filename = `pass-avenir-leads-${new Date().toISOString().split("T")[0]}.csv`
    } else {
      content = JSON.stringify(leads, null, 2)
      filename = `pass-avenir-leads-${new Date().toISOString().split("T")[0]}.json`
    }

    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const addNote = (leadId: string, note: string) => {
    updateLead(leadId, {
      notes: note,
      lastInteraction: new Date().toLocaleDateString(),
    })
  }

  return (
    <CRMContext.Provider
      value={{
        leads,
        isLoading,
        addLead,
        updateLead,
        deleteLead,
        searchLeads,
        filterLeadsByStatus,
        getLeadSegments,
        exportLeads,
        addNote,
      }}
    >
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const context = useContext(CRMContext)
  if (context === undefined) {
    throw new Error("useCRM must be used within CRMProvider")
  }
  return context
}
