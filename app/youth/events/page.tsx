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
          <h1 className="text-2xl font-black text-[#1a2e25]">
            Événements disponibles
          </h1>
          <p className="text-sm text-[#7aaa94] mt-0.5">
            Parcourez les événements et achetez vos billets en ligne.
          </p>
        </div>
        <Link
          href="/youth/tickets"
          className="flex items-center gap-2 text-sm bg-[#1a2e25] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#2a4035] transition-colors shadow-sm"
        >
          <Ticket className="w-4 h-4" />
          Mes billets
        </Link>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[#e2f0eb]">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-[#c5e0d5]" />
          <p className="text-[#9dbfb0] text-base">
            Aucun événement disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((ev) => {
            const isPast = new Date(ev.date) < new Date();
            return (
              <div
                key={ev.id}
                className="bg-white border border-[#e2f0eb] rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* top color band */}
                <div
                  className={`h-1.5 w-full ${isPast ? "bg-slate-300" : "bg-emerald-500"}`}
                />

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

                  <h2 className="text-base font-bold text-[#1a2e25] leading-snug">
                    {ev.title}
                  </h2>

                  {ev.description && (
                    <p className="text-xs text-[#7aaa94] line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  {/* meta */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-[#9dbfb0]">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {new Date(ev.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {ev.time && (
                        <>
                          <Clock className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                          {ev.time}
                        </>
                      )}
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-2 text-xs text-[#9dbfb0]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {ev.location}
                      </div>
                    )}
                    {ev.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-[#9dbfb0]">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {ev.phone_number}
                      </div>
                    )}
                  </div>

                  {/* footer: price + buy */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0f8f4] mt-1">
                    <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                      <Tag className="w-3.5 h-3.5" />
                      {ev.price != null
                        ? `${ev.price.toLocaleString("fr-FR")} Ar`
                        : "Gratuit"}
                    </div>
                    {!isPast && (
                      <button
                        onClick={() => openBuy(ev)}
                        className="flex items-center gap-1.5 text-xs bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
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
          <div className="bg-white border border-[#e2f0eb] rounded-2xl w-full max-w-md shadow-2xl">
            {success ? (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-[#1a2e25]">
                  Commande envoyée !
                </h2>
                <p className="text-[#9dbfb0] text-sm leading-relaxed">
                  Votre demande de billet est en attente de validation par
                  l'administrateur. Vous pouvez suivre son statut dans l'onglet{" "}
                  <strong>"Mes billets"</strong>.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={closeBuy}
                    className="px-5 py-2.5 text-sm border border-[#e2f0eb] rounded-xl hover:bg-[#f4fbf8] transition-colors font-semibold"
                  >
                    Fermer
                  </button>
                  <Link
                    href="/youth/tickets"
                    className="px-5 py-2.5 text-sm bg-[#1a2e25] text-white font-bold rounded-xl hover:bg-[#2a4035] transition-colors"
                  >
                    Mes billets →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-[#f0f8f4]">
                  <div>
                    <h2 className="font-black text-[#1a2e25]">
                      Acheter un billet
                    </h2>
                    <p className="text-xs text-[#9dbfb0] mt-0.5 truncate max-w-65">
                      {buyModal.title}
                    </p>
                  </div>
                  <button
                    onClick={closeBuy}
                    className="text-[#9dbfb0] hover:text-[#1a2e25] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Event summary card */}
                  <div className="bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#7aaa94]">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date(buyModal.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {buyModal.time && ` • ${buyModal.time}`}
                    </div>
                    {buyModal.location && (
                      <div className="flex items-center gap-2 text-xs text-[#7aaa94]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {buyModal.location}
                      </div>
                    )}
                    {buyModal.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-[#7aaa94]">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
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
                          className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all text-left ${
                            ticketType === t.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-[#e2f0eb] text-[#7aaa94] hover:border-emerald-300 hover:bg-[#f4fbf8]"
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
                        className="w-10 h-10 rounded-xl border border-[#e2f0eb] hover:bg-[#f4fbf8] font-black text-[#1a2e25] text-lg transition-colors"
                      >
                        −
                      </button>
                      <span className="text-xl font-black text-[#1a2e25] w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-10 h-10 rounded-xl border border-[#e2f0eb] hover:bg-[#f4fbf8] font-black text-[#1a2e25] text-lg transition-colors"
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
                      className="w-full bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-[#1a2e25] placeholder:text-[#c5e0d5]"
                    />
                  </div>

                  {/* Price summary */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#7aaa94]">
                        {buyModal.price != null
                          ? `${buyModal.price.toLocaleString("fr-FR")} Ar × ${quantity}`
                          : "Gratuit"}
                      </span>
                      <span className="font-black text-emerald-700 text-lg">
                        {computedTotal != null
                          ? `${computedTotal.toLocaleString("fr-FR")} Ar`
                          : "Gratuit"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9dbfb0] mt-1.5">
                      ⏳ En attente de validation par l'administrateur
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
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {purchasing ? "Traitement…" : "Confirmer l'achat"}
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
