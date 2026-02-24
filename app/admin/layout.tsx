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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const sidebarIcons = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/contacts", icon: MessageSquare, label: "Messages" },
  { href: "/admin/tickets", icon: Ticket, label: "Tickets" },
  { href: "/admin/partners", icon: Handshake, label: "Partners" },
  { href: "/admin/applications", icon: FileInput, label: "Applications" },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fbf9f8] text-foreground overflow-hidden font-sans">
      {/* Slim Sidebar like Finexy */}
      <aside className="w-20 bg-white border-r border-[#f0ece9] flex flex-col items-center py-6 shrink-0 z-20">
        <div className="mb-10">
          <div className="w-10 h-10 bg-[#ff5722] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff5722]/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {sidebarIcons.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#2d2d2d] text-white shadow-xl shadow-[#2d2d2d]/20"
                    : "text-[#d1c9c4] hover:text-[#ff5722] hover:bg-[#fbf9f8]"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={() => signOut()}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-[#d1c9c4] hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Section */}
        <header className="h-20 flex items-center justify-between px-10 shrink-0 z-10">
          {/* Pill Navigation */}
          <div className="flex bg-white p-1 rounded-full border border-[#f0ece9]/50 shadow-sm overflow-hidden">
            {sidebarIcons.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#2d2d2d] text-white shadow-md shadow-[#2d2d2d]/10"
                      : "text-[#8e8581] hover:text-[#ff5722]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Header: Search & Profile */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[#d1c9c4]">
              <button className="p-2 hover:text-[#ff5722] transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 hover:text-[#ff5722] transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-[#f0ece9]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black leading-none">{user.name}</p>
                <p className="text-[10px] text-[#8e8581] mt-1 uppercase tracking-tight font-bold">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#fbf9f8] flex items-center justify-center overflow-hidden border border-[#f0ece9] shadow-sm">
                <div className="w-full h-full bg-[#ff5722] flex items-center justify-center text-white font-black text-sm">
                  {user.name?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-10 pb-10 bg-[#fbf9f8]">
          {children}
        </main>
      </div>
    </div>
  );
}
