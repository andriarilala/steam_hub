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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
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
      <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center dark">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-base tracking-tight">
              Admin Panel
            </span>
          </div>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-widest">
            PASS AVENIR
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-foreground/40 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground transition-colors py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center px-8 bg-background/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>/</span>
            {sidebarLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              if (!isActive) return null;
              return (
                <span
                  key={link.href}
                  className="text-foreground/80 font-medium"
                >
                  {link.label}
                </span>
              );
            })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
