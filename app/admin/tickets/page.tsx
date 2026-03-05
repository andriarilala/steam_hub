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
  Calendar,
  MapPin,
  Tag,
  Clock,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Loader2,
  Printer,
  ChevronUp,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface TicketEvent {
  id: string;
  title: string;
  date: string;
  type: string | null;
  location: string | null;
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
  ticketNumber: string | null; // "PA 00001"
  ticketType: "standard" | "vip" | "student" | "virtual";
  quantity: number;
  price: number;
  total: number;
  reference: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  qrCode: string;
  usedAt: string | null;
  usedBy: string | null;
  createdAt: string;
  user: TicketUser;
  event: TicketEvent | null;
}

interface PhysicalTicket {
  id: string;
  ticketNumber: string;
  eventId: string | null;
  ticketType: string;
  batchId: string;
  status: "active" | "used" | "cancelled";
  usedAt: string | null;
  createdAt: string;
  event: { title: string } | null;
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

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: AlertCircle,
  },
  completed: {
    label: "Validé",
    color: "bg-blue-50 text-blue-600 border-blue-200",
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

function buildQRUrl(ticket: TicketOrder): string {
  const data = [
    "PASS AVENIR — BILLET OFFICIEL",
    `N°: ${ticket.ticketNumber || ticket.id.slice(0, 8).toUpperCase()}`,
    `Titulaire: ${ticket.user.name || ticket.user.email}`,
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

async function generateTicketImageBase64(ticket: TicketOrder): Promise<string> {
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
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.textAlign = "left";
  ctx.font = "300 32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillText("Pass", PAD, 78);
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#9ce4f2";
  const passWidth = ctx.measureText("Pass ").width;
  ctx.fillText("Avenir", PAD + passWidth - 2, 78);
  ctx.restore();
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
  val(ticket.user.name || ticket.user.email, 17, true);

  // ── Bottom Logos Section ──────────────────────────────────────────────────
  const logoAreaY = H - 100;
  const steamX = PAD;
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
  drawSophisticatedLogo(steamX + 28, logoAreaY + 13);
  ctx.textAlign = "left";
  ctx.font = "900 36px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("STEAM", steamX + 78, logoAreaY + 29);
  ctx.fillStyle = "rgba(253,184,19,0.5)";
  ctx.fillText("HUB", steamX + 230, logoAreaY + 29);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(steamX + 330, logoAreaY + 2);
  ctx.lineTo(steamX + 330, logoAreaY + 46);
  ctx.stroke();

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
    const qrImg = await loadImage(buildQRUrl(ticket));
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
  }


  return canvas.toDataURL("image/png");
}

async function generatePhysicalTicketImageBase64(ticket: PhysicalTicket): Promise<string> {
  const W = 1000, H = 500, PAD = 50;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background: Warm Amber for Physical ────────────────────────────────────
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(0, 0, W, H);

  // Texture / Pattern
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < W; i += 20) {
    ctx.fillRect(i, 0, 1, H);
  }

  // ── Header: "Pass Avenir" ──────────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 8;
  ctx.textAlign = "left";
  ctx.font = "300 32px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Pass", PAD, 78);
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#fef3c7";
  const passWidth = ctx.measureText("Pass ").width;
  ctx.fillText("Avenir", PAD + passWidth - 2, 78);
  ctx.restore();

  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.letterSpacing = "2px";
  ctx.fillText("BILLET PHYSIQUE / VENTE TERRAIN", PAD, 92);
  ctx.letterSpacing = "0px";

  // Top Right: Badge
  const ticketIdString = ticket.ticketNumber;
  const statusLabel = (ticket.ticketType || "STANDARD").toUpperCase();

  ctx.fillStyle = "#ffffff";
  const badgeW = 120; const badgeH = 38;
  roundRect(ctx, W - PAD - badgeW, 45, badgeW, badgeH, 10);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(statusLabel, W - PAD - badgeW / 2, 70);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "right";
  ctx.fillText(ticketIdString, W - PAD - badgeW - 16, 69);

  // ── Left Content ───────────────────────────────────────────────────────────
  let y = 185;
  const label = (text: string) => {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text, PAD, y);
    y += 24;
  };
  const val = (text: string, size = 24) => {
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size}px sans-serif`;
    wrapText(ctx, text, PAD, y, W * 0.55, size + 6);
    y += 45;
  };

  label("ÉVÉNEMENT");
  val(ticket.event?.title || "Accès Toutes Zones", 22);

  label("TYPE DE BILLET");
  val(statusLabel, 20);

  label("LOT (BATCH)");
  val(ticket.batchId, 16);

  label("TITULAIRE");
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, y + 5);
  ctx.lineTo(PAD + 250, y + 5);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "italic 12px sans-serif";
  ctx.fillText("(À remplir lors de la vente)", PAD, y + 25);

  // ── QR Section ─────────────────────────────────────────────────────────────
  const qrBoxSize = 260;
  const qrX = W - PAD - qrBoxSize;
  const qrY = 160;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrX, qrY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();

  try {
    const qrData = [
      "PASS AVENIR — BILLET PHYSIQUE",
      `N°: ${ticket.ticketNumber}`,
      `Événement: ${ticket.event?.title || "Tous"}`,
      `Type: ${statusLabel}`,
      `Batch: ${ticket.batchId}`,
      `Code: ${ticket.ticketNumber}`,
    ].join("\n");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(qrData)}`;
    const qrImg = await loadImage(qrUrl);
    ctx.drawImage(qrImg, qrX + 15, qrY + 15, qrBoxSize - 30, qrBoxSize - 30);
  } catch {
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(qrX + 20, qrY + 20, qrBoxSize - 40, qrBoxSize - 40);
  }

  // Watermark
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = "bold 80px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.textAlign = "center";
  ctx.fillText("TERRAIN", 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
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

  // Sorting state
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [physicalSortField, setPhysicalSortField] = useState("createdAt");
  const [physicalSortOrder, setPhysicalSortOrder] = useState<"asc" | "desc">("desc");

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [modal, setModal] = useState<"create" | "edit" | "preview" | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeletePhysical, setConfirmDeletePhysical] = useState<string | null>(null);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState<string | null>(null);

  // Physical tickets state
  const [activeTab, setActiveTab] = useState<"digital" | "physical">("digital");
  const [physicalTickets, setPhysicalTickets] = useState<PhysicalTicket[]>([]);
  const [selectedPhysicalTicket, setSelectedPhysicalTicket] = useState<PhysicalTicket | null>(null);
  const [batchModal, setBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    eventId: "",
    ticketType: "standard",
    quantity: 50,
    batchId: `BATCH-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`
  });
  const [loadingPhysical, setLoadingPhysical] = useState(false);
  const [batchFilter, setBatchFilter] = useState("");

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
      .catch(() => { });

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
    const params = new URLSearchParams({
      page: String(page),
      sortField,
      sortOrder
    });
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
  }, [page, search, statusFilter, eventFilter, sortField, sortOrder]);

  const loadPhysical = useCallback(() => {
    setLoadingPhysical(true);
    const params = new URLSearchParams({
      sortField: physicalSortField,
      sortOrder: physicalSortOrder
    });
    if (search) params.set("search", search);
    if (batchFilter) params.set("batchId", batchFilter);

    fetch(`/api/admin/tickets/physical?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPhysicalTickets(Array.isArray(d.tickets) ? d.tickets : []);
        setLoadingPhysical(false);
      })
      .catch(() => setLoadingPhysical(false));
  }, [search, batchFilter, physicalSortField, physicalSortOrder]);

  useEffect(() => {
    load();
    loadPhysical();
  }, [load, loadPhysical]);

  // Autocomplete logic
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }
    const s = new Set<string>();
    tickets.forEach(t => {
      if (t.ticketNumber?.toLowerCase().includes(search.toLowerCase())) s.add(t.ticketNumber);
      if (t.user.name?.toLowerCase().includes(search.toLowerCase())) s.add(t.user.name);
    });
    physicalTickets.forEach(t => {
      if (t.ticketNumber?.toLowerCase().includes(search.toLowerCase())) s.add(t.ticketNumber);
    });
    setSuggestions(Array.from(s).slice(0, 5));
  }, [search, tickets, physicalTickets]);

  const handleSort = (field: string) => {
    if (activeTab === "digital") {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      if (physicalSortField === field) {
        setPhysicalSortOrder(physicalSortOrder === "asc" ? "desc" : "asc");
      } else {
        setPhysicalSortField(field);
        setPhysicalSortOrder("asc");
      }
    }
  };

  const SortIcon = ({ field, activeField, activeOrder }: { field: string, activeField: string, activeOrder: string }) => {
    if (field !== activeField) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return activeOrder === "asc" ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };
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

  const openPreview = async (t: TicketOrder | PhysicalTicket) => {
    setGenerating(true);
    try {
      let dataUrl = "";
      if ("user" in t) {
        dataUrl = await generateTicketImageBase64(t as TicketOrder);
        setSelectedTicket(t as TicketOrder);
      } else {
        dataUrl = await generatePhysicalTicketImageBase64(t as PhysicalTicket);
        setSelectedPhysicalTicket(t as PhysicalTicket);
      }
      setPreviewDataUrl(dataUrl);
      setModal("preview" as any);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération de l'aperçu.");
    } finally {
      setGenerating(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedTicket(null);
    setSelectedPhysicalTicket(null);
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
      let errorMsg = "Failed to save";
      try {
        const d = await res.json();
        errorMsg = d.error || errorMsg;
      } catch (e) {
        // Fallback if response is not JSON
        errorMsg = `Server error (${res.status})`;
      }
      showToast(errorMsg);
    }
  };

  const deleteTicket = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setDeleting(id);
    const res = await fetch(`/api/admin/tickets?id=${id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    setConfirmDelete(null);
    if (res.ok) {
      showToast("Ticket deleted");
      load();
    } else {
      let errorMsg = "Failed to delete";
      try {
        const d = await res.json();
        errorMsg = d.error || errorMsg;
      } catch (e) {
        errorMsg = `Server error (${res.status})`;
      }
      showToast(errorMsg);
    }
  };

  const handleManualCheckIn = async (code: string, isPhysical: boolean) => {
    if (!confirm(`Voulez-vous valider manuellement ce billet ${isPhysical ? 'physique' : 'numérique'} ?`)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: code })
      });

      const d = await res.json();
      if (res.ok) {
        showToast(d.message || "Billet validé avec succès");
        if (isPhysical) loadPhysical();
        else load();
      } else {
        showToast(d.error || "Erreur lors de la validation");
      }
    } catch (err) {
      showToast("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  const deletePhysical = async (id: string) => {
    setDeleting(id);
    const res = await fetch(`/api/admin/tickets/physical?id=${id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    setConfirmDeletePhysical(null);
    if (res.ok) {
      showToast("Billet physique supprimé");
      loadPhysical();
    } else {
      showToast("Erreur lors de la suppression");
    }
  };

  const deleteBatch = async (batchId: string) => {
    setDeleting(batchId);
    const res = await fetch(`/api/admin/tickets/physical?batchId=${batchId}`, {
      method: "DELETE",
    });
    setDeleting(null);
    setConfirmDeleteBatch(null);
    if (res.ok) {
      showToast(`Lot ${batchId} supprimé avec succès`);
      setBatchFilter("");
      loadPhysical();
    } else {
      showToast("Erreur lors de la suppression du lot");
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 text-slate-800">
          {toast}
        </div>
      )}

      {/* Preview Modal */}
      {modal === "preview" && previewDataUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-base text-slate-900">
                  {selectedPhysicalTicket ? "Aperçu Billet Physique" : "Aperçu du billet"}
                </h2>
              </div>
              <button
                onClick={closeModal}
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
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fermer
              </button>
              <a
                href={previewDataUrl}
                download={
                  selectedPhysicalTicket
                    ? `phys-ticket-${selectedPhysicalTicket.ticketNumber}.png`
                    : `ticket-${selectedTicket?.id.slice(0, 8)}.png`
                }
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" />
                Télécharger l'image PNG
              </a>
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
                      className={`px-3 py-1.5 transition-colors ${userMode === "select"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/40 hover:text-foreground"
                        }`}
                    >
                      Existant
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserMode("create")}
                      className={`px-3 py-1.5 transition-colors ${userMode === "create"
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

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab("digital")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "digital"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
        >
          Billets Numériques
        </button>
        <button
          onClick={() => setActiveTab("physical")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "physical"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
        >
          Billets Physiques (Terrain)
        </button>
      </div>

      {
        activeTab === "digital" ? (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input
                  type="text"
                  value={search}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Recherche par nom, email ou n° de ticket…"
                  className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearch(s);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                      >
                        <span>{s}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [f, o] = e.target.value.split("-");
                    setSortField(f);
                    setSortOrder(o as "asc" | "desc");
                  }}
                  className="bg-card border border-border rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-primary/50"
                >
                  <option value="createdAt-desc">Plus récents</option>
                  <option value="createdAt-asc">Plus anciens</option>
                  <option value="ticketNumber-asc">N° Ticket (A-Z)</option>
                  <option value="ticketNumber-desc">N° Ticket (Z-A)</option>
                  <option value="user-asc">Nom (A-Z)</option>
                  <option value="user-desc">Nom (Z-A)</option>
                  <option value="status-asc">Statut</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-card border border-border rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-primary/50"
                >
                  <option value="">Tous les statuts</option>
                  {TICKET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>

                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="bg-card border border-border rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none focus:border-primary/50 max-w-[200px]"
                >
                  <option value="">Tous les événements</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16">
                  <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Aucun billet trouvé</p>
                  <button
                    onClick={openCreate}
                    className="mt-4 text-xs text-blue-600 font-bold hover:underline"
                  >
                    Créer le premier billet →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("ticketNumber")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            N° Ticket <SortIcon field="ticketNumber" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("user")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Participant <SortIcon field="user" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("event")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Événement <SortIcon field="event" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("ticketType")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Type <SortIcon field="ticketType" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Statut <SortIcon field="status" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("usedAt")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Utilisation <SortIcon field="usedAt" activeField={sortField} activeOrder={sortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tickets.map((ticket) => {
                        const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;
                        const isUsed = !!ticket.usedAt;

                        return (
                          <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors text-sm">
                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-600">
                              {ticket.ticketNumber || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{ticket.user.name || "Utilisateur"}</span>
                                <span className="text-[10px] text-slate-400">{ticket.user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-slate-700">{ticket.event?.title || "Special Access"}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border border-slate-200">
                                {TYPE_LABELS[ticket.ticketType] ?? ticket.ticketType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isUsed ? (
                                <div className="flex flex-col">
                                  <span className="text-rose-600 font-bold text-[10px] uppercase">Consommé</span>
                                  <span className="text-[9px] text-slate-400">
                                    {new Date(ticket.usedAt!).toLocaleString('fr-FR', {
                                      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[10px] uppercase">Valide / Prêt</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {ticket.status === "completed" && !isUsed && (
                                  <button
                                    onClick={() => handleManualCheckIn(ticket.qrCode, false)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Check-in"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openPreview(ticket)}
                                  className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                  title="Aperçu"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEdit(ticket)}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="Modifier"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(ticket.id)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-400">
                  Page {page} of {totalPages} ({total} tickets)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Billets Terrain</h2>
              <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
                Générez des lots de billets physiques pour la vente dans les rues, magasins ou via des partenaires.
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setBatchModal(true)}
                  className="bg-slate-900 text-white rounded-xl px-6 py-3 font-bold text-sm hover:shadow-lg hover:translate-y-[-2px] transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Générer un lot
                </button>
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const filtered = batchFilter
                        ? physicalTickets.filter(t => t.batchId === batchFilter)
                        : physicalTickets;

                      const content = `
                        <html>
                          <head>
                            <title>Liste Billets Physiques - Pass Avenir</title>
                            <style>
                              body { font-family: sans-serif; padding: 40px; color: #334155; }
                              h1 { color: #0f172a; margin-bottom: 5px; }
                              p { margin-bottom: 20px; font-size: 14px; color: #64748b; }
                              table { width: 100%; border-collapse: collapse; }
                              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
                              th { background: #f8fafc; font-weight: bold; }
                              .ticket-num { font-family: monospace; font-weight: bold; color: #0f172a; }
                            </style>
                          </head>
                          <body>
                            <h1>PASS AVENIR - BILLETS PHYSIQUES</h1>
                            <p>Lot: ${batchFilter || 'Tous'} | Exporté le: ${new Date().toLocaleString('fr-FR')}</p>
                            <table>
                              <thead>
                                <tr>
                                  <th>N° TICKET</th>
                                  <th>ÉVÉNEMENT</th>
                                  <th>TYPE</th>
                                  <th>LOT (BATCH)</th>
                                  <th>STATUT</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${filtered.map(t => `
                                  <tr>
                                    <td class="ticket-num">${t.ticketNumber}</td>
                                    <td>${t.event?.title || '-'}</td>
                                    <td style="text-transform: uppercase;">${t.ticketType}</td>
                                    <td>${t.batchId}</td>
                                    <td>${t.status === 'active' ? 'ACTIF' : 'UTILISÉ'}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            <script>window.print();</script>
                          </body>
                        </html>
                      `;
                      printWindow.document.write(content);
                      printWindow.document.close();
                    }
                  }}
                  className="bg-white border border-slate-200 text-slate-600 rounded-xl px-6 py-3 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer la liste
                </button>

                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const filtered = batchFilter
                        ? physicalTickets.filter(t => t.batchId === batchFilter)
                        : physicalTickets;

                      const content = `
                        <html>
                          <head>
                            <title>Bordereau de Vente - Pass Avenir</title>
                            <style>
                              body { font-family: sans-serif; padding: 30px; color: #1e293b; max-width: 900px; margin: 0 auto; }
                              .header { border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
                              h1 { margin: 0; font-size: 24px; color: #0f172a; }
                              .meta { font-size: 12px; color: #64748b; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { border: 1px solid #cbd5e1; padding: 10px 15px; text-align: left; font-size: 13px; }
                              th { background: #f1f5f9; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #475569; }
                              .checkbox { width: 60px; text-align: center; }
                              .box { width: 18px; height: 18px; border: 1.5px solid #0f172a; display: inline-block; margin-top: 2px; }
                              .footer { margin-top: 40px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
                              .sig-box { border: 1px dashed #cbd5e1; height: 100px; padding: 10px; font-size: 11px; color: #94a3b8; }
                              .totals { margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; font-weight: bold; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div>
                                <h1>BORDEREAU DE VENTE TERRAIN</h1>
                                <div class="meta">Pass Avenir — Système de Billetterie Officiel</div>
                              </div>
                              <div class="meta" style="text-align: right;">
                                Lot: <strong>${batchFilter || 'TOUS LES LOTS'}</strong><br/>
                                Date export: ${new Date().toLocaleDateString('fr-FR')}
                              </div>
                            </div>

                            <p style="font-size: 13px;">Agent / Vendeur : ________________________________________</p>

                            <table>
                              <thead>
                                <tr>
                                  <th class="checkbox">VENDU</th>
                                  <th>N° BILLET</th>
                                  <th>TYPE</th>
                                  <th>PRIX UNITAIRE</th>
                                  <th>NOTES / SIGNATURE CLIENT</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${filtered.map(t => `
                                  <tr>
                                    <td class="checkbox"><div class="box"></div></td>
                                    <td style="font-family: monospace; font-weight: bold;">${t.ticketNumber}</td>
                                    <td style="text-transform: uppercase;">${t.ticketType}</td>
                                    <td>... Ar</td>
                                    <td></td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>

                            <div class="totals">
                              <span>NOMBRE TOTAL DE BILLETS : ${filtered.length}</span>
                              <span>TOTAL RECETTE ESTIMÉE : __________ Ar</span>
                            </div>

                            <div class="footer">
                              <div>
                                <p style="font-size: 12px; font-weight: bold;">Signature de l'Agent</p>
                                <div class="sig-box">Cachet et signature</div>
                              </div>
                              <div>
                                <p style="font-size: 12px; font-weight: bold;">Visa Superviseur</p>
                                <div class="sig-box">Validation après inventaire</div>
                              </div>
                            </div>
                            
                            <script>window.print();</script>
                          </body>
                        </html>
                      `;
                      printWindow.document.write(content);
                      printWindow.document.close();
                    }
                  }}
                  className="bg-slate-900 text-white rounded-xl px-6 py-3 font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Bordereau de Vente
                </button>

                <button
                  onClick={async () => {
                    const filtered = batchFilter
                      ? physicalTickets.filter(t => t.batchId === batchFilter)
                      : physicalTickets;

                    if (filtered.length === 0) return showToast("Aucun billet à imprimer");

                    setGenerating(true);
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Impression Billets Physiques</title>
                            <style>
                              @page { size: A4; margin: 10mm; }
                              body { margin: 0; padding: 0; font-family: sans-serif; }
                              .grid { 
                                display: grid; 
                                grid-template-columns: 1fr 1fr; 
                                grid-template-rows: repeat(3, 1fr);
                                gap: 15px; 
                                height: calc(297mm - 20mm);
                                width: calc(210mm - 20mm);
                              }
                              .ticket-container {
                                border: 1px solid #eee;
                                border-radius: 8px;
                                overflow: hidden;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              }
                              img { 
                                width: 100%; 
                                height: auto;
                                display: block;
                              }
                              .page-break { page-break-after: always; }
                            </style>
                          </head>
                          <body>Chargement...</body>
                        </html>
                      `);

                      const ticketImages = await Promise.all(
                        filtered.map(t => generatePhysicalTicketImageBase64(t))
                      );

                      let html = '<div class="grid">';
                      for (let i = 0; i < ticketImages.length; i++) {
                        if (i > 0 && i % 6 === 0) {
                          html += '</div><div class="page-break"></div><div class="grid">';
                        }
                        html += `<div class="ticket-container"><img src="${ticketImages[i]}" /></div>`;
                      }
                      html += '</div>';

                      printWindow.document.body.innerHTML = html;
                      setTimeout(() => {
                        printWindow.print();
                        setGenerating(false);
                      }, 1000);
                    }
                  }}
                  disabled={generating}
                  className="bg-blue-600 text-white rounded-xl px-6 py-3 font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  Imprimer tous les billets
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input
                  type="text"
                  value={search}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par n° de ticket, lot ou événement…"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors shadow-sm"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearch(s);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                      >
                        <span>{s}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[200px]">
                <QrCode className="w-4 h-4 text-slate-400" />
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-xs font-bold focus:outline-none"
                >
                  <option value="">Tous les lots (batches)</option>
                  {Array.from(new Set(physicalTickets.map(t => t.batchId))).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {batchFilter && (
                <button
                  onClick={() => setConfirmDeleteBatch(batchFilter)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer ce lot
                </button>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {loadingPhysical ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : physicalTickets.length === 0 ? (
                <div className="text-center py-16">
                  <Ticket className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
                  <p className="text-foreground/30 text-sm">Aucun billet physique généré</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("ticketNumber")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            N° Ticket <SortIcon field="ticketNumber" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("event")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Événement <SortIcon field="event" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("ticketType")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Type <SortIcon field="ticketType" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("batchId")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Lot <SortIcon field="batchId" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Statut <SortIcon field="status" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <button onClick={() => handleSort("usedAt")} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                            Date d'Utilisation <SortIcon field="usedAt" activeField={physicalSortField} activeOrder={physicalSortOrder} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {physicalTickets
                        .filter(t => !batchFilter || t.batchId === batchFilter)
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                            <td className="px-6 py-4 text-xs text-slate-600">{t.event?.title || "Tous"}</td>
                            <td className="px-6 py-4 text-xs text-slate-600 uppercase">{t.ticketType}</td>
                            <td className="px-6 py-4 text-xs text-slate-400">{t.batchId}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.status === 'used' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                }`}>
                                {t.status === 'used' ? 'UTILISÉ' : 'ACTIF'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              {t.usedAt ? new Date(t.usedAt).toLocaleString('fr-FR') : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openPreview(t)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Aperçu"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDeletePhysical(t.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {t.status === 'active' && (
                                  <button
                                    onClick={() => handleManualCheckIn(t.ticketNumber, true)}
                                    disabled={saving}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Check-in Manuel"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Batch Generation Modal */}
      {
        batchModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Nouveau Lot de Billets</h3>
                <button onClick={() => setBatchModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Événement</label>
                  <select
                    value={batchForm.eventId}
                    onChange={(e) => setBatchForm(f => ({ ...f, eventId: e.target.value }))}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Sélectionner un événement</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Quantité</label>
                    <input
                      type="number"
                      value={batchForm.quantity}
                      onChange={(e) => setBatchForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                    <select
                      value={batchForm.ticketType}
                      onChange={(e) => setBatchForm(f => ({ ...f, ticketType: e.target.value }))}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Batch ID / Nom du lot</label>
                  <input
                    type="text"
                    value={batchForm.batchId}
                    onChange={(e) => setBatchForm(f => ({ ...f, batchId: e.target.value }))}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={() => setBatchModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Annuler</button>
                <button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/api/admin/tickets/physical", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(batchForm)
                      });
                      if (res.ok) {
                        showToast("Lot généré avec succès !");
                        setBatchModal(false);
                        loadPhysical();
                      } else {
                        showToast("Erreur lors de la génération");
                      }
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Génération..." : "Générer"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Supprimer le billet"
        message="Êtes-vous sûr de vouloir supprimer ce billet ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={deleteTicket}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDeletePhysical}
        title="Supprimer le billet physique"
        message="Êtes-vous sûr de vouloir supprimer ce billet physique ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => confirmDeletePhysical && deletePhysical(confirmDeletePhysical)}
        onCancel={() => setConfirmDeletePhysical(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteBatch}
        title="Supprimer le lot de billets"
        message={`Êtes-vous sûr de vouloir supprimer TOUS les billets du lot "${confirmDeleteBatch}" ?\n\nCette action est irréversible et supprimera ${physicalTickets.filter(t => t.batchId === confirmDeleteBatch).length} billets.`}
        confirmLabel="Supprimer tout le lot"
        onConfirm={() => confirmDeleteBatch && deleteBatch(confirmDeleteBatch)}
        onCancel={() => setConfirmDeleteBatch(null)}
      />
    </div >
  );
}
