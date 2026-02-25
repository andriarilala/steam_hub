"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  QrCode,
  Search,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";

interface TicketEvent {
  id: string;
  title: string;
  date: string;
  type: string | null;
}

interface TicketUser {
  id: string;
  name: string | null;
  email: string;
}

interface TicketOrder {
  id: string;
  userId: string;
  eventId: string | null;
  ticketType: "standard" | "vip" | "student" | "virtual";
  quantity: number;
  price: number;
  total: number;
  reference: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  qrCode: string;
  createdAt: string;
  user: TicketUser;
  event: TicketEvent | null;
}

interface EventOption {
  id: string;
  title: string;
  date: string;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

const TICKET_TYPES = ["standard", "vip", "student", "virtual"] as const;
const TICKET_STATUSES = [
  "pending",
  "completed",
  "failed",
  "cancelled",
] as const;

const TICKET_PRICES: Record<string, number> = {
  standard: 50,
  vip: 150,
  student: 25,
  virtual: 20,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  failed: "bg-red-50 text-red-600 border border-red-200",
  cancelled: "bg-slate-100 text-slate-500 border border-slate-200",
};

const TYPE_STYLES: Record<string, string> = {
  standard: "bg-blue-50 text-blue-600 border border-blue-200",
  vip: "bg-purple-50 text-purple-600 border border-purple-200",
  student: "bg-orange-50 text-orange-600 border border-orange-200",
  virtual: "bg-cyan-50 text-cyan-600 border border-cyan-200",
};

function buildQRUrl(ticket: TicketOrder): string {
  const data = [
    "PASS AVENIR",
    `Ticket: ${ticket.id.slice(0, 8).toUpperCase()}`,
    `Type: ${ticket.ticketType.toUpperCase()}`,
    ticket.event ? `Event: ${ticket.event.title}` : "No event",
    ticket.event
      ? `Date: ${new Date(ticket.event.date).toLocaleDateString()}`
      : "",
    `Holder: ${ticket.user.name || ticket.user.email}`,
    `Code: ${ticket.qrCode}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(data)}`;
}

// ─── Canvas ticket‑image download helpers ───────────────────────────────────

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
  // ── Landscape dimensions ──────────────────────────────────────────────────
  const W = 920;
  const H = 460;
  const DIVIDER_X = 590; // vertical split: info left | QR right
  const PAD = 36;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = "#094945";
  ctx.fillRect(0, 0, W, H);

  // ── Header band (full width) ─────────────────────────────────────────────
  const HEADER_H = 74;
  ctx.fillStyle = "#0b5a54";
  ctx.fillRect(0, 0, W, HEADER_H);

  // Brand name — left
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("PASS AVENIR", PAD, 46);

  // Ticket-type badge — right of header
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

  // Ticket id — next to badge
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`#${ticket.id.slice(0, 8).toUpperCase()}`, badgeX - 12, 42);

  // ── Horizontal dashed separator under header ─────────────────────────────
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

  // ── Vertical dashed divider ───────────────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(DIVIDER_X, HEADER_H + 14);
  ctx.lineTo(DIVIDER_X, H - 60);
  ctx.stroke();
  ctx.restore();

  // ── LEFT PANEL — Event info ───────────────────────────────────────────────
  const LEFT_W = DIVIDER_X - PAD * 2; // usable text width on left side
  let y = HEADER_H + 26;

