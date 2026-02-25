"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
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
import Link from "next/link";

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

// ── Canvas helpers ────────────────────────────────────────────────────────────

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

async function downloadTicketImage(ticket: TicketOrder, user: any): Promise<void> {
  const W = 1000,
    H = 500,
    PAD = 50;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0082a3"; // Exact teal from image
  ctx.fillRect(0, 0, W, H);

  // ── Header ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("PASS AVENIR", PAD, 75);

  // Top Right Info
  const ticketId = `#${ticket.id.slice(0, 8).toUpperCase()}`;
  const statusLabel = (ticket.ticketType || "STUDENT").toUpperCase();

  // Badge
  ctx.fillStyle = "#9ce4f2"; // Light cyan bg
  const badgeW = 120;
  const badgeH = 38;
  roundRect(ctx, W - PAD - badgeW, 45, badgeW, badgeH, 10);
  ctx.fill();

  ctx.fillStyle = "#0082a3"; // Teal text for badge
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(statusLabel, W - PAD - badgeW / 2, 70);

  // Ticket ID next to badge
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(ticketId, W - PAD - badgeW - 15, 68);

  // ── Dividers ───────────────────────────────────────────────────────────────
  const drawDashedLine = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.setLineDash([5, 8]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  drawDashedLine(PAD, 130, W - PAD, 130); // Top divider

  // ── Left Side Content ──────────────────────────────────────────────────────
  let y = 175;
  const label = (text: string) => {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), PAD, y);
    y += 24;
  };
  const val = (text: string, size = 28, bold = true) => {
    ctx.fillStyle = "#ffffff";
    ctx.font = `${bold ? "bold " : ""} ${size}px sans-serif`;
    ctx.textAlign = "left";
    const lastY = wrapText(ctx, text, PAD, y, W * 0.58, size + 8);
    y = lastY + 42;
  };

  label("ÉVÉNEMENT");
  val(ticket.event?.title ?? "Opening Keynote: Africa's Digital Future", 22);

  label("DATE & HEURE");
  const eventDate = ticket.event ? new Date(ticket.event.date) : new Date();
  const dateStr = eventDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  val(dateStr, 17, true);
  y -= 18; // Tighter spacing for time
  val("18:00", 17, false);

  label("TITULAIRE");
  val(user?.name ?? "Aina User", 17, true);

  // ── Logo Section (Bottom Left) ─────────────────────────────────────────────
  const logoX = PAD;
  const logoY = H - 100;

  const drawSophisticatedLogo = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Nodes colors from image
    const colors = ["#fdb813", "#4db848", "#00aeef", "#ec008c", "#8dc63f", "#1e96d4"];

    // Central node
    ctx.fillStyle = "#f26422";
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();

    // Connecting lines and outer nodes
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const lineLen = i % 2 === 0 ? 45 : 32;
      const nx = Math.cos(angle) * lineLen;
      const ny = Math.sin(angle) * lineLen;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  drawSophisticatedLogo(logoX + 45, logoY + 15);

  ctx.textAlign = "left";
  ctx.font = "900 64px sans-serif";
  ctx.fillStyle = "#0c332e"; // Dark forest green STEAM
  ctx.fillText("STEAM", logoX + 120, logoY + 40);
  ctx.fillStyle = "#f5a623"; // Orange HUB
  ctx.fillText("HUB", logoX + 375, logoY + 40);

  // ── Right SideContent (QR Section) ─────────────────────────────────────────
  const contentDividerX = W * 0.64;
  drawDashedLine(contentDividerX, 150, contentDividerX, H - 120);

  const qrBoxSize = 280;
  const qrBoxX = contentDividerX + (W - contentDividerX - qrBoxSize) / 2;
  const qrBoxY = 160;

  // QR Light Box
  ctx.fillStyle = "#9ce4f2";
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.fill();

  const qrSize = 230;
  const qrX = qrBoxX + (qrBoxSize - qrSize) / 2;
  const qrY = qrBoxY + (qrBoxSize - qrSize) / 2;

  try {
    const qrImg = await loadImage(buildQRUrl(ticket));
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
  }

  // Footer Instructions
  const centerOfQRSection = contentDividerX + (W - contentDividerX) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  // SCAN QR CODE
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("SCAN QR CODE", centerOfQRSection, qrBoxY + qrBoxSize + 45);

  // Subtext
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "13px sans-serif";
  ctx.fillText("pour valider l'accès", centerOfQRSection, qrBoxY + qrBoxSize + 65);

  // Tiny ID at the bottom right
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  ctx.fillText(ticket.qrCode.slice(0, 16).toUpperCase(), W - PAD, H - 30);

  const link = document.createElement("a");
  link.download = `ticket-${ticket.id.slice(0, 8)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

export default function YouthTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

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
    if (!authLoading) load();
  }, [authLoading, load]);

  const handleDownload = async (ticket: TicketOrder) => {
    setDownloading(ticket.id);
    try {
      await downloadTicketImage(ticket, user);
    } catch {
      showToast("Erreur lors du téléchargement.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 text-slate-800 text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mes billets</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Suivez vos achats et telechargez vos billets valides.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm border border-slate-200 bg-white px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
          <Link
            href="/youth/events"
            className="flex items-center gap-1.5 text-sm bg-slate-900 text-white font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" /> Voir les evenements
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm mb-2">
            Aucun billet pour le moment
          </p>
          <Link
            href="/youth/events"
            className="text-sm text-slate-700 font-semibold hover:underline"
          >
            Parcourir les evenements
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const isValidated = ticket.status === "completed";

            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold border border-slate-200">
                        {TYPE_LABELS[ticket.ticketType] ?? ticket.ticketType}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">
                      {ticket.event?.title ?? "Evenement supprime"}
                    </h3>

                    <div className="space-y-1">
                      {ticket.event && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {ticket.event.location}
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {ticket.quantity} billet
                          {ticket.quantity > 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {ticket.price != null
                            ? `${ticket.price.toLocaleString("fr-FR")} Ar`
                            : "3 000 Ar"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                      {ticket.reference && (
                        <div className="flex items-center gap-2 text-xs text-[#b0cfc5]">
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
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {downloading === ticket.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloading === ticket.id
                          ? "Generation..."
                          : "Telecharger"}
                      </button>
                    ) : ticket.status === "pending" ? (
                      <div className="text-xs text-slate-500 font-medium text-right max-w-40">
                        En attente de validation
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-right max-w-40">
                        Billet non disponible
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{ticket.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Bottom hint for pending */}
                {ticket.status === "pending" && (
                  <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
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
  );
}
