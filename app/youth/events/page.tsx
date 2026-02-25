"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Phone,
  Ticket,
  Clock,
  Tag,
  X,
  Loader2,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: string | null;
  price: number | null;
  phone_number: string | null;
}

const TICKET_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "student", label: "Étudiant" },
  { value: "virtual", label: "Virtuel" },
] as const;

type TicketType = "standard" | "vip" | "student" | "virtual";

const TYPE_COLORS: Record<string, string> = {
  Keynote: "bg-purple-50 text-purple-600 border-purple-200",
  Workshop: "bg-blue-50   text-blue-600   border-blue-200",
  Networking: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Panel: "bg-amber-50  text-amber-600  border-amber-200",
  Showcase: "bg-cyan-50   text-cyan-600   border-cyan-200",
  Ceremony: "bg-rose-50   text-rose-600   border-rose-200",
  Other: "bg-slate-50  text-slate-600  border-slate-200",
};

export default function YouthEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [buyModal, setBuyModal] = useState<EventItem | null>(null);
  const [ticketType, setTicketType] = useState<TicketType>("standard");
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openBuy = (ev: EventItem) => {
    setBuyModal(ev);
    setTicketType("standard");
    setQuantity(1);
    setReference("");
    setPurchaseError("");
    setSuccess(false);
  };

  const closeBuy = () => {
    if (!purchasing) {
      setBuyModal(null);
      setSuccess(false);
    }
  };

  const computedTotal =
    buyModal?.price != null ? buyModal.price * quantity : null;

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
      if (!res.ok) setPurchaseError(data.error || "Erreur lors de l'achat");
      else setSuccess(true);
    } catch {
      setPurchaseError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Evenements
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Parcourez les evenements et achetez vos billets.
          </p>
        </div>
        <Link
          href="/youth/tickets"
          className="flex items-center gap-2 text-sm bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
        >
          <Ticket className="w-4 h-4" />
          Mes billets
        </Link>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">
            Aucun evenement disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((ev) => {
            const isPast = new Date(ev.date) < new Date();
            return (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-sm transition-shadow"
              >
                <div className="p-5 flex flex-col flex-1 gap-3">
                  {/* badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ev.type && (
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border ${TYPE_COLORS[ev.type] ?? TYPE_COLORS["Other"]}`}
                      >
                        {ev.type}
                      </span>
                    )}
                    {isPast && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded border bg-slate-50 text-slate-400 border-slate-200">
                        Passé
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm font-bold text-slate-900 leading-snug">
                    {ev.title}
                  </h2>

                  {ev.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  {/* meta */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {new Date(ev.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {ev.time && (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1" />
                          {ev.time}
                        </>
                      )}
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {ev.location}
                      </div>
                    )}
                    {ev.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {ev.phone_number}
                      </div>
                    )}
                  </div>

                  {/* footer: price + buy */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                      <Tag className="w-3.5 h-3.5" />
                      {ev.price != null
                        ? `${ev.price.toLocaleString("fr-FR")} Ar`
                        : "3 000 Ar"}
                    </div>
                    {!isPast && (
                      <button
                        onClick={() => openBuy(ev)}
                        className="flex items-center gap-1.5 text-xs bg-slate-900 text-white font-semibold px-3.5 py-2 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Acheter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Purchase Modal ────────────────────────────────────────────── */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            {success ? (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-slate-500" />
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
                    {buyModal.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {buyModal.phone_number}
                      </div>
                    )}
                  </div>

                  {/* Ticket type */}
                  <div>
                    <label className="block text-[10px] font-black text-[#9dbfb0] mb-2 uppercase tracking-wider">
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
                    <label className="block text-[10px] font-black text-[#9dbfb0] mb-2 uppercase tracking-wider">
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
                    <label className="block text-[10px] font-black text-[#9dbfb0] mb-2 uppercase tracking-wider">
                      Référence de paiement{" "}
                      <span className="font-normal text-[#c5e0d5]">
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
                          : "3 000 Ar"}
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {computedTotal != null
                          ? `${computedTotal.toLocaleString("fr-FR")} Ar`
                          : "3 000 Ar"}
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
                    className="px-5 py-2.5 text-sm border border-[#e2f0eb] rounded-xl hover:bg-[#f4fbf8] transition-colors font-semibold text-[#7aaa94]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {purchasing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