  const label = (text: string, xPos = PAD) => {
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text, xPos, y);
    y += 16;
  };

  const value = (
    text: string,
    fontSize = 16,
    alpha = 1,
    xPos = PAD,
    bold = true,
  ) => {
    ctx.fillStyle = alpha < 1 ? `rgba(255,255,255,${alpha})` : "#ffffff";
    ctx.font = `${bold ? "bold " : ""}${fontSize}px sans-serif`;
    ctx.textAlign = "left";
    return wrapText(ctx, text, xPos, y, LEFT_W, fontSize + 5);
  };

  // Event
  label("ÉVÉNEMENT");
  const eventTitle = ticket.event?.title ?? "—";
  const lastTitleY = value(eventTitle, 19);
  y = lastTitleY + 22;

  // Date & Time
  if (ticket.event) {
    const d = new Date(ticket.event.date);
    const dateStr = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    label("DATE & HEURE");
    value(dateStr, 13);
    y += 16;
    value(timeStr, 12, 0.7, PAD, false);
    y += 22;
  } else {
    y += 8;
  }

  hDash(y, PAD, DIVIDER_X - 20);
  y += 14;

  // Titulaire
  label("TITULAIRE");
  value(ticket.user.name || ticket.user.email, 15);
  y += 22;

  // ── Footer Y reference (used by right panel) ───────────────────────────
  const FOOTER_Y = H - 52;

  // ── RIGHT PANEL — QR code ─────────────────────────────────────────────────
  const rightCenterX = DIVIDER_X + (W - DIVIDER_X) / 2;
  const qrSize = 190;
  const qrX = rightCenterX - qrSize / 2;
  // Center QR vertically in the right zone between header and footer strip
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

  // QR code ref below QR
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  ctx.fillText(ticket.qrCode, rightCenterX, H - 38);

  // ── Footer strip (right) ──────────────────────────────────────────────────
  hDash(FOOTER_Y, DIVIDER_X + 20, W - PAD);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCAN QR CODE", rightCenterX, FOOTER_Y + 14);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "10px sans-serif";
  ctx.fillText("pour valider l'accès", rightCenterX, FOOTER_Y + 28);

  // ── Trigger download ──────────────────────────────────────────────────────
  const link = document.createElement("a");
  link.download = `ticket-${ticket.id.slice(0, 8)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─────────────────────────────────────────────────────────────────────────────

const emptyForm = () => ({
  userId: "",
  eventId: "",
  ticketType: "standard" as "standard" | "vip" | "student" | "virtual",
  quantity: 1,
  price: 50,
  total: 50,
  status: "pending" as "pending" | "completed" | "failed" | "cancelled",
  reference: "",
});

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [modal, setModal] = useState<"create" | "edit" | "qr" | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState("");

  // ── User section mode: select existing OR create new ──────────────────────
  const [userMode, setUserMode] = useState<"select" | "create">("select");
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // load events and users for dropdowns
  useEffect(() => {
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {});

    // Fetch ALL users across all pages so the dropdown is complete
    const fetchAllUsers = async () => {
      let currentPage = 1;
      let accumulated: UserOption[] = [];
      try {
        while (true) {
          const res = await fetch(`/api/admin/users?page=${currentPage}`);
          if (!res.ok) break;
          const d = await res.json();
          const batch: UserOption[] = Array.isArray(d.users) ? d.users : [];
          accumulated = [...accumulated, ...batch];
          if (currentPage >= (d.totalPages ?? 1)) break;
          currentPage++;
        }
      } catch {
        // keep whatever we got
      }
      setUsers(accumulated);
    };
    fetchAllUsers();
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (eventFilter) params.set("eventId", eventFilter);
    fetch(`/api/admin/tickets?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setTickets(Array.isArray(d.tickets) ? d.tickets : []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, statusFilter, eventFilter]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, eventFilter]);

  const updateFormPrice = (type: string, qty: number) => {
    const unitPrice = TICKET_PRICES[type] ?? 50;
    setForm((f) => ({
      ...f,
      ticketType: type as any,
      price: unitPrice,
      total: unitPrice * qty,
    }));
  };

  const openCreate = () => {
    setForm(emptyForm());
    setModal("create");
  };

  const openEdit = (t: TicketOrder) => {
    setForm({
      userId: t.userId,
      eventId: t.eventId || "",
      ticketType: t.ticketType,
      quantity: t.quantity,
      price: t.price,
      total: t.total,
      status: t.status,
      reference: t.reference || "",
    });
    setSelectedTicket(t);
    setModal("edit");
  };

  const openQR = (t: TicketOrder) => {
    setSelectedTicket(t);
    setModal("qr");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedTicket(null);
    setForm(emptyForm());
    setUserMode("select");
    setNewUserForm({ name: "", email: "", password: "" });
  };

  const save = async () => {
    setSaving(true);

    const isEdit = modal === "edit";
    let resolvedUserId = form.userId;

    // ── If admin chose to create a new user, do that first ─────────────────
    if (userMode === "create") {
      if (!newUserForm.email.trim()) {
        setSaving(false);
        return showToast("Email is required for new user");
      }
      if (!newUserForm.password || newUserForm.password.length < 6) {
        setSaving(false);
        return showToast("Password must be at least 6 characters");
      }

      const userRes = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserForm.name.trim() || undefined,
          email: newUserForm.email.trim().toLowerCase(),
          password: newUserForm.password,
        }),
      });
      if (!userRes.ok) {
        const d = await userRes.json();
        setSaving(false);
        return showToast(d.error || "Failed to create user");
      }
      const created = await userRes.json();
      resolvedUserId = created.id;
      // Add the newly created user to the local list so it appears in dropdown next time
      setUsers((prev) => [
        { id: created.id, name: created.name, email: created.email },
        ...prev,
      ]);
    } else if (!isEdit && !resolvedUserId) {
      setSaving(false);
      return showToast("Please select or create a user");
    }

    let payload: Record<string, unknown>;

    if (isEdit) {
      payload = {
        id: selectedTicket!.id,
        ticketType: form.ticketType,
        quantity: form.quantity,
        price: form.price,
        total: form.total,
        status: form.status,
        eventId: form.eventId || undefined,
        reference: (form as any).reference || undefined,
      };
      // Include userId only when it changed
      if (resolvedUserId && resolvedUserId !== selectedTicket!.userId) {
        payload.userId = resolvedUserId;
      }
    } else {
      payload = {
        ...form,
        userId: resolvedUserId,
        eventId: form.eventId || undefined,
      };
    }

    const res = await fetch("/api/admin/tickets", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      showToast(isEdit ? "Ticket updated" : "Ticket created");
      closeModal();
      load();
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to save");
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/tickets?id=${id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    if (res.ok) {
      showToast("Ticket deleted");
      load();
    } else showToast("Failed to delete");
  };

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* QR Code Modal */}
      {modal === "qr" && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm">QR Code — Ticket</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-foreground/30 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-5">
              {/* QR Image */}
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <img
                  src={buildQRUrl(selectedTicket)}
                  alt="QR Code"
                  width={220}
                  height={220}
                  className="block"
                />
              </div>

              {/* Ticket info */}
              <div className="w-full bg-background rounded-xl p-4 border border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                    Holder
                  </span>
                  <span className="font-medium">
                    {selectedTicket.user.name || selectedTicket.user.email}
                  </span>
                </div>
                {selectedTicket.event && (
                  <div className="flex justify-between">
                    <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                      Event
                    </span>
                    <span className="font-medium text-right max-w-[180px]">
                      {selectedTicket.event.title}
                    </span>
                  </div>
                )}
                {selectedTicket.event && (
                  <div className="flex justify-between">
                    <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                      Date
                    </span>
                    <span>
                      {new Date(selectedTicket.event.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                    Type
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${TYPE_STYLES[selectedTicket.ticketType]}`}
                  >
                    {selectedTicket.ticketType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                    Qty
                  </span>
                  <span>{selectedTicket.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-bold">
                    Ar {selectedTicket.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-wider">
                    Status
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${STATUS_STYLES[selectedTicket.status]}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-foreground/40 text-[10px] font-mono break-all">
                    {selectedTicket.qrCode}
                  </span>
                </div>
              </div>

              {/* Download styled ticket image */}
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadTicketImage(selectedTicket);
                  } finally {
                    setDownloading(false);
                  }
                }}
                disabled={downloading}
                className="w-full text-center py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {downloading ? "Génération…" : "Télécharger le ticket (PNG)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="font-bold">
                {modal === "create" ? "Create Ticket" : "Edit Ticket"}
              </h2>
              <button
                onClick={closeModal}
                className="text-foreground/30 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* User section — toggle between select existing / create new */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                    {modal === "create" ? "User *" : "User"}
                  </label>
                  {/* Toggle tabs */}
                  <div className="flex bg-background border border-border rounded-lg overflow-hidden text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setUserMode("select")}
                      className={`px-3 py-1.5 transition-colors ${
                        userMode === "select"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/40 hover:text-foreground"
                      }`}
                    >
                      Existant
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserMode("create")}
                      className={`px-3 py-1.5 transition-colors ${
                        userMode === "create"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/40 hover:text-foreground"
                      }`}
                    >
                      Créer
                    </button>
                  </div>
                </div>

                {userMode === "select" ? (
                  /* ── Select existing user ── */
                  <select
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: e.target.value }))
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                  >
                    {modal === "edit" ? (
                      <option value="">— Garder l'utilisateur actuel —</option>
                    ) : (
                      <option value="">— Sélectionner un utilisateur —</option>
                    )}
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name ? `${u.name} (${u.email})` : u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* ── Create new user ── */
                  <div className="space-y-3 p-4 bg-background border border-border rounded-xl">
                    <p className="text-[11px] text-foreground/40 mb-1">
                      Un nouvel utilisateur sera créé et associé à ce ticket.
                    </p>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/40 mb-1 uppercase tracking-wider">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        placeholder="ex. Jean Dupont"
                        value={newUserForm.name}
                        onChange={(e) =>
                          setNewUserForm((f) => ({
                            ...f,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-card border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/40 mb-1 uppercase tracking-wider">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="ex. jean@example.com"
                        value={newUserForm.email}
                        onChange={(e) =>
                          setNewUserForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                        className="w-full bg-card border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/40 mb-1 uppercase tracking-wider">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        placeholder="Min. 6 caractères"
                        value={newUserForm.password}
                        onChange={(e) =>
                          setNewUserForm((f) => ({
                            ...f,
                            password: e.target.value,
                          }))
                        }
                        className="w-full bg-card border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Event */}
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Event
                </label>
                <select
                  value={form.eventId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, eventId: e.target.value }))
                  }
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="">— No event —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({new Date(ev.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type & Qty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Ticket Type *
                  </label>
                  <select
                    value={form.ticketType}
                    onChange={(e) =>
                      updateFormPrice(e.target.value, form.quantity)
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 capitalize"
                  >
                    {TICKET_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => {
                      const qty = Math.max(1, parseInt(e.target.value) || 1);
                      setForm((f) => ({
                        ...f,
                        quantity: qty,
                        total: f.price * qty,
                      }));
                    }}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Price & Total */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Unit Price (Ar)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => {
                      const p = parseFloat(e.target.value) || 0;
                      setForm((f) => ({
                        ...f,
                        price: p,
                        total: p * f.quantity,
                      }));
                    }}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Total (Ar)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.total}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        total: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as any }))
                  }
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 capitalize"
                >
                  {TICKET_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Référence de paiement{" "}
                  <span className="font-normal text-foreground/30">
                    (optionnel)
                  </span>
                </label>
                <input
                  type="text"
                  value={(form as any).reference || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  placeholder="Ex: 1133223564476..."
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end sticky bottom-0 bg-card pt-4 border-t border-border">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 text-sm bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : modal === "create"
                    ? "Create Ticket"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ticket Management</h1>
          <p className="text-sm text-foreground/40 mt-1">
            {total} total tickets
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 text-xs bg-card border border-border px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-xs bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> New Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email…"
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-card border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 max-w-[220px]"
        >
          <option value="">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
            <p className="text-foreground/30 text-sm">No tickets found</p>
            <button
              onClick={openCreate}
              className="mt-4 text-xs text-primary font-bold"
            >
              Create the first ticket →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2.5">
              <thead>
                <tr className="text-foreground/30">
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-2 text-center font-bold uppercase text-[10px] tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-2 text-center font-bold uppercase text-[10px] tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-2 text-left font-bold uppercase text-[10px] tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-2 text-right font-bold uppercase text-[10px] tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="bg-white hover:bg-slate-50 transition-all shadow-sm border border-slate-100 rounded-xl"
                  >
                    <td className="px-6 py-5 rounded-l-xl border-y border-l border-slate-100">
                      <p className="font-bold text-sm text-primary leading-tight">
                        {ticket.user.name || (
                          <span className="italic text-foreground/30">
                            unnamed
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-foreground/40 mt-0.5">
                        {ticket.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100 max-w-[200px]">
                      {ticket.event ? (
                        <>
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {ticket.event.title}
                          </p>
                          <p className="text-[11px] text-foreground/40 mt-0.5">
                            {new Date(ticket.event.date).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-foreground/30 text-xs italic">
                          No event
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${TYPE_STYLES[ticket.ticketType]}`}
                      >
                        {ticket.ticketType}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100 text-center text-slate-600 font-medium">
                      {ticket.quantity}
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100">
                      <span className="text-lg font-black text-slate-900 tracking-tight">
                        Ar{" "}
                        {ticket.total.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${STATUS_STYLES[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100 text-xs text-foreground/50 font-mono max-w-[130px] truncate">
                      {ticket.reference || "—"}
                    </td>
                    <td className="px-6 py-5 border-y border-slate-100 text-xs text-foreground/40">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 rounded-r-xl border-y border-r border-slate-100">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick validate button — only for pending tickets */}
                        {ticket.status === "pending" && (
                          <button
                            onClick={async () => {
                              const res = await fetch("/api/admin/tickets", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: ticket.id,
                                  status: "completed",
                                }),
                              });
                              if (res.ok) {
                                showToast("Ticket validé !");
                                load();
                              } else {
                                showToast("Erreur lors de la validation");
                              }
                            }}
                            title="Valider le billet"
                            className="p-2 rounded-xl text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </button>
                        )}
                        {/* QR Code button */}
                        <button
                          onClick={() => openQR(ticket)}
                          title="View QR Code"
                          className="p-2 rounded-xl text-foreground/30 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        {/* Edit button */}
                        <button
                          onClick={() => openEdit(ticket)}
                          title="Edit"
                          className="p-2 rounded-xl text-foreground/30 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          disabled={deleting === ticket.id}
                          title="Delete"
                          className="p-2 rounded-xl text-foreground/30 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-foreground/40">
              Page {page} of {totalPages} ({total} tickets)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
