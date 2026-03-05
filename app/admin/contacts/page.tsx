"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCheck,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  unread: "bg-amber-500/20 text-amber-400",
  read: "bg-foreground/10 text-foreground/50",
  replied: "bg-emerald-500/20 text-emerald-400",
};

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/contacts?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setActionLoading(null);
    if (res.ok) {
      showToast(`Marked as ${status}`);
      if (selected?.id === id)
        setSelected((s) => (s ? { ...s, status: status as any } : null));
      load();
    } else {
      showToast("Failed to update");
    }
  };

  const deleteMsg = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setActionLoading(id);
    const res = await fetch(`/api/admin/contacts?id=${id}`, {
      method: "DELETE",
    });
    setActionLoading(null);
    setConfirmDelete(null);
    if (res.ok) {
      showToast("Message deleted");
      if (selected?.id === id) setSelected(null);
      load();
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    // auto-mark as read if unread
    if (msg.status === "unread") {
      updateStatus(msg.id, "read");
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 text-slate-800">
          {toast}
        </div>
      )}

      {/* Message detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-end z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-sm truncate pr-4">
                {selected.subject || "Contact Message"}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-foreground/30 hover:text-foreground shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{selected.name}</p>
                  <p className="text-xs text-foreground/40">{selected.email}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${STATUS_STYLES[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>
              <p className="text-xs text-foreground/40">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
              <div className="bg-background rounded-xl p-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap border border-border">
                {selected.message}
              </div>
            </div>
            <div className="p-5 border-t border-border flex gap-2 flex-wrap">
              {selected.status !== "replied" && (
                <button
                  onClick={() => updateStatus(selected.id, "replied")}
                  disabled={actionLoading === selected.id}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark Replied
                </button>
              )}
              {selected.status === "unread" && (
                <button
                  onClick={() => updateStatus(selected.id, "read")}
                  disabled={actionLoading === selected.id}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground/10 text-foreground/60 text-xs font-bold rounded-xl hover:bg-foreground/15 transition-colors disabled:opacity-50"
                >
                  <MailOpen className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(selected.id)}
                disabled={actionLoading === selected.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} total messages
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary/50"
          >
            <option value="">All statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
            <p className="text-foreground/30 text-sm">
              No messages{statusFilter ? ` with status "${statusFilter}"` : ""}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground/20">
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right font-bold uppercase text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`cursor-pointer hover:bg-foreground/[0.03] transition-colors ${msg.status === "unread" ? "font-semibold" : ""}`}
                  >
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${STATUS_STYLES[msg.status]}`}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">{msg.name}</td>
                    <td className="px-6 py-4 text-xs text-foreground/50">
                      {msg.email}
                    </td>
                    <td className="px-6 py-4 text-foreground/60 max-w-[180px] truncate">
                      {msg.subject || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/40">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {msg.status === "unread" && (
                          <button
                            onClick={() => updateStatus(msg.id, "read")}
                            disabled={actionLoading === msg.id}
                            className="p-1.5 rounded-lg text-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                            title="Mark as read"
                          >
                            <MailOpen className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(msg.id)}
                          disabled={actionLoading === msg.id}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-foreground/40">
              Page {page} of {totalPages} ({total} messages)
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

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Supprimer le message"
        message="Êtes-vous sûr de vouloir supprimer ce message ?"
        confirmLabel="Supprimer"
        onConfirm={deleteMsg}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
