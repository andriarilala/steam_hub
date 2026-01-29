"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useAnalytics } from "@/lib/analytics-context"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, TrendingUp, Users, Eye, Target, ArrowDown } from "lucide-react"

const COLORS = ["#16697A", "#D4AF37", "#1A1A2E", "#088395", "#FF6B6B"]

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { analytics, isLoading: analyticsLoading, exportAnalytics } = useAnalytics()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || analyticsLoading || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const MetricCard = ({ icon: Icon, label, value, unit, trend, trendPositive }: any) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendPositive ? "text-green-500" : "text-red-500"}`}>
          <TrendingUp className="w-4 h-4" style={{ transform: trendPositive ? "none" : "scaleY(-1)" }} />
          <span className="font-semibold">{trend}%</span>
        </div>
      </div>
      <p className="text-foreground/70 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">
        {value.toLocaleString()}
        {unit && <span className="text-lg text-foreground/70 ml-1">{unit}</span>}
      </p>
    </div>
  )

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
              <p className="text-foreground/70">Real-time event tracking and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportAnalytics("csv")}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              icon={Eye}
              label="Total Visits"
              value={analytics.totalVisits}
              unit=""
              trend="12.5"
              trendPositive={true}
            />
            <MetricCard
              icon={Users}
              label="Unique Visitors"
              value={analytics.uniqueVisitors}
              unit=""
              trend="8.3"
              trendPositive={true}
            />
            <MetricCard
              icon={Target}
              label="Conversion Rate"
              value={analytics.conversionRate}
              unit="%"
              trend="15.2"
              trendPositive={true}
            />
            <MetricCard
              icon={TrendingUp}
              label="Bounce Rate"
              value={analytics.bounceRate}
              unit="%"
              trend="3.1"
              trendPositive={false}
            />
            <MetricCard
              icon={Eye}
              label="Avg Session Duration"
              value={analytics.avgSessionDuration}
              unit="min"
              trend="5.8"
              trendPositive={true}
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 border-b border-border mb-8">
            {["overview", "traffic", "conversions", "engagement"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold text-foreground mb-6">Daily Traffic & Conversions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#16697A" />
                    <Bar dataKey="conversions" fill="#D4AF37" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-6">Top Pages</h3>
                  <div className="space-y-4">
                    {analytics.pageViews.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-1">{page.pageName}</p>
                          <p className="text-xs text-foreground/60">{page.views.toLocaleString()} views</p>
                        </div>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(page.views / 12450) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-6">Traffic Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.pageViews}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ pageName, views }) => `${pageName}: ${((views / analytics.totalVisits) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="views"
                      >
                        {analytics.pageViews.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Traffic Tab */}
          {activeTab === "traffic" && (
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold text-foreground mb-6">Visitor Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#16697A" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.pageViews.map((page) => (
                  <div key={page.pageId} className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-bold text-foreground mb-4">{page.pageName}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Views</span>
                        <span className="font-medium text-foreground">{page.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Unique Visitors</span>
                        <span className="font-medium text-foreground">{page.uniqueVisitors.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Bounce Rate</span>
                        <span className="font-medium text-foreground">{page.bounceRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Avg Time on Page</span>
                        <span className="font-medium text-foreground">{page.avgTimeOnPage}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversions Tab */}
          {activeTab === "conversions" && (
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold text-foreground mb-6">Conversion Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="conversions" fill="#D4AF37" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold text-foreground mb-6">Conversion Funnel</h3>
                <div className="space-y-4">
                  {[
                    { stage: "Page Views", value: 45230, pct: 100 },
                    { stage: "Engaged Users", value: 32200, pct: 71 },
                    { stage: "Ticket Page Visits", value: 18940, pct: 42 },
                    { stage: "Registrations", value: 5746, pct: 12.7 },
                  ].map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{item.stage}</span>
                        <span className="text-sm text-foreground/70">{item.value.toLocaleString()} ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === "engagement" && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold text-foreground mb-6">Top Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Event</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Timestamp</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topEvents.map((event) => (
                      <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{event.eventName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{new Date(event.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-3 text-foreground/70">
                          {event.metadata ? JSON.stringify(event.metadata).substring(0, 50) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
