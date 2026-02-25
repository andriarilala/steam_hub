"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  Ticket,
  Calendar,
  MapPin,
  Download,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Hash,
} from "lucide-react";

interface TicketEvent {
  id: string;
  title: string;
  date: string;
  location: string | null;
  type: string | null;
  price: number | null;
}

interface TicketOrder {
  id: string;
  userId: string;
  eventId: string | null;
  ticketType: string;
  quantity: number;
  price: number;
  total: number;
  reference: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  qrCode: string;
  createdAt: string;
  event: TicketEvent | null;
}

// ── Canvas helpers (same as admin tickets page) ───────────────────────────────

function buildQRUrl(ticket: TicketOrder): string {
  const data = [
    "PASS AVENIR",
    `Ticket: ${ticket.id.slice(0, 8).toUpperCase()}`,
    `Type: ${ticket.ticketType.toUpperCase()}`,
    ticket.event ? `Event: ${ticket.event.title}` : "No event",
    ticket.event
      ? `Date: ${new Date(ticket.event.date).toLocaleDateString()}`
      : "",
    `Code: ${ticket.qrCode}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(data)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let yPos = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, yPos);
      line = word + " ";
      yPos += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yPos);
  return yPos;
}

async function downloadTicketImage(ticket: TicketOrder): Promise<void> {
  const W = 920;
  const H = 460;
  const DIVIDER_X = 590;
  const PAD = 36;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#094945";
  ctx.fillRect(0, 0, W, H);

  const HEADER_H = 74;
  ctx.fillStyle = "#0b5a54";
  ctx.fillRect(0, 0, W, HEADER_H);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("PASS AVENIR", PAD, 46);

  const typeColors: Record<string, string> = {
    standard: "#3b82f6",
    vip: "#a855f7",
    student: "#22d3ee",
    virtual: "#06b6d4",
  };
  const badgeColor = typeColors[ticket.ticketType] ?? "#6b7280";
  const typeLabel = ticket.ticketType.toUpperCase();
  ctx.font = "bold 11px sans-serif";
  const badgeW = ctx.measureText(typeLabel).width + 26;
  const badgeX = W - PAD - badgeW;
  ctx.fillStyle = badgeColor;
  roundRect(ctx, badgeX, 26, badgeW, 24, 7);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText(typeLabel, W - PAD - 13, 42);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`#${ticket.id.slice(0, 8).toUpperCase()}`, badgeX - 12, 42);

  const hDash = (y: number, x0 = PAD, x1 = W - PAD) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.restore();
  };
  hDash(HEADER_H + 1);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(DIVIDER_X, HEADER_H + 14);
  ctx.lineTo(DIVIDER_X, H - 60);
  ctx.stroke();
  ctx.restore();

  const LEFT_W = DIVIDER_X - PAD * 2;
  let y = HEADER_H + 26;

  const label = (text: string) => {
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text, PAD, y);
    y += 16;
  };

  const value = (text: string, fontSize = 16, alpha = 1, bold = true) => {
    ctx.fillStyle = alpha < 1 ? `rgba(255,255,255,${alpha})` : "#ffffff";
    ctx.font = `${bold ? "bold " : ""}${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    return wrapText(ctx, text, PAD, y, LEFT_W, fontSize + 5);
  };

  label("ÉVÉNEMENT");
  const lastTitleY = value(ticket.event?.title ?? "—", 19);
  y = lastTitleY + 22;

  if (ticket.event) {
    const d = new Date(ticket.event.date);
    const dateStr = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    label("DATE");
    value(dateStr, 13);
    y += 22;
  }

  hDash(y, PAD, DIVIDER_X - 20);
  y += 14;

  label("TYPE");
  value(ticket.ticketType.toUpperCase(), 13);
  y += 22;

  label("QUANTITÉ");
  value(String(ticket.quantity), 13);
  y += 22;

  label("TOTAL");
  value(
    ticket.price != null ? `${ticket.price.toLocaleString("fr-FR")} FCFA` : "—",
    13,
  );
  y += 22;

  const FOOTER_Y = H - 52;
  const rightCenterX = DIVIDER_X + (W - DIVIDER_X) / 2;
  const qrSize = 190;
  const qrX = rightCenterX - qrSize / 2;
  const rightZoneTop = HEADER_H + 14;
  const rightZoneBot = H - 60;
  const qrTop = rightZoneTop + (rightZoneBot - rightZoneTop - qrSize) / 2;

  try {
    const qrImg = await loadImage(buildQRUrl(ticket));
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - 10, qrTop - 10, qrSize + 20, qrSize + 20, 12);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrTop, qrSize, qrSize);
  } catch {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, qrX - 10, qrTop - 10, qrSize + 20, qrSize + 20, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("QR Code unavailable", rightCenterX, qrTop + qrSize / 2);
  }

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  ctx.fillText(ticket.qrCode, rightCenterX, H - 38);

  hDash(FOOTER_Y, DIVIDER_X + 20, W - PAD);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCAN QR CODE", rightCenterX, FOOTER_Y + 14);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "10px sans-serif";
  ctx.fillText("pour valider l'accès", rightCenterX, FOOTER_Y + 28);

  const link = document.createElement("a");
  link.download = `ticket-${ticket.id.slice(0, 8)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: AlertCircle,
  },
  completed: {
    label: "Validé",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: CheckCircle,
  },
  failed: {
    label: "Échoué",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  cancelled: {
    label: "Annulé",
    color: "bg-slate-100 text-slate-500 border-slate-200",
    icon: XCircle,
  },
};

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  vip: "VIP",
  student: "Étudiant",
  virtual: "Virtuel",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const user = (session?.user as any) ?? null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((d) => {
        setTickets(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status, load]);

  const handleDownload = async (ticket: TicketOrder) => {
    setDownloading(ticket.id);
    try {
      await downloadTicketImage(ticket);
    } catch {
      showToast("Erreur lors du téléchargement du billet.");
    } finally {
      setDownloading(null);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Mes billets
              </h1>
              <p className="text-foreground/50 text-sm">
                Suivez vos achats de billets et téléchargez-les une fois
                validés.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={load}
                className="flex items-center gap-2 text-xs bg-card border border-border px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Actualiser
              </button>
              <a
                href="/events"
                className="flex items-center gap-2 text-xs bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Ticket className="w-3.5 h-3.5" /> Voir les événements
              </a>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
              <p className="text-foreground/40 text-base font-medium">
                Vous n'avez pas encore de billets
              </p>
              <a
                href="/events"
                className="inline-block mt-4 text-sm text-primary font-bold hover:underline"
              >
                Parcourir les événements →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const cfg =
                  STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const isValidated = ticket.status === "completed";

                return (
                  <div
                    key={ticket.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Left info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${cfg.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-bold border border-primary/20">
                            {TYPE_LABELS[ticket.ticketType] ??
                              ticket.ticketType}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-foreground">
                          {ticket.event?.title ?? "Événement supprimé"}
                        </h3>

                        <div className="space-y-1">
                          {ticket.event && (
                            <>
                              <div className="flex items-center gap-2 text-xs text-foreground/60">
                                <Calendar className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                                {new Date(ticket.event.date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                              {ticket.event.location && (
                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                  <MapPin className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                                  {ticket.event.location}
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center gap-4 text-xs text-foreground/60 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-primary/50" />
                              {ticket.quantity} billet
                              {ticket.quantity > 1 ? "s" : ""}
                            </span>
                            <span className="font-semibold text-primary">
                              {ticket.price != null
                                ? `${ticket.price.toLocaleString("fr-FR")} FCFA`
                                : "Gratuit"}
                            </span>
                            <span className="flex items-center gap-1 text-foreground/40">
                              <Clock className="w-3 h-3" />
                              {new Date(ticket.createdAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          </div>

                          {ticket.reference && (
                            <div className="flex items-center gap-2 text-xs text-foreground/50">
                              <Hash className="w-3.5 h-3.5 shrink-0" />
                              Réf : {ticket.reference}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isValidated ? (
                          <button
                            onClick={() => handleDownload(ticket)}
                            disabled={downloading === ticket.id}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {downloading === ticket.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            {downloading === ticket.id
                              ? "Génération…"
                              : "Télécharger"}
                          </button>
                        ) : ticket.status === "pending" ? (
                          <div className="text-xs text-amber-600 font-medium text-right max-w-40">
                            En attente de validation par l'administrateur
                          </div>
                        ) : (
                          <div className="text-xs text-foreground/40 text-right max-w-40">
                            Ce billet n'est pas disponible au téléchargement
                          </div>
                        )}

                        <span className="text-[10px] text-foreground/30 font-mono">
                          #{ticket.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Bottom validation hint */}
                    {ticket.status === "pending" && (
                      <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100 text-xs text-amber-700">
                        <AlertCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                        Votre billet sera disponible au téléchargement après
                        validation de l'administrateur.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
