"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Ticket,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  youth: "Youth",
  company: "Company",
  institution: "Institution",
  mentor: "Mentor",
  sponsor: "Sponsor",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
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

  const statCards = stats
    ? [
      {
        title: "Total Users",
        value: stats.totalUsers,
        icon: Users,
        href: "/admin/users",
        sub: "Registered accounts",
      },
      {
        title: "Events",
        value: stats.totalEvents,
        icon: Calendar,
        href: "/admin/events",
        sub: "Scheduled",
      },
      {
        title: "Ticket Orders",
        value: stats.totalTicketOrders,
        icon: Ticket,
        href: "/admin/tickets",
        sub: "All time",
      },
      {
        title: "Unread Messages",
        value: stats.unreadContacts,
        icon: MessageSquare,
        href: "/admin/contacts",
        sub: `${stats?.totalContacts ?? 0} total`,
      },
    ]
    : [];

  const quickLinks = [
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Create Event", href: "/admin/events", icon: Calendar },
    { label: "View Tickets", href: "/admin/tickets", icon: Ticket },
    { label: "Read Messages", href: "/admin/contacts", icon: MessageSquare },
    { label: "Partners", href: "/admin/partners", icon: TrendingUp },
    { label: "Applications", href: "/admin/applications", icon: ArrowRight },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Good morning, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Platform overview
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-[100px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-slate-700 underline">Try again</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <card.icon className="w-4 h-4 text-slate-600" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{card.value}</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{card.title}</p>
              <p className="text-[11px] text-slate-400">{card.sub}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Two-column body */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Registrations — 2/3 */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Recent Registrations</h2>
              <Link
                href="/admin/users"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.recentUsers.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No users yet.</div>
              ) : (
                stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-500">
                        {u.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.name ?? "Unnamed"}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 hidden sm:block">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Role Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Users by Role</h2>
              {stats.roleBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.roleBreakdown.map((r) => {
                    const pct = stats.totalUsers > 0
                      ? Math.round((r.count / stats.totalUsers) * 100)
                      : 0;
                    return (
                      <div key={r.role}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">{ROLE_LABELS[r.role] ?? r.role}</span>
                          <span className="text-xs font-semibold text-slate-700">{r.count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Access</h2>
              <div className="space-y-1">
                {quickLinks.map((ql) => (
                  <Link
                    key={ql.href}
                    href={ql.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors shrink-0">
                      <ql.icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                      {ql.label}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
