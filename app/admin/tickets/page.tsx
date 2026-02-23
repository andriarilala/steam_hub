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
  pending: "bg-amber-500/20 text-amber-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-400",
  cancelled: "bg-foreground/10 text-foreground/40",
};

const TYPE_STYLES: Record<string, string> = {
  standard: "bg-blue-500/20 text-blue-400",
  vip: "bg-purple-500/20 text-purple-400",
  student: "bg-primary/20 text-primary",
  virtual: "bg-cyan-500/20 text-cyan-400",
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

const emptyForm = () => ({
  userId: "",
  eventId: "",
  ticketType: "standard" as "standard" | "vip" | "student" | "virtual",
  quantity: 1,
  price: 50,
  total: 50,
  status: "pending" as "pending" | "completed" | "failed" | "cancelled",
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
  const [toast, setToast] = useState("");

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

    fetch("/api/admin/users?page=1")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d.users) ? d.users : []))
      .catch(() => {});
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
  };

  const save = async () => {
    if (modal === "create" && !form.userId)
      return showToast("User is required");
    setSaving(true);

    const isEdit = modal === "edit";
    const payload = isEdit
      ? { id: selectedTicket!.id, ...form, eventId: form.eventId || undefined }
      : { ...form, eventId: form.eventId || undefined };

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

              {/* Download link */}
              <a
                href={buildQRUrl(selectedTicket)}
                download={`ticket-qr-${selectedTicket.id.slice(0, 8)}.png`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Download QR Code
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
              {/* User */}
              {modal === "create" && (
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    User *
                  </label>
                  <select
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: e.target.value }))
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">— Select a user —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name ? `${u.name} (${u.email})` : u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground/20">
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    User
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Event
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Type
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Qty
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Total
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left font-bold uppercase text-[10px]">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right font-bold uppercase text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-xs">
                        {ticket.user.name || (
                          <span className="italic text-foreground/30">
                            unnamed
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-foreground/40">
                        {ticket.user.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-w-[150px]">
                      {ticket.event ? (
                        <>
                          <p className="text-xs font-medium truncate">
                            {ticket.event.title}
                          </p>
                          <p className="text-[11px] text-foreground/40">
                            {new Date(ticket.event.date).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-foreground/30 text-xs italic">
                          No event
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${TYPE_STYLES[ticket.ticketType]}`}
                      >
                        {ticket.ticketType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground/60">
                      {ticket.quantity}
                    </td>
                    <td className="px-5 py-4 font-bold">
                      Ar {ticket.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${STATUS_STYLES[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-foreground/40">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* QR Code button */}
                        <button
                          onClick={() => openQR(ticket)}
                          title="View QR Code"
                          className="p-1.5 rounded-lg text-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        {/* Edit button */}
                        <button
                          onClick={() => openEdit(ticket)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-foreground/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          disabled={deleting === ticket.id}
                          title="Delete"
                          className="p-1.5 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
