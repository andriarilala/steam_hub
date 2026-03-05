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
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

const TICKET_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "student", label: "Étudiant" },
  { value: "virtual", label: "Virtuel" },
] as const;

type TicketType = "standard" | "vip" | "student" | "virtual";

export default function YouthOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Purchase modal state
  const [buyModal, setBuyModal] = useState<EventItem | null>(null);
  const [ticketType, setTicketType] = useState<TicketType>("standard");
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ])
      .then(([evData, tkData]) => {
        setEvents(Array.isArray(evData) ? evData : []);
        setTickets(Array.isArray(tkData) ? tkData : []);
      })
      .finally(() => setLoading(false));
  };

  const openBuy = (ev: EventItem) => {
    setBuyModal(ev);
    setTicketType("standard");
    setQuantity(1);
    setReference("");
    setPurchaseError("");
    setSuccess(false);
  };

  const closeBuy = () => {
    if (purchasing) return;
    setBuyModal(null);
    setSuccess(false);
    if (success) loadData(); // Reload to show the new ticket
  };

  const handlePurchase = async () => {
    if (!buyModal) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: buyModal.id,
          ticketType,
          quantity,
          reference: reference.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error || "Erreur lors de l'achat");
      } else {
        setSuccess(true);
      }
    } catch {
      setPurchaseError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setPurchasing(false);
    }
  };

  const computedTotal =
    buyModal?.price != null ? buyModal.price * quantity : null;

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

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600">
                      {ev.price != null
                        ? `${ev.price.toLocaleString("fr-FR")} Ar`
                        : "3 000 Ar"}
                    </span>
                    <button
                      onClick={() => openBuy(ev)}
                      className="flex items-center gap-1.5 text-[10px] bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Acheter
                    </button>
                  </div>
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

      {/* ── Purchase Modal ────────────────────────────────────────────── */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            {success ? (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-slate-900" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Commande envoyee
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Votre demande de billet est en attente de validation. Vous
                  pouvez suivre son statut dans
                  <strong className="text-slate-700"> Mes billets</strong>.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={closeBuy}
                    className="px-5 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Fermer
                  </button>
                  <Link
                    href="/youth/tickets"
                    className="px-5 py-2.5 text-sm bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Mes billets
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Acheter un billet
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                      {buyModal.title}
                    </p>
                  </div>
                  <button
                    onClick={closeBuy}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Event summary card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(buyModal.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {buyModal.time && ` · ${buyModal.time}`}
                    </div>
                    {buyModal.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {buyModal.location}
                      </div>
                    )}
                  </div>

                  {/* Ticket type */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Type de billet
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TICKET_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTicketType(t.value)}
                          className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all text-left ${ticketType === t.value
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Quantité
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 text-lg transition-colors"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold text-slate-900 w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Référence de paiement{" "}
                      <span className="font-normal text-slate-300">
                        (optionnel)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ex: 1133223564476..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-slate-400 transition-colors text-slate-800 placeholder:text-slate-300"
                    />
                  </div>

                  {/* Price summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        {buyModal.price != null
                          ? `${buyModal.price.toLocaleString("fr-FR")} Ar x ${quantity}`
                          : `3 000 Ar x ${quantity}`}
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {computedTotal != null
                          ? `${computedTotal.toLocaleString("fr-FR")} Ar`
                          : `${(3000 * quantity).toLocaleString("fr-FR")} Ar`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      En attente de validation par l'administrateur
                    </p>
                  </div>

                  {purchaseError && (
                    <p className="text-sm text-red-500 font-semibold">
                      {purchaseError}
                    </p>
                  )}
                </div>

                <div className="px-6 pb-6 flex gap-3 justify-end">
                  <button
                    onClick={closeBuy}
                    className="px-5 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {purchasing ? "Traitement..." : "Confirmer l'achat"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
