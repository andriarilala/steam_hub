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

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-50 text-red-600 border border-red-200", // Red from 'A'
  youth: "bg-emerald-50 text-emerald-600 border border-emerald-200", // Teal from 'S'
  company: "bg-blue-50 text-blue-600 border border-blue-200", // Blue from 'E'
  institution: "bg-purple-50 text-purple-600 border border-purple-200", // Purple from 'M'
  mentor: "bg-orange-50 text-orange-600 border border-orange-200", // Orange from 'T'
  sponsor: "bg-primary/5 text-primary border border-primary/20", // Navy from 'HUB'
};

export default function AdminDashboard() {
  const { user } = useAuth();
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

  const cards = [
    {
      title: "Total Balance",
      value: `Ar ${stats.totalUsers * 12500}`, // Mock balance based on users
      icon: Users,
      trend: "+ 5% than last month",
      color: "bg-white text-[#ff5722] border-[#f0ece9] shadow-sm",
      action: "Transfer",
    },
    {
      title: "Total Earnings",
      value: `Ar ${stats.totalTicketOrders * 150}`,
      icon: Calendar,
      trend: "+ 7% this month",
      color: "bg-[#ff5722] text-white shadow-xl shadow-[#ff5722]/20",
    },
    {
      title: "Total Spending",
      value: `Ar ${stats.totalEvents * 120}`,
      icon: GitBranch,
      trend: "- 4% this month",
      color: "bg-white text-[#ff5722] border-[#f0ece9] shadow-sm",
    },
    {
      title: "Message Inbox",
      value: stats.totalContacts,
      icon: MessageSquare,
      trend: "12% new messages",
      color: "bg-white text-[#ff5722] border-[#f0ece9] shadow-sm",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-secondary">
          Good morning, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-foreground/40 mt-2 font-medium">
          Stay on top of your tasks, monitor progress, and track status.
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8">
        {cards.map((card, idx) => (
          <div
            key={card.title}
            className={`p-8 rounded-[32px] flex flex-col justify-between h-56 transition-all hover:scale-[1.02] ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 1 ? "text-white/60" : "text-foreground/30"}`}>
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${idx === 1 ? "bg-white/10" : "bg-slate-50"}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black tracking-tighter leading-none mb-2">
                {card.value}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${idx === 1 ? "text-white/60" : card.trend.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}>
                  {card.trend}
                </span>
              </div>
            </div>

            {idx === 0 && (
              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-[#2d2d2d] text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-2xl shadow-lg shadow-[#2d2d2d]/20">Transfer</button>
                <button className="flex-1 border border-[#f0ece9] text-foreground text-[10px] font-black uppercase tracking-wider py-3 rounded-2xl hover:bg-slate-50">Request</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid: Income / Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-xl tracking-tight">Recent Activities</h2>
              <div className="flex bg-slate-50 p-1 rounded-full border border-border/50">
                <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary">View All</button>
              </div>
            </div>

            <div className="space-y-2">
              {stats.recentUsers.map((u, i) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center font-black text-xs text-primary shadow-sm">
                      {u.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">{u.name || "Unnamed User"}</p>
                      <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-tighter font-bold">{u.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">Ar 0.00</p>
                    <p className="text-[10px] text-foreground/40 mt-1 uppercase font-bold">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="mb-8">
            <h2 className="font-black text-xl tracking-tight">Total Income</h2>
            <p className="text-xs text-foreground/30 font-medium mt-1">View your income in a certain period</p>
          </div>
          <div className="flex-1 flex items-end gap-2 h-40">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <div
                  className={`w-full rounded-t-lg transition-all ${i === 3 ? "bg-[#ff5722] shadow-lg shadow-[#ff5722]/20" : "bg-[#2d2d2d]"}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] font-bold text-foreground/30 uppercase mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-border flex justify-between items-center font-black uppercase text-[10px] tracking-widest text-foreground/40">
            <span>Profit and Loss</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2d2d2d]" />
                <span>Loss</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
