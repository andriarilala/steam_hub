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
    color: "text-emerald-600",
    bg: "bg-emerald-50 border border-emerald-200",
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
    color: "text-slate-600",
    bg: "bg-slate-100 border border-slate-200",
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

  const deleteApplication = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    setActionLoading(id);
    const res = await fetch(`/api/admin/applications?id=${id}`, {
      method: "DELETE",
    });
    setActionLoading(null);
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
            <h1 className="text-2xl font-bold text-[#2d2d2d]">
              Sponsor Applications
            </h1>
            <p className="text-sm text-[#8e8581] mt-1">
              {total} total applications
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-xl border border-[#f0ece9] bg-white text-[#8e8581] hover:text-[#ff5722] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b9b4]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact, email…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#f0ece9] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#f0ece9] bg-white text-sm text-[#8e8581] focus:outline-none"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === s ? cfg.bg + " " + cfg.color : "bg-[#f0ece9] text-[#8e8581] hover:bg-white"}`}
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
              <div className="w-6 h-6 border-4 border-[#f0ece9] border-t-[#ff5722] rounded-full animate-spin" />
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
                  className={`flex items-center gap-4 bg-white p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-[#ff5722] shadow-sm" : "border-[#f0ece9] hover:border-[#e0dbd8]"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f0ece9] flex items-center justify-center text-xs font-bold text-[#8e8581] shrink-0">
                    {app.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#2d2d2d] truncate">
                        {app.companyName}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} shrink-0`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#8e8581] truncate">
                      {app.contactName} · {app.email}
                    </p>
                  </div>
                  <p className="text-xs text-[#c0b9b4] shrink-0">
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
                className="p-2 rounded-lg border border-[#f0ece9] bg-white hover:border-[#ff5722] hover:text-[#ff5722] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#f0ece9] bg-white hover:border-[#ff5722] hover:text-[#ff5722] disabled:opacity-40 transition-colors"
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
          <div className="bg-white rounded-2xl border border-[#f0ece9] p-6 sticky top-0 overflow-y-auto max-h-full space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2d2d2d]">
                  {selected.companyName}
                </h2>
                <p className="text-xs text-[#8e8581]">
                  {new Date(selected.createdAt).toLocaleString()}
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
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-[#2d2d2d]">
                <Building2 className="w-4 h-4 text-[#8e8581]" />
                <span className="font-medium">{selected.contactName}</span>
                {selected.jobTitle && (
                  <span className="text-[#8e8581]">· {selected.jobTitle}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2d2d2d]">
                <Mail className="w-4 h-4 text-[#8e8581]" />
                <a
                  href={`mailto:${selected.email}`}
                  className="hover:text-[#ff5722] transition-colors"
                >
                  {selected.email}
                </a>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-2 text-sm text-[#2d2d2d]">
                  <Phone className="w-4 h-4 text-[#8e8581]" />
                  {selected.phone}
                </div>
              )}
            </div>

            {/* Sponsorship details */}
            <div className="bg-[#fbf9f8] rounded-xl p-4 space-y-2.5">
              {selected.sponsorshipInterest && (
                <div>
                  <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-0.5">
                    Sponsorship Interest
                  </p>
                  <p className="text-sm text-[#2d2d2d]">
                    {selected.sponsorshipInterest}
                  </p>
                </div>
              )}
              {selected.budget && (
                <div>
                  <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-0.5">
                    Budget
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {selected.budget}
                  </p>
                </div>
              )}
              {selected.partner && (
                <div>
                  <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-0.5">
                    Linked Partner
                  </p>
                  <p className="text-sm text-[#2d2d2d] font-medium">
                    {selected.partner.name}
                  </p>
                </div>
              )}
            </div>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-1.5">
                  Message
                </p>
                <p className="text-sm text-[#2d2d2d] leading-relaxed bg-[#fbf9f8] rounded-xl p-3">
                  {selected.message}
                </p>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-[#8e8581] uppercase tracking-wide mb-2">
                Update Status
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const isActive = selected.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => changeStatus(selected.id, s)}
                      disabled={isActive || actionLoading === selected.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? cfg.bg + " " + cfg.color : "bg-[#f0ece9] text-[#8e8581] hover:bg-white hover:text-[#2d2d2d]"} disabled:opacity-50`}
                    >
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label}
                      {isActive && <span className="ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteApplication(selected.id)}
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
    </div>
  );
}
