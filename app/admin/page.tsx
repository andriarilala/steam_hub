"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  GitBranch,
  MessageSquare,
  MailOpen,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalConnections: number;
  totalContacts: number;
  unreadContacts: number;
  totalTicketOrders: number;
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    image?: string;
  }[];
  roleBreakdown: { role: string; count: number }[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400",
  youth: "bg-primary/20 text-primary",
  company: "bg-blue-500/20 text-blue-400",
  institution: "bg-purple-500/20 text-purple-400",
  mentor: "bg-amber-500/20 text-amber-400",
  sponsor: "bg-emerald-500/20 text-emerald-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load stats");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>{error || "No data"}</p>
        <button
          onClick={load}
          className="mt-4 text-xs underline text-foreground/60"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "text-primary",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      href: "/admin/events",
      color: "text-blue-400",
    },
    {
      title: "Connections",
      value: stats.totalConnections,
      icon: GitBranch,
      href: "#",
      color: "text-purple-400",
    },
    {
      title: "Contact Messages",
      value: stats.totalContacts,
      icon: MessageSquare,
      href: "/admin/contacts",
      color: "text-amber-400",
    },
    {
      title: "Unread Contacts",
      value: stats.unreadContacts,
      icon: MailOpen,
      href: "/admin/contacts?status=unread",
      color: "text-red-400",
    },
    {
      title: "Ticket Orders",
      value: stats.totalTicketOrders,
      icon: GitBranch,
      href: "#",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-foreground/40 mt-1">
            Platform statistics and latest activity
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs bg-card border border-border px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-colors group"
          >
            <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
            <p className="text-2xl font-bold mb-1">{s.value}</p>
            <p className="text-[11px] text-foreground/40 font-medium leading-tight">
              {s.title}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-sm">Recent Registrations</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-primary font-bold uppercase tracking-widest"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-foreground/20 border-b border-border">
                  <th className="pb-3 text-left font-bold uppercase text-[10px]">
                    Name
                  </th>
                  <th className="pb-3 text-left font-bold uppercase text-[10px]">
                    Email
                  </th>
                  <th className="pb-3 text-left font-bold uppercase text-[10px]">
                    Role
                  </th>
                  <th className="pb-3 text-right font-bold uppercase text-[10px]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentUsers.map((u) => (
                  <tr key={u.id} className="group">
                    <td className="py-3 font-medium text-foreground/80">
                      {u.name || "—"}
                    </td>
                    <td className="py-3 text-foreground/50 text-xs">
                      {u.email}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${ROLE_COLORS[u.role] || "bg-foreground/10 text-foreground/60"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-foreground/40">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-sm mb-5">User Role Breakdown</h2>
          <div className="space-y-3">
            {stats.roleBreakdown
              .sort((a, b) => b.count - a.count)
              .map((r) => {
                const pct =
                  stats.totalUsers > 0
                    ? Math.round((r.count / stats.totalUsers) * 100)
                    : 0;
                return (
                  <div key={r.role}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span
                        className={`capitalize font-bold px-2 py-0.5 rounded ${ROLE_COLORS[r.role] || "text-foreground/60"}`}
                      >
                        {r.role}
                      </span>
                      <span className="text-foreground/50">
                        {r.count}{" "}
                        <span className="text-foreground/30">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
