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
  ShoppingCart,
  AlertCircle,
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

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  completed: "bg-slate-100 text-slate-600 border border-slate-200",
  failed: "bg-red-50 text-red-500 border border-red-200",
  cancelled: "bg-slate-100 text-slate-400 border border-slate-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  completed: "Valide",
  failed: "Echoue",
  cancelled: "Annule",
};

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
    .slice(0, 4);

  const pendingTickets = tickets.filter((t) => t.status === "pending");
  const validatedTickets = tickets.filter((t) => t.status === "completed");
  const recentTickets = tickets.slice(0, 5);

  const statCards = [
    {
      icon: Calendar,
      label: "Evenements a venir",
      value: loading ? "—" : upcomingEvents.length,
    },
    {
      icon: Ticket,
      label: "Billets achetes",
      value: loading ? "—" : tickets.length,
    },
    {
      icon: AlertCircle,
      label: "En attente",
      value: loading ? "—" : pendingTickets.length,
    },
    {
      icon: CheckCircle,
      label: "Valides",
      value: loading ? "—" : validatedTickets.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {user?.name?.split(" ")[0] ?? "Utilisateur"}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Apercu de votre activite
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
              <card.icon className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {card.value}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events — 2/3 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Prochains evenements
            </h2>
            <Link
              href="/youth/events"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucun evenement a venir</p>
              </div>
            ) : (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  {/* Date box */}
                  <div className="w-10 h-11 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(ev.date).toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-base font-bold text-slate-800 leading-none">
                      {new Date(ev.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                      {ev.time && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {ev.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-600 shrink-0">
                    {ev.price != null
                      ? `${ev.price.toLocaleString("fr-FR")} Ar`
                      : "3 000 Ar"}
                  </span>
                </div>
              ))
            )}
          </div>

          {!loading && upcomingEvents.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100">
              <Link
                href="/youth/events"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Acheter des billets
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Recent Tickets */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Mes billets
              </h2>
              <Link
                href="/youth/tickets"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Tous <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="w-5 h-5 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="py-8 text-center">
                  <Ticket className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Aucun billet</p>
                  <Link
                    href="/youth/events"
                    className="text-xs text-slate-600 font-semibold hover:underline mt-1 inline-block"
                  >
                    Parcourir les evenements
                  </Link>
                </div>
              ) : (
                recentTickets.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Ticket className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {t.event?.title ?? "Evenement supprime"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t.quantity} billet{t.quantity > 1 ? "s" : ""} · {t.price.toLocaleString("fr-FR")} Ar
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${STATUS_COLOR[t.status]}`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
