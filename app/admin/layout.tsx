"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Ticket,
  Handshake,
  FileInput,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/contacts", icon: MessageSquare, label: "Messages" },
  { href: "/admin/tickets", icon: Ticket, label: "Tickets" },
  { href: "/admin/partners", icon: Handshake, label: "Partners" },
  { href: "/admin/applications", icon: FileInput, label: "Applications" },
  { href: "/admin/scan", icon: QrCode, label: "Scanner" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || (user && (user.role as string) !== "admin"))
    ) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || (user.role as string) !== "admin") {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="w-7 h-7 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  const currentSection = navItems.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen flex bg-[#f8f9fb] text-slate-900 overflow-hidden font-sans">
      {/* Slim Sidebar */}
      <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-5 shrink-0 z-20">
        {/* Logo mark */}
        <div className="mb-8">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-all ${isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto px-2 w-full">
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="w-full h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-400 font-medium">Admin</span>
            {currentSection && currentSection.href !== "/admin" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-700 font-semibold">
                  {currentSection.label}
                </span>
              </>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none text-slate-800">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Administrator
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-10 pt-8 bg-[#f8f9fb]">
          {children}
        </main>
      </div>
    </div>
  );
}
