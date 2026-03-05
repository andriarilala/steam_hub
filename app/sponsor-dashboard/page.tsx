"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useSponsor } from "@/lib/sponsor-context"
import {
  BarChart,
  LineChart,
  Line,
  Bar,
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
import {
  Download,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  UserCheck,
  Target,
  Zap,
  MessageSquare,
  FileText,
  ChevronRight,
  ArrowUp,
} from "lucide-react"

const chartData = [
  { day: "Mon", visits: 240, clicks: 120, leads: 45 },
  { day: "Tue", visits: 320, clicks: 180, leads: 62 },
  { day: "Wed", visits: 280, clicks: 150, leads: 58 },
  { day: "Thu", visits: 410, clicks: 200, leads: 85 },
  { day: "Fri", visits: 520, clicks: 280, leads: 92 },
  { day: "Sat", visits: 450, clicks: 240, leads: 78 },
]

const conversionData = [
  { name: "Interested", value: 184 },
  { name: "Contacted", value: 65 },
  { name: "Converted", value: 35 },
]

const COLORS = ["#16697A", "#D4AF37", "#1A1A2E"]

export default function SponsorDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const { sponsorData, isLoading: sponsorLoading, exportReport } = useSponsor()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace("/signin");
      else if (user?.role !== "sponsor") {
        router.replace(user?.role === "admin" ? "/admin" : "/youth");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || sponsorLoading || !sponsorData || user?.role !== "sponsor") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const { analytics, sessions, leads, messages } = sponsorData

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        <div className="flex items-center gap-1 text-sm">
          <ArrowUp className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-semibold">{trend}%</span>
        </div>
      </div>
      <p className="text-foreground/70 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{t("sponsor.dashboardTitle")}</h1>
              <p className="text-foreground/70">Track your booth performance, leads, and engagement metrics</p>
            </div>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Eye}
              label="Booth Visits"
              value={analytics.boothVisits}
              trend={analytics.boothVisitsTrend}
              color="primary"
            />
            <StatCard
              icon={Zap}
              label="Impressions"
              value={analytics.impressions}
              trend={analytics.impressionsTrend}
              color="secondary"
            />
            <StatCard
              icon={MousePointer}
              label="Clicks"
              value={analytics.clicks}
              trend={analytics.clicksTrend}
              color="accent"
            />
            <StatCard
              icon={Users}
              label="Leads"
              value={analytics.leads}
              trend={analytics.leadsTrend}
              color="primary"
            />
            <StatCard
              icon={Target}
              label="Conversions"
              value={analytics.conversions}
              trend={analytics.conversionsTrend}
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 border-b border-border mb-8">
            {["overview", "analytics", "leads", "sessions", "messages"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === tab
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">CTR (Click-Through Rate)</h3>
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-2">{analytics.ctr.toFixed(2)}%</p>
                  <p className="text-sm text-foreground/70">Industry avg: 4.5%</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">ROI</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-2">{analytics.roi}%</p>
                  <p className="text-sm text-foreground/70">Return on investment</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">Engagement</h3>
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-2">{analytics.engagement}%</p>
                  <p className="text-sm text-foreground/70">Audience engagement score</p>
                </div>
              </div>

              {/* Social & Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-4">Social Mentions</h3>
                  <p className="text-3xl font-bold text-primary mb-2">{analytics.socialMentions}</p>
                  <p className="text-sm text-foreground/70">Across social platforms</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-4">Video Views</h3>
                  <p className="text-3xl font-bold text-secondary mb-2">{analytics.videoViews.toLocaleString()}</p>
                  <p className="text-sm text-foreground/70">Sponsor video content</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-4">Material Downloads</h3>
                  <p className="text-3xl font-bold text-accent mb-2">{analytics.downloadsMaterial}</p>
                  <p className="text-sm text-foreground/70">Brochures & resources</p>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-bold text-foreground mb-6">Daily Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#1A1A2E" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#D4AF37" strokeWidth={2} />
                    <Line type="monotone" dataKey="leads" stroke="#16697A" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-6">Conversion Funnel</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-bold text-foreground mb-6">Key Insights</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 bg-primary rounded-full" />
                      <div>
                        <p className="font-medium text-foreground">Peak Traffic</p>
                        <p className="text-sm text-foreground/70">Thursday 2-5 PM saw highest engagement</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-secondary rounded-full" />
                      <div>
                        <p className="font-medium text-foreground">Top Audience</p>
                        <p className="text-sm text-foreground/70">Tech professionals aged 25-35</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-accent rounded-full" />
                      <div>
                        <p className="font-medium text-foreground">Lead Quality</p>
                        <p className="text-sm text-foreground/70">65% leads marked as high interest</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Organization</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                        <td className="px-6 py-4 text-foreground/70">{lead.organization}</td>
                        <td className="px-6 py-4 text-foreground/70">{lead.email}</td>
                        <td className="px-6 py-4 text-foreground/70">{lead.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${lead.interested
                                ? "bg-green-500/20 text-green-700"
                                : "bg-yellow-500/20 text-yellow-700"
                              }`}
                          >
                            {lead.interested ? "Interested" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{session.title}</h3>
                      <div className="flex gap-6 text-sm text-foreground/70">
                        <span>{session.date}</span>
                        <span>{session.attendees} attendees</span>
                        <span>Engagement: {session.engagement}%</span>
                      </div>
                    </div>
                    <Link href="#" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${msg.unread ? "bg-primary/5 border-primary/50" : ""
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-${msg.unread ? "bold" : "medium"} text-foreground mb-1`}>{msg.from}</p>
                      <p className="text-foreground/70 text-sm mb-2">{msg.subject}</p>
                      <p className="text-xs text-foreground/50">{msg.date}</p>
                    </div>
                    {msg.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
