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
  X,
  Eye,
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
  ticketNumber: string | null; // "PA 00001"
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

function buildQRUrl(ticket: TicketOrder, user: any): string {
  const data = [
    "PASS AVENIR — BILLET OFFICIEL",
    `N°: ${ticket.ticketNumber || ticket.id.slice(0, 8).toUpperCase()}`,
    `Titulaire: ${user?.name || "Aina User"}`,
    ticket.event ? `Événement: ${ticket.event.title}` : "Aucun événement",
    ticket.event
      ? `Date: ${new Date(ticket.event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
      : "",
    ticket.event?.location ? `Lieu: ${ticket.event.location}` : "Lieu: Antananarivo",
    `Type: ${ticket.ticketType.toUpperCase()}`,
    `Émis le: ${new Date(ticket.createdAt).toLocaleDateString("fr-FR")}`,
    `ID: ${ticket.id}`,
    `CODE: ${ticket.qrCode}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(data)}`;
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

async function generateTicketImageBase64(ticket: TicketOrder, user: any): Promise<string> {
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

  // ── Header: "Pass Avenir" Wordmark ──────────────────────────────────────────
  // "Pass" — white, light weight, with shadow for readability
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.textAlign = "left";
  ctx.font = "300 32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillText("Pass", PAD, 78);
  // "Avenir" — bold cyan
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#9ce4f2";
  const passW = ctx.measureText("Pass ").width;
  ctx.fillText("Avenir", PAD + passW - 2, 78);
  ctx.restore();
  // Subtle tagline
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.letterSpacing = "2px";
  ctx.fillText("VOTRE PASS NUMÉRIQUE", PAD, 92);
  ctx.letterSpacing = "0px";

  // Top Right Info
  const ticketIdString = ticket.ticketNumber || `#${ticket.id.slice(0, 8).toUpperCase()}`;
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

  // Ticket number — clearly visible to the left of the badge
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "right";
  ctx.fillText(ticketIdString, W - PAD - badgeW - 16, 69);

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

  // ── Bottom Logos Section ───────────────────────────────────────────────────
  const logoAreaY = H - 100;

  // Left: STEAM HUB sophisticated logo
  const drawSophisticatedLogo = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    const colors = ["#fdb813", "#4db848", "#00aeef", "#ec008c", "#8dc63f", "#1e96d4"];
    ctx.fillStyle = "#f26422";
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const lineLen = i % 2 === 0 ? 38 : 26;
      const nx = Math.cos(angle) * lineLen;
      const ny = Math.sin(angle) * lineLen;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  const steamX = PAD;
  drawSophisticatedLogo(steamX + 28, logoAreaY + 13);
  ctx.textAlign = "left";
  ctx.font = "900 36px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("STEAM", steamX + 78, logoAreaY + 29);
  ctx.fillStyle = "rgba(253,184,19,0.5)";
  ctx.fillText("HUB", steamX + 230, logoAreaY + 29);

  // Vertical separator
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(steamX + 330, logoAreaY + 2);
  ctx.lineTo(steamX + 330, logoAreaY + 46);
  ctx.stroke();

  // MJS Logo (bigger, shifted right)
  try {
    const mjsImg = await loadImage("/logo_mjs.png");
    const mjsH = 80;
    const mjsW = (mjsImg.width / mjsImg.height) * mjsH;
    ctx.drawImage(mjsImg, steamX + 370, logoAreaY - 14, mjsW, mjsH);
  } catch {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("MJS", steamX + 370, logoAreaY + 32);
  }

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
    const qrImg = await loadImage(buildQRUrl(ticket, user));
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
  }


  return canvas.toDataURL("image/png");
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
    color: "bg-slate-900 text-white border-slate-900",
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
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewTicket, setPreviewTicket] = useState<TicketOrder | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
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

  const openPreview = async (ticket: TicketOrder) => {
    setGenerating(ticket.id);
    try {
      const dataUrl = await generateTicketImageBase64(ticket, user);
      setPreviewDataUrl(dataUrl);
      setPreviewTicket(ticket);
    } catch {
      showToast("Erreur lors de la génération de l'aperçu.");
    } finally {
      setGenerating(null);
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
                        onClick={() => openPreview(ticket)}
                        disabled={generating === ticket.id}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {generating === ticket.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {generating === ticket.id
                          ? "Génération..."
                          : "Voir le billet"}
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

      {/* Preview Modal */}
      {previewTicket && previewDataUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-base text-slate-800">Aperçu du billet</h2>
              </div>
              <button
                onClick={() => {
                  setPreviewTicket(null);
                  setPreviewDataUrl(null);
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto flex flex-col items-center justify-center">
              <img
                src={previewDataUrl}
                alt="Ticket Preview"
                className="w-full max-w-2xl h-auto rounded-xl shadow-md border border-slate-200 object-contain"
              />
            </div>

            <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPreviewTicket(null);
                  setPreviewDataUrl(null);
                }}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fermer
              </button>
              <a
                href={previewDataUrl}
                download={`ticket-${previewTicket.id.slice(0, 8)}.png`}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Télécharger l'image PNG
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
