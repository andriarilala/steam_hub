"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface PageView {
  pageId: string
  pageName: string
  views: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
}

export interface Event {
  id: string
  eventName: string
  category: string
  timestamp: string
  userId?: string
  metadata?: Record<string, any>
}

export interface Analytics {
  totalVisits: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
  conversionRate: number
  pageViews: PageView[]
  topEvents: Event[]
  dailyData: Array<{ date: string; visits: number; conversions: number }>
}

interface AnalyticsContextType {
  analytics: Analytics | null
  isLoading: boolean
  trackEvent: (eventName: string, category: string, metadata?: Record<string, any>) => void
  trackPageView: (pageName: string) => void
  getAnalytics: () => Analytics | null
  exportAnalytics: (format: "pdf" | "csv") => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

function generateDemoAnalytics(): Analytics {
  return {
    totalVisits: 45230,
    uniqueVisitors: 12847,
    avgSessionDuration: 8.5, // minutes
    bounceRate: 28.4,
    conversionRate: 12.7,
    pageViews: [
      {
        pageId: "home",
        pageName: "Home",
        views: 12450,
        uniqueVisitors: 8230,
        bounceRate: 32.1,
        avgTimeOnPage: 4.2,
      },
      {
        pageId: "register",
        pageName: "Registration",
        views: 8920,
        uniqueVisitors: 6540,
        bounceRate: 22.8,
        avgTimeOnPage: 12.5,
      },
      {
        pageId: "agenda",
        pageName: "Agenda",
        views: 7650,
        uniqueVisitors: 5120,
        bounceRate: 18.3,
        avgTimeOnPage: 6.8,
      },
      {
        pageId: "partners",
        pageName: "Partners",
        views: 5430,
        uniqueVisitors: 3890,
        bounceRate: 35.2,
        avgTimeOnPage: 3.4,
      },
      {
        pageId: "community",
        pageName: "Community",
        views: 4780,
        uniqueVisitors: 2890,
        bounceRate: 41.5,
        avgTimeOnPage: 5.1,
      },
    ],
    topEvents: [
      {
        id: "event_1",
        eventName: "Ticket Purchased",
        category: "conversion",
        timestamp: "2025-03-16T14:30:00Z",
        metadata: { ticketType: "vip", amount: 150 },
      },
      {
        id: "event_2",
        eventName: "Session Bookmarked",
        category: "engagement",
        timestamp: "2025-03-16T13:45:00Z",
        metadata: { sessionId: "s_001" },
      },
      {
        id: "event_3",
        eventName: "Sponsor Profile Viewed",
        category: "engagement",
        timestamp: "2025-03-16T13:20:00Z",
        metadata: { sponsorId: "sponsor_001" },
      },
      {
        id: "event_4",
        eventName: "Connection Request Sent",
        category: "engagement",
        timestamp: "2025-03-16T12:50:00Z",
        metadata: { userId: "user_001" },
      },
      {
        id: "event_5",
        eventName: "Message Sent",
        category: "engagement",
        timestamp: "2025-03-16T11:30:00Z",
        metadata: { conversationId: "conv_001" },
      },
    ],
    dailyData: [
      { date: "Mar 10", visits: 1245, conversions: 156 },
      { date: "Mar 11", visits: 1789, conversions: 213 },
      { date: "Mar 12", visits: 2134, conversions: 287 },
      { date: "Mar 13", visits: 2456, conversions: 312 },
      { date: "Mar 14", visits: 3201, conversions: 398 },
      { date: "Mar 15", visits: 4234, conversions: 528 },
      { date: "Mar 16", visits: 4789, conversions: 612 },
    ],
  }
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setAnalytics(generateDemoAnalytics())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const trackEvent = (eventName: string, category: string, metadata?: Record<string, any>) => {
    const event: Event = {
      id: `event_${Date.now()}`,
      eventName,
      category,
      timestamp: new Date().toISOString(),
      metadata,
    }

    setEvents([...events, event])

    // Send to analytics service (would be Google Analytics, Mixpanel, etc.)
    if (typeof window !== "undefined") {
      console.log("[Analytics] Event tracked:", event)
    }
  }

  const trackPageView = (pageName: string) => {
    trackEvent("Page View", "navigation", { pageName })
  }

  const getAnalytics = () => analytics

  const exportAnalytics = (format: "pdf" | "csv") => {
    if (!analytics) return

    let content: string
    let filename: string

    if (format === "csv") {
      const lines = [
        "PASS AVENIR Analytics Report",
        `Generated: ${new Date().toLocaleString()}`,
        "",
        "SUMMARY METRICS",
        `Total Visits,${analytics.totalVisits}`,
        `Unique Visitors,${analytics.uniqueVisitors}`,
        `Avg Session Duration,${analytics.avgSessionDuration} minutes`,
        `Bounce Rate,${analytics.bounceRate}%`,
        `Conversion Rate,${analytics.conversionRate}%`,
        "",
        "PAGE VIEWS",
        "Page,Views,Unique Visitors,Bounce Rate,Avg Time",
        ...analytics.pageViews.map((pv) => `${pv.pageName},${pv.views},${pv.uniqueVisitors},${pv.bounceRate}%,${pv.avgTimeOnPage}min`),
      ]

      content = lines.join("\n")
      filename = `pass-avenir-analytics-${new Date().toISOString().split("T")[0]}.csv`
    } else {
      content = JSON.stringify(analytics, null, 2)
      filename = `pass-avenir-analytics-${new Date().toISOString().split("T")[0]}.json`
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

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        isLoading,
        trackEvent,
        trackPageView,
        getAnalytics,
        exportAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within AnalyticsProvider")
  }
  return context
}
