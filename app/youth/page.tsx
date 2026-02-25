"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Calendar,
  Ticket,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  Zap,
  ShoppingCart,
  AlertCircle,
  Download,
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  type: string | null;
  price: number | null;
}

interface TicketOrder {
  id: string;
  ticketType: string;
  quantity: number;
  price: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: string;
  event: {
    title: string;
    date: string;
    location: string | null;
  } | null;
}

export default function YouthOverviewPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ])
      .then(([evData, tkData]) => {
        setEvents(Array.isArray(evData) ? evData : []);
        setTickets(Array.isArray(tkData) ? tkData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .slice(0, 3);

  const pendingTickets = tickets.filter((t) => t.status === "pending");
  const validatedTickets = tickets.filter((t) => t.status === "completed");
  const recentTickets = tickets.slice(0, 4);

  const STATUS_COLOR: Record<string, string> = {
    pending: "bg-amber-50  text-amber-600  border-amber-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    failed: "bg-red-50    text-red-500    border-red-200",
    cancelled: "bg-slate-100 text-slate-400  border-slate-200",
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: "En attente",
    completed: "Validé",
    failed: "Échoué",
    cancelled: "Annulé",
  };

  const firstInitial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1a2e25] text-white rounded-3xl p-8">
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-emerald-500/10 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-1">
              Bienvenue 👋
            </p>
            <h1 className="text-3xl font-black mb-2">
              {user?.name ?? "Utilisateur"}
            </h1>
            <p className="text-white/50 text-sm max-w-sm">
              Suivez vos événements, gérez vos billets et développez votre
              réseau depuis votre espace personnel.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/youth/events"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
            >
              <Calendar className="w-4 h-4" />
              Voir les événements
            </Link>
            <Link
              href="/youth/tickets"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Ticket className="w-4 h-4" />
              Mes billets
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Calendar,
            label: "Événements à venir",
            value: loading ? "…" : String(upcomingEvents.length),
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            icon: ShoppingCart,
            label: "Billets achetés",
            value: loading ? "…" : String(tickets.length),
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            icon: AlertCircle,
            label: "En attente de validation",
            value: loading ? "…" : String(pendingTickets.length),
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            icon: CheckCircle,
            label: "Billets validés",
            value: loading ? "…" : String(validatedTickets.length),
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-[#e2f0eb] shadow-sm"
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-[#1a2e25]">{s.value}</p>
            <p className="text-xs text-[#7aaa94] font-semibold mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-[#e2f0eb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f8f4]">
            <h2 className="font-black text-[#1a2e25] text-sm uppercase tracking-wider">
              Prochains événements
            </h2>
            <Link
              href="/youth/events"
              className="flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline"
            >
              Tous <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#f0f8f4]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-4 border-emerald-100 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-10 text-[#9dbfb0] text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Aucun événement à venir
              </div>
            ) : (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#f4fbf8] transition-colors"
                >
                  {/* Date pill */}
                  <div className="w-12 h-14 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl flex flex-col items-center justify-center shrink-0 text-[#1a2e25]">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase">
                      {new Date(ev.date).toLocaleDateString("fr-FR", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-xl font-black leading-none">
                      {new Date(ev.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1a2e25] truncate">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-[#9dbfb0] truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                      {ev.time && (
                        <span className="flex items-center gap-1 text-[11px] text-[#9dbfb0]">
                          <Clock className="w-3 h-3" />
                          {ev.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold text-emerald-600">
                      {ev.price != null
                        ? `${ev.price.toLocaleString("fr-FR")} Ar`
                        : "Gratuit"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {upcomingEvents.length > 0 && (
            <div className="px-6 py-4 border-t border-[#f0f8f4]">
              <Link
                href="/youth/events"
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Acheter des billets
              </Link>
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl border border-[#e2f0eb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f8f4]">
            <h2 className="font-black text-[#1a2e25] text-sm uppercase tracking-wider">
              Mes billets récents
            </h2>
            <Link
              href="/youth/tickets"
              className="flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline"
            >
              Tous <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#f0f8f4]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-4 border-emerald-100 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="text-center py-10 text-[#9dbfb0] text-sm">
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Vous n'avez pas encore de billets
                <div className="mt-3">
                  <Link
                    href="/youth/events"
                    className="text-emerald-600 font-bold text-xs hover:underline"
                  >
                    Parcourir les événements →
                  </Link>
                </div>
              </div>
            ) : (
              recentTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#f4fbf8] transition-colors"
                >
                  <div className="w-9 h-9 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-emerald-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1a2e25] truncate">
                      {t.event?.title ?? "Événement supprimé"}
                    </p>
                    <p className="text-[11px] text-[#9dbfb0] mt-0.5">
                      {t.quantity} billet{t.quantity > 1 ? "s" : ""} ·{" "}
                      {t.price.toLocaleString("fr-FR")} Ar
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_COLOR[t.status]}`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                    {t.status === "completed" && (
                      <Link
                        href="/youth/tickets"
                        className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        Télécharger
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e2f0eb] shadow-sm p-6">
        <h2 className="font-black text-[#1a2e25] text-sm uppercase tracking-wider mb-4">
          Accès rapide
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: "/youth/events",
              icon: Calendar,
              label: "Événements",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
            {
              href: "/youth/tickets",
              icon: Ticket,
              label: "Mes billets",
              color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            },
            {
              href: "/youth/profile",
              icon: Zap,
              label: "Mon profil",
              color: "bg-purple-50 text-purple-600 border-purple-100",
            },
            {
              href: "/youth/messages",
              icon: MapPin,
              label: "Messages",
              color: "bg-amber-50 text-amber-600 border-amber-100",
            },
          ].map((qa) => (
            <Link
              key={qa.href}
              href={qa.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${qa.color} hover:opacity-80 transition-opacity text-center`}
            >
              <qa.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{qa.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
