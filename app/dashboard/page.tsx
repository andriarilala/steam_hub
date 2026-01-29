"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  Calendar,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp,
  BookOpen,
  Award,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { ConnectionMatcher } from "@/components/connection-matcher"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { t } = useLanguage()

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

  if (!user) {
    return null
  }

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  const quickActions = [
    { icon: Calendar, label: t("dashboard.viewAgenda"), href: "/agenda", color: "bg-blue-500" },
    { icon: Users, label: t("dashboard.findConnections"), href: "/community", color: "bg-green-500" },
    { icon: Briefcase, label: t("dashboard.exploreOpportunities"), href: "/partners", color: "bg-amber-500" },
    { icon: BookOpen, label: t("dashboard.accessContent"), href: "/community", color: "bg-purple-500" },
  ]

  const upcomingSessions = [
    { title: "Opening Keynote: Africa's Digital Future", time: "9:00 AM", date: "Mar 15", type: "Keynote" },
    { title: "Workshop: Building Your Personal Brand", time: "2:00 PM", date: "Mar 15", type: "Workshop" },
    { title: "Networking: Tech Leaders Meetup", time: "5:00 PM", date: "Mar 15", type: "Networking" },
  ]

  const recommendedConnections = [
    { name: "Sarah Johnson", role: "Software Engineer at Google", avatar: "/networking-professionals-conference.jpg" },
    { name: "Michael Chen", role: "Startup Founder", avatar: "/startup-pitch-competition.jpg" },
    { name: "Amina Diallo", role: "HR Director at Microsoft", avatar: "/women-leadership-panel.jpg" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pt-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("dashboard.welcome")}, {user.name}!
              </h1>
              <p className="text-foreground/70 mt-1">{t("dashboard.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("dashboard.signOut")}</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center">
                    {user.avatar ? (
                      <Image src={user.avatar || "/placeholder.svg"} alt={user.name} width={80} height={80} className="rounded-xl" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-foreground/70 text-sm">{user.email}</p>
                    {user.organization && <p className="text-foreground/50 text-sm">{user.organization}</p>}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-foreground/70">
                        <Users className="w-4 h-4" />
                        <span>{user.connections || 0} {t("dashboard.connections")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-foreground/70">
                        <Award className="w-4 h-4" />
                        <span>{t("dashboard.memberSince")} 2025</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {t("dashboard.editProfile")}
                  </Link>
                </div>

                {/* Profile Completion */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{t("dashboard.profileCompletion")}</span>
                    <span className="text-sm font-medium text-primary">60%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">{t("dashboard.completeProfile")}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.quickActions")}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors group"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-foreground/30 ml-auto group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{t("dashboard.upcomingSessions")}</h3>
                  <Link href="/agenda" className="text-sm text-primary hover:underline">
                    {t("dashboard.viewAll")}
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                    >
                      <div className="text-center">
                        <p className="text-xs text-foreground/50">{session.date}</p>
                        <p className="text-lg font-bold text-primary">{session.time}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{session.title}</p>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-foreground/70">
                          {session.type}
                        </span>
                      </div>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Star className="w-5 h-5 text-foreground/30 hover:text-amber-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Stats */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">{t("dashboard.yourStats")}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">{t("dashboard.sessionsAttended")}</span>
                    <span className="font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">{t("dashboard.connectionsCount")}</span>
                    <span className="font-bold text-foreground">{user.connections || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">{t("dashboard.messagesCount")}</span>
                    <span className="font-bold text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">{t("dashboard.opportunitiesSaved")}</span>
                    <span className="font-bold text-foreground">0</span>
                  </div>
                </div>
              </div>

              {/* Recommended Connections */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{t("dashboard.recommendedConnections")}</h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {recommendedConnections.map((person, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image src={person.avatar || "/placeholder.svg"} alt={person.name} width={40} height={40} className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{person.name}</p>
                        <p className="text-xs text-foreground/50 truncate">{person.role}</p>
                      </div>
                      <button className="px-3 py-1 border border-primary text-primary text-xs font-medium rounded-lg hover:bg-primary/5 transition-colors">
                        {t("dashboard.connect")}
                      </button>
                    </div>
                  ))}
                </div>
                <Link
                  href="/community"
                  className="block text-center text-sm text-primary hover:underline mt-4"
                >
                  {t("dashboard.viewMore")}
                </Link>
              </div>

              {/* Event Countdown */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{t("dashboard.eventCountdown")}</h3>
                <p className="text-foreground/70 text-sm mb-4">PASS AVENIR Summit 2025</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-2xl font-bold text-primary">45</p>
                    <p className="text-xs text-foreground/50">{t("dashboard.days")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-foreground/50">{t("dashboard.hours")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-2xl font-bold text-primary">30</p>
                    <p className="text-xs text-foreground/50">{t("dashboard.minutes")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-2xl font-bold text-primary">15</p>
                    <p className="text-xs text-foreground/50">{t("dashboard.seconds")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Matcher Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Discover Connections</h2>
                <p className="text-foreground/70">Find perfect matches based on your interests and goals</p>
              </div>
              <Link href="/community" className="text-primary font-medium hover:underline flex items-center gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-card rounded-lg border border-border p-8">
              <ConnectionMatcher />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground/70">This Month</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">8</p>
              <p className="text-sm text-foreground/70">New Connections</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground/70">This Month</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">15</p>
              <p className="text-sm text-foreground/70">Profile Views</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground/70">Achievements</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">3</p>
              <p className="text-sm text-foreground/70">Badges Earned</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground/70">Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">24</p>
              <p className="text-sm text-foreground/70">Conversations</p>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-8 bg-secondary/5 border border-secondary/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground mb-1">Complete Your Profile</h3>
                <p className="text-sm text-foreground/70">Add more details to increase visibility and match quality</p>
              </div>
              <Link href="/profile" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Complete
              </Link>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-secondary h-2 rounded-full" style={{ width: "65%" }}></div>
            </div>
            <p className="text-xs text-foreground/70 mt-2">65% Complete</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
