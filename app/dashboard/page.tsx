"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ChevronRight,
  Bell,
  Moon,
  RotateCcw,
  Globe,
  Star,
  Plus,
  MoreVertical,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState<{
    upcomingEvents: {
      title: string;
      description?: string;
      date: string;
      type?: string;
    }[];
    recommendedConnections: {
      id: string;
      name: string;
      role: string;
      image: string;
    }[];
    stats: {
      sessionsAttended: number;
      connectionsCount: number;
      messagesCount: number;
      opportunitiesSaved: number;
    };
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
    // redirect admins away from user dashboard
    if (!isLoading && isAuthenticated && (user?.role as string) === "admin") {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          setDashboardData(data);
        })
        .catch((err) => console.error("failed to load dashboard data", err));
    }
  }, [isAuthenticated]);

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center dark">
        <div className="w-8 h-8 border-4 border-[#B6FF33]/30 border-t-[#B6FF33] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
        {/* --- Sidebar Gauche --- */}
        <aside className="w-64 bg-card border-r border-border flex flex-col hidden lg:flex">
          <div className="p-6 flex-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  PH
                </span>
              </div>
              <span className="font-bold text-lg tracking-tight">
                PASS AVENIR
              </span>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-background/20 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-foreground/10 px-1 rounded text-foreground/40">
                ⌘ K
              </span>
            </div>

            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-foreground/20 uppercase tracking-widest mb-2">
                Dashboards
              </p>
              <NavItem icon={LayoutDashboard} label="Overview" active />
              <NavItem icon={Users} label="Community" />
              <NavItem icon={Calendar} label="Agenda" />
              <NavItem icon={Briefcase} label="Opportunities" />
            </nav>

            <nav className="space-y-1 mt-8">
              <p className="px-3 text-[10px] font-bold text-foreground/20 uppercase tracking-widest mb-2">
                Settings
              </p>
              <NavItem icon={MessageSquare} label="Messages" />
              <NavItem icon={Settings} label="Settings" />
              <NavItem icon={HelpCircle} label="Help Centre" />
              {(user.role as string) === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-colors mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm font-bold">Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="p-6 border-t border-border mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-foreground/10 overflow-hidden">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name || "User"}
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-foreground/40 truncate capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 text-foreground/40 hover:text-foreground text-sm transition-colors py-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* --- Contenu Central --- */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2 text-sm">
              <LayoutDashboard className="w-4 h-4 text-foreground/30" />
              <span className="text-foreground/30">/</span>
              <span className="text-foreground/30">Dashboards</span>
              <span className="text-foreground/30">/</span>
              <span className="font-medium text-foreground/80">Overview</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-foreground/40">
                <Moon className="w-4 h-4 cursor-pointer hover:text-foreground" />
                <RotateCcw className="w-4 h-4 cursor-pointer hover:text-foreground" />
                <Bell className="w-4 h-4 cursor-pointer hover:text-foreground" />
                <Globe className="w-4 h-4 cursor-pointer hover:text-foreground" />
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Overview</h1>
              <button className="flex items-center gap-2 bg-card border border-border text-xs px-3 py-1.5 rounded-lg hover:bg-foreground/5 transition-colors">
                Today <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Connections"
                value={dashboardData.stats.connectionsCount.toString()}
                trend="+8%"
                trendDir="up"
              />
              <StatCard
                title="Sessions"
                value={dashboardData.stats.sessionsAttended.toString()}
                trend="+2"
                trendDir="up"
              />
              <StatCard
                title="Opportunities"
                value={dashboardData.stats.opportunitiesSaved.toString()}
                trend="71%"
                trendDir="neutral"
              />
              <StatCard
                title="Messages"
                value={dashboardData.stats.messagesCount.toString()}
                trend="11%"
                trendDir="up"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Activity */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold">Weekly Activity</h2>
                  <MoreVertical className="w-4 h-4 text-foreground/30" />
                </div>
                <div className="flex items-center gap-8 mb-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-foreground/5"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="60"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold">85%</span>
                      <span className="text-[10px] text-foreground/30 uppercase">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-foreground/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Events
                      (60%)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/50" />{" "}
                      Community (25%)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-foreground/10" />{" "}
                      Tasks (15%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection List */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold">Recommended Connections</h2>
                  <MoreVertical className="w-4 h-4 text-foreground/30" />
                </div>
                <div className="space-y-4">
                  {dashboardData.recommendedConnections
                    .slice(0, 3)
                    .map((conn) => (
                      <div key={conn.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-foreground/5">
                          <Image
                            src={conn.image || "/placeholder.svg"}
                            alt={conn.name}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            {conn.name}
                          </p>
                          <p className="text-xs text-foreground/40 truncate">
                            {conn.role}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors">
                          Connect
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Agenda Preview */}
            <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold">Upcoming Agenda</h2>
                <button className="flex items-center gap-1 text-xs text-primary font-bold uppercase tracking-widest">
                  View Full <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-foreground/20 border-b border-border">
                    <th className="pb-4 font-bold uppercase text-[10px]">
                      Event Name
                    </th>
                    <th className="pb-4 font-bold uppercase text-[10px]">
                      Type
                    </th>
                    <th className="pb-4 font-bold uppercase text-[10px] text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dashboardData.upcomingEvents.slice(0, 3).map((event, i) => (
                    <tr key={i} className="group">
                      <td className="py-4 font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {event.title}
                      </td>
                      <td className="py-4 text-foreground/40">
                        {event.type || "Workshop"}
                      </td>
                      <td className="py-4 text-right text-foreground/60">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* --- Sidebar Droite --- */}
        <aside className="w-80 bg-card border-l border-border flex flex-col hidden xl:flex">
          <div className="p-8">
            <h2 className="font-bold mb-6">Notifications</h2>
            <div className="space-y-6">
              <NotificationItem
                icon={Users}
                text="56 New users registered"
                time="Just now"
                color="text-primary"
              />
              <NotificationItem
                icon={Calendar}
                text="Session starting in 15m"
                time="59m ago"
                color="text-amber-500"
              />
              <NotificationItem
                icon={Star}
                text="New badge earned"
                time="12h ago"
                color="text-primary"
              />
            </div>

            <div className="mt-12">
              <h2 className="font-bold mb-6">Recent Activity</h2>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-foreground/5">
                <ActivityItem
                  dotColor="bg-primary"
                  label="Profile updated"
                  time="Just now"
                />
                <ActivityItem
                  dotColor="bg-foreground/20"
                  label="Joined Community"
                  time="4h ago"
                />
                <ActivityItem
                  dotColor="bg-foreground/20"
                  label="Event registered"
                  time="1d ago"
                />
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Upgrade Profile</h3>
              <p className="text-xs text-foreground/40 mb-6 leading-relaxed">
                Boost your visibility and get recommended to top institutions.
              </p>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
                Get Started
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  trendDir,
}: {
  title: string;
  value: string;
  trend: string;
  trendDir: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl">
      <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mb-2">
        {title}
      </p>
      <h3 className="text-2xl font-bold mb-3">{value}</h3>
      <div
        className={`flex items-center gap-1 text-[10px] font-bold ${trendDir === "up" ? "text-primary" : "text-foreground/30"}`}
      >
        <ChevronRight
          className={`w-3 h-3 ${trendDir === "up" ? "-rotate-90" : ""}`}
        />
        {trend} vs last month
      </div>
    </div>
  );
}

function NotificationItem({
  icon: Icon,
  text,
  time,
  color,
}: {
  icon: any;
  text: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold leading-snug mb-1">{text}</p>
        <p className="text-[10px] text-foreground/30">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  dotColor,
  label,
  time,
}: {
  dotColor: string;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-4 relative z-0">
      <div
        className={`w-6 h-6 rounded-full border-4 border-card ${dotColor} flex items-center justify-center shrink-0`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold">{label}</p>
        <p className="text-[10px] text-foreground/30">{time}</p>
      </div>
    </div>
  );
}
