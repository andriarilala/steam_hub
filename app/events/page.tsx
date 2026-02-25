"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
import { useRouter } from "next/navigation";

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

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Purchase modal state
  const [buyModal, setBuyModal] = useState<EventItem | null>(null);
  const [ticketType, setTicketType] = useState<TicketType>("standard");
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const user = (session?.user as any) ?? null;
  const isYouth = user?.role === "youth";

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
    if (!session) {
      router.push("/signin");
      return;
    }
    if (!isYouth) return;
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

  const TYPE_COLORS: Record<string, string> = {
    Keynote: "bg-purple-50 text-purple-600 border-purple-200",
    Workshop: "bg-blue-50 text-blue-600 border-blue-200",
    Networking: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Panel: "bg-amber-50 text-amber-600 border-amber-200",
    Showcase: "bg-cyan-50 text-cyan-600 border-cyan-200",
    Ceremony: "bg-rose-50 text-rose-600 border-rose-200",
    Other: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Événements disponibles
            </h1>
            <p className="text-foreground/60 text-lg">
              Parcourez les événements et achetez vos billets en ligne.
            </p>
            {isYouth && (
              <a
                href="/my-tickets"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary font-semibold hover:underline"
              >
                <Ticket className="w-4 h-4" /> Voir mes billets →
              </a>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24 text-foreground/30">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                Aucun événement disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => {
                const isPast = new Date(ev.date) < new Date();
                return (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                  >
                    {/* Color band */}
                    <div className="h-1.5 bg-primary w-full" />

                    <div className="p-6 flex flex-col flex-1 gap-3">
                      {/* Type badge */}
                      <div className="flex items-center gap-2">
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

                      <h2 className="text-lg font-bold text-foreground leading-tight">
                        {ev.title}
                      </h2>

                      {ev.description && (
                        <p className="text-sm text-foreground/60 line-clamp-2">
                          {ev.description}
                        </p>
                      )}

                      <div className="space-y-1.5 mt-1">
                        <div className="flex items-center gap-2 text-xs text-foreground/60">
                          <Calendar className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                          {new Date(ev.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {ev.time && (
                            <>
                              <Clock className="w-3.5 h-3.5 text-primary/50 ml-1" />
                              {ev.time}
                            </>
                          )}
                        </div>

                        {ev.location && (
                          <div className="flex items-center gap-2 text-xs text-foreground/60">
                            <MapPin className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                            {ev.location}
                          </div>
                        )}

                        {ev.phone_number && (
                          <div className="flex items-center gap-2 text-xs text-foreground/60">
                            <Phone className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                            {ev.phone_number}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Tag className="w-4 h-4" />
                          {ev.price != null
                            ? `${ev.price.toLocaleString("fr-FR")} FCFA`
                            : "Gratuit"}
                        </div>

                        {isYouth && !isPast && (
                          <button
                            onClick={() => openBuy(ev)}
                            className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Acheter
                          </button>
                        )}

                        {!session && !isPast && (
                          <button
                            onClick={() => router.push("/signin")}
                            className="flex items-center gap-1.5 text-sm border border-primary text-primary font-bold px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
                          >
                            <Ticket className="w-4 h-4" />
                            Se connecter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Purchase modal */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            {success ? (
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-500" />
                <h2 className="text-xl font-bold">Commande envoyée !</h2>
                <p className="text-foreground/60 text-sm">
                  Votre demande de billet est en attente de validation par
                  l'administrateur. Vous recevrez une notification dès que votre
                  achat sera validé.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={closeBuy}
                    className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-foreground/5 transition-colors"
                  >
                    Fermer
                  </button>
                  <a
                    href="/my-tickets"
                    className="px-5 py-2.5 text-sm bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Mes billets →
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="font-bold text-base">Acheter un billet</h2>
                    <p className="text-xs text-foreground/50 mt-0.5 max-w-70 truncate">
                      {buyModal.title}
                    </p>
                  </div>
                  <button
                    onClick={closeBuy}
                    className="text-foreground/30 hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Event summary */}
                  <div className="bg-background rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <Calendar className="w-3.5 h-3.5 text-primary/50" />
                      {new Date(buyModal.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {buyModal.time && ` • ${buyModal.time}`}
                    </div>
                    {buyModal.location && (
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <MapPin className="w-3.5 h-3.5 text-primary/50" />
                        {buyModal.location}
                      </div>
                    )}
                    {buyModal.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <Phone className="w-3.5 h-3.5 text-primary/50" />
                        {buyModal.phone_number}
                      </div>
                    )}
                  </div>

                  {/* Ticket type */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                      Type de billet
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TICKET_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTicketType(t.value)}
                          className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-colors text-left ${
                            ticketType === t.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-foreground/5"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                      Quantité
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-xl border border-border hover:bg-foreground/5 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-9 h-9 rounded-xl border border-border hover:bg-foreground/5 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                      Référence de paiement{" "}
                      <span className="font-normal text-foreground/30">
                        (optionnel)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ex: 1133223564476..."
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Price summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/60">
                        {buyModal.price != null
                          ? `${buyModal.price.toLocaleString("fr-FR")} FCFA × ${quantity}`
                          : "Gratuit"}
                      </span>
                      <span className="font-bold text-primary text-base">
                        {computedTotal != null
                          ? `${computedTotal.toLocaleString("fr-FR")} FCFA`
                          : "Gratuit"}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/40 mt-1">
                      En attente de validation par l'administrateur
                    </p>
                  </div>

                  {purchaseError && (
                    <p className="text-sm text-red-500 font-medium">
                      {purchaseError}
                    </p>
                  )}
                </div>

                <div className="px-6 pb-6 flex gap-3 justify-end">
                  <button
                    onClick={closeBuy}
                    className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-foreground/5 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
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

      <Footer />
    </main>
  );
}
