"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  User,
  MessageSquare,
  LogOut,
  Zap,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/youth", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/youth/events", icon: Calendar, label: "Événements" },
  { href: "/youth/tickets", icon: Ticket, label: "Mes billets" },
  { href: "/youth/profile", icon: User, label: "Profil" },
  { href: "/youth/messages", icon: MessageSquare, label: "Messages" },
];

export default function YouthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== "youth"))) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== "youth") {
    return (
      <div className="min-h-screen bg-[#f4fbf8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4fbf8] text-foreground overflow-hidden font-sans">
      {/* ── Slim Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-20 bg-white border-r border-[#e2f0eb] flex flex-col items-center py-6 shrink-0 z-20 shadow-sm">
        {/* Logo mark */}
        <div className="mb-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/youth"
                ? pathname === "/youth"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#1a2e25] text-white shadow-xl shadow-[#1a2e25]/20"
                    : "text-[#9dbfb0] hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1a2e25] text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer icons */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            title="Notifications"
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#9dbfb0] hover:text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => signOut()}
            title="Déconnexion"
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#9dbfb0] hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ── Main Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2f0eb] flex items-center justify-between px-8 shrink-0 shadow-sm">
          {/* Pill tab nav */}
          <div className="flex bg-[#f4fbf8] p-1 rounded-full border border-[#e2f0eb] gap-0.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/youth"
                  ? pathname === "/youth"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#1a2e25] text-white shadow-md"
                      : "text-[#7aaa94] hover:text-emerald-700"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 pl-6 border-l border-[#e2f0eb] shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black leading-none text-[#1a2e25]">
                {user.name}
              </p>
              <p className="text-[10px] text-[#7aaa94] mt-0.5 uppercase tracking-tight font-bold">
                Jeune / Youth
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/30">
              {user.name?.charAt(0)?.toUpperCase() ?? "Y"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f4fbf8] px-8 pb-10 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
