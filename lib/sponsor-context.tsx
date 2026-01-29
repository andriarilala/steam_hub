"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface SponsorAnalytics {
  id: string
  sponsorName: string
  packageType: "institutional" | "impact" | "innovation" | "premium"
  boothVisits: number
  boothVisitsTrend: number // percentage change
  impressions: number
  impressionsTrend: number
  clicks: number
  clicksTrend: number
  leads: number
  leadsTrend: number
  conversions: number
  conversionsTrend: number
  ctr: number // click-through rate
  roi: number // return on investment
  engagement: number // 0-100
  socialMentions: number
  videoViews: number
  downloadsMaterial: number
}

export interface SponsorDashboardData {
  analytics: SponsorAnalytics
  sessions: Array<{
    id: string
    title: string
    date: string
    attendees: number
    engagement: number
  }>
  leads: Array<{
    id: string
    name: string
    email: string
    organization: string
    date: string
    interested: boolean
  }>
  messages: Array<{
    id: string
    from: string
    subject: string
    date: string
    unread: boolean
  }>
}

interface SponsorContextType {
  sponsorData: SponsorDashboardData | null
  isLoading: boolean
  updateAnalytics: (data: Partial<SponsorAnalytics>) => void
  exportReport: () => void
}

const SponsorContext = createContext<SponsorContextType | undefined>(undefined)

// Demo data generator
function generateDemoSponsorData(): SponsorDashboardData {
  return {
    analytics: {
      id: "sponsor_001",
      sponsorName: "TechCorp Africa",
      packageType: "premium",
      boothVisits: 2847,
      boothVisitsTrend: 12.5,
      impressions: 45230,
      impressionsTrend: 8.3,
      clicks: 3421,
      clicksTrend: 15.2,
      leads: 284,
      leadsTrend: 22.1,
      conversions: 42,
      conversionsTrend: 18.5,
      ctr: 7.56,
      roi: 340,
      engagement: 82,
      socialMentions: 156,
      videoViews: 1203,
      downloadsMaterial: 892,
    },
    sessions: [
      {
        id: "s1",
        title: "Tech Innovation Workshop",
        date: "March 15, 2025",
        attendees: 245,
        engagement: 89,
      },
      {
        id: "s2",
        title: "Recruitment Session",
        date: "March 16, 2025",
        attendees: 182,
        engagement: 76,
      },
      {
        id: "s3",
        title: "Networking Breakfast",
        date: "March 15, 2025",
        attendees: 95,
        engagement: 71,
      },
    ],
    leads: [
      {
        id: "l1",
        name: "Amara Diallo",
        email: "amara@example.com",
        organization: "Tech Startup",
        date: "March 15, 2025",
        interested: true,
      },
      {
        id: "l2",
        name: "John Smith",
        email: "john@example.com",
        organization: "Global Corp",
        date: "March 15, 2025",
        interested: true,
      },
      {
        id: "l3",
        name: "Marie Dupont",
        email: "marie@example.com",
        organization: "Innovation Lab",
        date: "March 16, 2025",
        interested: false,
      },
    ],
    messages: [
      {
        id: "m1",
        from: "Event Organizers",
        subject: "Your Premium Package Update",
        date: "March 14, 2025",
        unread: true,
      },
      {
        id: "m2",
        from: "Partnership Manager",
        subject: "New Networking Opportunities",
        date: "March 13, 2025",
        unread: true,
      },
      {
        id: "m3",
        from: "Participant",
        subject: "Question about your booth",
        date: "March 12, 2025",
        unread: false,
      },
    ],
  }
}

export function SponsorProvider({ children }: { children: ReactNode }) {
  const [sponsorData, setSponsorData] = useState<SponsorDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setSponsorData(generateDemoSponsorData())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const updateAnalytics = (data: Partial<SponsorAnalytics>) => {
    if (sponsorData) {
      setSponsorData({
        ...sponsorData,
        analytics: { ...sponsorData.analytics, ...data },
      })
    }
  }

  const exportReport = () => {
    if (!sponsorData) return

    const { analytics } = sponsorData
    const reportContent = `
PASS AVENIR - Sponsor Performance Report
========================================

Sponsor: ${analytics.sponsorName}
Package: ${analytics.packageType.toUpperCase()}
Report Date: ${new Date().toLocaleDateString()}

KEY METRICS
-----------
Booth Visits: ${analytics.boothVisits.toLocaleString()} (↑${analytics.boothVisitsTrend}%)
Impressions: ${analytics.impressions.toLocaleString()} (↑${analytics.impressionsTrend}%)
Clicks: ${analytics.clicks.toLocaleString()} (↑${analytics.clicksTrend}%)
Leads Generated: ${analytics.leads} (↑${analytics.leadsTrend}%)
Conversions: ${analytics.conversions}
Click-Through Rate: ${analytics.ctr.toFixed(2)}%
ROI: ${analytics.roi}%
Engagement Score: ${analytics.engagement}/100

ADDITIONAL METRICS
------------------
Social Media Mentions: ${analytics.socialMentions}
Video Views: ${analytics.videoViews.toLocaleString()}
Material Downloads: ${analytics.downloadsMaterial}

SESSIONS
--------
${sponsorData.sessions.map((s) => `- ${s.title}: ${s.attendees} attendees (${s.engagement}% engagement)`).join("\n")}

LEADS CAPTURED
--------------
${sponsorData.leads.map((l) => `- ${l.name} (${l.organization}) - ${l.date}`).join("\n")}

---
Generated at ${new Date().toLocaleString()}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `PASS_AVENIR_Sponsor_Report_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <SponsorContext.Provider value={{ sponsorData, isLoading, updateAnalytics, exportReport }}>
      {children}
    </SponsorContext.Provider>
  )
}

export function useSponsor() {
  const context = useContext(SponsorContext)
  if (context === undefined) {
    throw new Error("useSponsor must be used within SponsorProvider")
  }
  return context
}
