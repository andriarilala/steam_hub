"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  Building2,
  Phone,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Application {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  sponsorshipInterest: string | null;
  budget: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  partner: { id: string; name: string; slug: string } | null;
}

const STATUSES = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED", "COMPLETED"];

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border border-amber-200",
  },
  REVIEWED: {
    label: "Reviewed",
    icon: Eye,
    color: "text-blue-600",
    bg: "bg-blue-50 border border-blue-200",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    color: "text-slate-600",
    bg: "bg-slate-100 border border-slate-200",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border border-red-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-slate-900",
    bg: "bg-slate-100 border border-slate-900/10",
  },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/applications?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setApplications(d.applications || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const changeStatus = async (id: string, status: string) => {
    setActionLoading(id);
    const res = await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setActionLoading(null);
    if (res.ok) {
      showToast("Status updated");
      load();
      if (selected?.id === id) setSelected({ ...selected, status });
    } else showToast("Failed to update status");
  };

  const deleteApplication = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setActionLoading(id);
    const res = await fetch(`/api/admin/applications?id=${id}`, {
      method: "DELETE",
    });
    setActionLoading(null);
    setConfirmDelete(null);
    if (res.ok) {
      showToast("Deleted");
      setSelected(null);
      load();
    } else showToast("Failed to delete");
  };

  return (
    <div className="p-8 flex gap-6 h-[calc(100vh-5rem)]">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Left: List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sponsorship Applications
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {total} total applications
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm border border-slate-200 bg-white px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact, email…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Status summary bar */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = applications.filter((a) => a.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === s ? cfg.bg + " " + cfg.color : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                <cfg.icon className="w-3.5 h-3.5" />
                {cfg.label}{" "}
                {count > 0 && (
                  <span className="bg-white/60 rounded-full px-1">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-[#8e8581]">
              <Mail className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No applications found</p>
            </div>
          ) : (
            applications.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
              const isSelected = selected?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className={`flex items-center gap-4 bg-white p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-slate-900 shadow-sm" : "border-slate-100 hover:border-slate-300"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 border border-slate-100">
                    {app.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {app.companyName}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${cfg.bg} ${cfg.color} shrink-0`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {app.contactName} · {app.email}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium shrink-0">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-[#8e8581]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-900 hover:text-slate-950 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-900 hover:text-slate-950 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Detail panel */}
      <div
        className={`w-80 shrink-0 transition-all ${selected ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {selected && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-0 overflow-y-auto max-h-full space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {selected.companyName}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Applied on {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#8e8581] hover:text-[#2d2d2d] text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{selected.contactName}</span>
                {selected.jobTitle && (
                  <span className="text-slate-400 text-xs font-medium">· {selected.jobTitle}</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <a
                  href={`mailto:${selected.email}`}
                  className="hover:text-slate-900 transition-colors font-medium border-b border-transparent hover:border-slate-900"
                >
                  {selected.email}
                </a>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{selected.phone}</span>
                </div>
              )}
            </div>

            {/* Sponsorship details */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              {selected.sponsorshipInterest && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sponsorship Interest
                  </p>
                  <p className="text-[13px] text-slate-700 font-medium">
                    {selected.sponsorshipInterest}
                  </p>
                </div>
              )}
              {selected.budget && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Budget
                  </p>
                  <p className="text-sm text-slate-900 font-bold">
                    {selected.budget}
                  </p>
                </div>
              )}
              {selected.partner && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Linked Partner
                  </p>
                  <p className="text-sm text-slate-900 font-bold">
                    {selected.partner.name}
                  </p>
                </div>
              )}
            </div>

            {selected.message && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Message
                </p>
                <div className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-4 italic">
                  "{selected.message}"
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-2">
                Update Status
              </p>
              <div className="grid grid-cols-1 gap-2">
                {STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const isActive = selected.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => changeStatus(selected.id, s)}
                      disabled={isActive || actionLoading === selected.id}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-tight uppercase transition-all ${isActive ? cfg.bg + " " + cfg.color : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"} disabled:opacity-50`}
                    >
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label}
                      {isActive && <span className="ml-auto text-[10px]">CURRENT</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(selected.id)}
              disabled={actionLoading === selected.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              Delete Application
            </button>
          </div>
        )}
        {!selected && (
          <div className="flex flex-col items-center justify-center h-40 text-[#c0b9b4]">
            <Mail className="w-8 h-8 mb-2" />
            <p className="text-sm">Select an application</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Supprimer la candidature"
        message="Êtes-vous sûr de vouloir supprimer cette candidature ?"
        confirmLabel="Supprimer"
        onConfirm={deleteApplication}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
