"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Globe,
  Mail,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  Package,
  Save,
  Phone,
  X,
} from "lucide-react";

// ─── Additional types for edit modal ─────────────────────────────────────────

interface Opportunity {
  id?: string;
  title: string;
  description: string;
  level: string;
  type: string;
}
interface Testimonial {
  id?: string;
  quote: string;
  author: string;
  role: string;
}
interface SponsorPkg {
  packageType: string;
  budget: string;
  startDate: string;
  endDate: string;
  benefits: string;
  notes: string;
}
interface EditForm {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
  type: string;
  status: string;
  tagline: string;
  description: string;
  vision: string;
  impact: string;
  email: string;
  phone: string;
  website: string;
  locations: string;
  opportunities: Opportunity[];
  testimonials: Testimonial[];
  sponsorPackage: any;
}

const PACKAGES = ["INSTITUTIONAL", "IMPACT", "INNOVATION", "PREMIUM"];

const EMPTY_EDIT: EditForm = {
  id: "",
  name: "",
  slug: "",
  logo: "",
  category: "tech",
  type: "PARTNER",
  status: "ACTIVE",
  tagline: "",
  description: "",
  vision: "",
  impact: "",
  email: "",
  phone: "",
  website: "",
  locations: "",
  opportunities: [],
  testimonials: [],
  sponsorPackage: null,
};
const EMPTY_PKG: SponsorPkg = {
  packageType: "PREMIUM",
  budget: "",
  startDate: "",
  endDate: "",
  benefits: "",
  notes: "",
};

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  category: string;
  type: string;
  status: string;
  email: string | null;
  website: string | null;
  tagline: string | null;
  createdAt: string;
  _count: { applications: number; opportunities: number; testimonials: number };
  sponsorPackage: { packageType: string; budget: number | null } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  tech: "bg-blue-50 text-blue-700 border border-blue-200",
  finance: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  education: "bg-purple-50 text-purple-700 border border-purple-200",
  ngo: "bg-orange-50 text-orange-700 border border-orange-200",
  government: "bg-red-50 text-red-700 border border-red-200",
  other: "bg-gray-50 text-gray-700 border border-gray-200",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  ACTIVE: { label: "Active", icon: CheckCircle2, color: "text-emerald-600" },
  PENDING: { label: "Pending", icon: Clock, color: "text-amber-500" },
  INACTIVE: { label: "Inactive", icon: XCircle, color: "text-red-400" },
};

const CATEGORIES = [
  "tech",
  "finance",
  "education",
  "ngo",
  "government",
  "other",
];
const TYPES = ["PARTNER", "SPONSOR"];
const STATUSES = ["ACTIVE", "PENDING", "INACTIVE"];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // ── New partner modal state ───────────────────────────
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    category: "tech",
    type: "PARTNER",
    status: "ACTIVE",
    tagline: "",
    email: "",
    website: "",
    phone: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editId, setEditId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);
  const [editPkg, setEditPkg] = useState<SponsorPkg>(EMPTY_PKG);
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState<
    "info" | "opportunities" | "testimonials" | "sponsor"
  >("info");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/admin/partners?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPartners(d.partners || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, typeFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, categoryFilter]);

  const deletePartner = async (id: string, name: string) => {
    if (!confirm(`Delete partner "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    setActionLoading(null);
    if (res.ok) {
      showToast("Partner deleted");
      load();
    } else showToast("Failed to delete");
  };

  const createPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setCreating(false);
    if (res.ok) {
      showToast("Partner created");
      setShowNew(false);
      setNewForm({
        name: "",
        category: "tech",
        type: "PARTNER",
        status: "ACTIVE",
        tagline: "",
        email: "",
        website: "",
        phone: "",
      });
      load();
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to create");
    }
  };

  // ── Open edit modal ────────────────────────────────────────────────────────

  const openEdit = async (id: string) => {
    setEditId(id);
    setEditTab("info");
    setEditLoading(true);
    const res = await fetch(`/api/admin/partners/${id}`);
    const d = await res.json();
    setEditForm({
      ...d,
      locations: Array.isArray(d.locations) ? d.locations.join(", ") : "",
      opportunities: d.opportunities || [],
      testimonials: d.testimonials || [],
    });
    if (d.sponsorPackage) {
      setEditPkg({
        packageType: d.sponsorPackage.packageType || "PREMIUM",
        budget: d.sponsorPackage.budget?.toString() || "",
        startDate: d.sponsorPackage.startDate
          ? d.sponsorPackage.startDate.slice(0, 10)
          : "",
        endDate: d.sponsorPackage.endDate
          ? d.sponsorPackage.endDate.slice(0, 10)
          : "",
        benefits: Array.isArray(d.sponsorPackage.benefits)
          ? d.sponsorPackage.benefits.join(", ")
          : "",
        notes: d.sponsorPackage.notes || "",
      });
    } else {
      setEditPkg(EMPTY_PKG);
    }
    setEditLoading(false);
  };

  const closeEdit = () => {
    setEditId(null);
    setEditForm(EMPTY_EDIT);
    setEditPkg(EMPTY_PKG);
  };

  // ── Save edit ───────────────────────────────────────────────────────────────

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    const payload: any = {
      ...editForm,
      locations: editForm.locations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editForm.type === "SPONSOR") {
      payload.sponsorPackage = {
        packageType: editPkg.packageType,
        budget: editPkg.budget ? parseFloat(editPkg.budget) : null,
        startDate: editPkg.startDate || null,
        endDate: editPkg.endDate || null,
        benefits: editPkg.benefits
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        notes: editPkg.notes || null,
      };
    }
    const res = await fetch(`/api/admin/partners/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved successfully");
      closeEdit();
      load();
    } else {
      const d = await res.json();
      showToast(d.error || "Save failed");
    }
  };

  // ── Opportunity helpers ────────────────────────────────────────────────────

  const addOpportunity = () =>
    setEditForm({
      ...editForm,
      opportunities: [
        ...editForm.opportunities,
        { title: "", description: "", level: "", type: "" },
      ],
    });
  const updateOpportunity = (i: number, field: string, val: string) => {
    const ops = [...editForm.opportunities];
    ops[i] = { ...ops[i], [field]: val };
    setEditForm({ ...editForm, opportunities: ops });
  };
  const removeOpportunity = (i: number) =>
    setEditForm({
      ...editForm,
      opportunities: editForm.opportunities.filter((_, idx) => idx !== i),
    });

  // ── Testimonial helpers ────────────────────────────────────────────────────

  const addTestimonial = () =>
    setEditForm({
      ...editForm,
      testimonials: [
        ...editForm.testimonials,
        { quote: "", author: "", role: "" },
      ],
    });
  const updateTestimonial = (i: number, field: string, val: string) => {
    const ts = [...editForm.testimonials];
    ts[i] = { ...ts[i], [field]: val };
    setEditForm({ ...editForm, testimonials: ts });
  };
  const removeTestimonial = (i: number) =>
    setEditForm({
      ...editForm,
      testimonials: editForm.testimonials.filter((_, idx) => idx !== i),
    });

  // ── Edit tabs config ───────────────────────────────────────────────────────

  const editTabs = [
    { id: "info" as const, label: "General Info", icon: Building2 },
    {
      id: "opportunities" as const,
      label: `Opportunities (${editForm.opportunities.length})`,
      icon: Briefcase,
    },
    {
      id: "testimonials" as const,
      label: `Testimonials (${editForm.testimonials.length})`,
      icon: Star,
    },
    ...(editForm.type === "SPONSOR"
      ? [{ id: "sponsor" as const, label: "Sponsor Package", icon: Package }]
      : []),
  ];

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2d2d2d]">
            Partners & Sponsors
          </h1>
          <p className="text-sm text-[#8e8581] mt-1">{total} total partners</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#2d2d2d] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#ff5722] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0b9b4]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#f0ece9] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#f0ece9] bg-white text-sm text-[#8e8581] focus:outline-none"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#f0ece9] bg-white text-sm text-[#8e8581] focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          className="p-2 rounded-xl border border-[#f0ece9] bg-white text-[#8e8581] hover:text-[#ff5722] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#f0ece9] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-4 border-[#f0ece9] border-t-[#ff5722] rounded-full animate-spin" />
          </div>
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#8e8581]">
            <Building2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No partners found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0ece9] bg-[#fbf9f8]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Partner
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Package
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8e8581] uppercase tracking-wide">
                  Stats
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece9]">
              {partners.map((p) => {
                const statusCfg =
                  STATUS_CONFIG[p.status] || STATUS_CONFIG.INACTIVE;
                const StatusIcon = statusCfg.icon;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#fbf9f8] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#f0ece9] flex items-center justify-center text-xs font-bold text-[#8e8581]">
                          {p.logo || p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2d2d2d]">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#8e8581] truncate max-w-[180px]">
                            {p.tagline || p.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[p.category] || CATEGORY_COLORS.other}`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.type === "SPONSOR" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-600 border border-slate-200"}`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#8e8581]">
                      {p.sponsorPackage ? (
                        <div>
                          <span className="font-semibold text-[#2d2d2d]">
                            {p.sponsorPackage.packageType}
                          </span>
                          {p.sponsorPackage.budget && (
                            <div className="text-emerald-600">
                              ${p.sponsorPackage.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3 text-xs text-[#8e8581]">
                        <span title="Opportunities">
                          <Building2 className="w-3.5 h-3.5 inline mr-0.5" />
                          {p._count.opportunities}
                        </span>
                        <span title="Applications">
                          <Mail className="w-3.5 h-3.5 inline mr-0.5" />
                          {p._count.applications}
                        </span>
                        <span title="Testimonials">
                          <Star className="w-3.5 h-3.5 inline mr-0.5" />
                          {p._count.testimonials}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.website && (
                          <a
                            href={
                              p.website.startsWith("http")
                                ? p.website
                                : `https://${p.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-[#f0ece9] text-[#8e8581] hover:text-[#2d2d2d] transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(p.id)}
                          className="p-1.5 rounded-lg hover:bg-[#f0ece9] text-[#8e8581] hover:text-[#2d2d2d] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePartner(p.id, p.name)}
                          disabled={actionLoading === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#8e8581] hover:text-red-500 transition-colors disabled:opacity-40"
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm text-[#8e8581]">
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

      {/* New Partner Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="px-6 py-5 border-b border-[#f0ece9] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2d2d2d]">New Partner</h2>
              <button
                onClick={() => setShowNew(false)}
                className="text-[#8e8581] hover:text-[#2d2d2d] transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={createPartner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                  Name *
                </label>
                <input
                  required
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm({ ...newForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                    Category *
                  </label>
                  <select
                    required
                    value={newForm.category}
                    onChange={(e) =>
                      setNewForm({ ...newForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    value={newForm.type}
                    onChange={(e) =>
                      setNewForm({ ...newForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={newForm.status}
                    onChange={(e) =>
                      setNewForm({ ...newForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newForm.email}
                    onChange={(e) =>
                      setNewForm({ ...newForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                  Tagline
                </label>
                <input
                  value={newForm.tagline}
                  onChange={(e) =>
                    setNewForm({ ...newForm, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                  Website
                </label>
                <input
                  value={newForm.website}
                  onChange={(e) =>
                    setNewForm({ ...newForm, website: e.target.value })
                  }
                  placeholder="https://"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#f0ece9] text-sm text-[#8e8581] hover:bg-[#fbf9f8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#2d2d2d] text-white text-sm font-semibold hover:bg-[#ff5722] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Partner Modal ───────────────────────────────────────────── */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#f0ece9] flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#2d2d2d]">
                  {editForm.name || "Edit Partner"}
                </h2>
                {editForm.slug && (
                  <p className="text-xs text-[#8e8581] mt-0.5">
                    /{editForm.slug}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d2d2d] text-white text-sm font-semibold hover:bg-[#ff5722] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={closeEdit}
                  className="p-2 rounded-xl text-[#8e8581] hover:bg-[#f0ece9] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-[#f0ece9] shrink-0 overflow-x-auto">
              {editTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEditTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                      editTab === tab.id
                        ? "text-[#ff5722] border-b-2 border-[#ff5722] bg-orange-50/50"
                        : "text-[#8e8581] hover:text-[#2d2d2d]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {editLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-4 border-[#f0ece9] border-t-[#ff5722] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* ── General Info tab ── */}
                  {editTab === "info" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Name
                          </label>
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Slug
                          </label>
                          <input
                            value={editForm.slug}
                            onChange={(e) =>
                              setEditForm({ ...editForm, slug: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Category
                          </label>
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c} className="capitalize">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Type
                          </label>
                          <select
                            value={editForm.type}
                            onChange={(e) =>
                              setEditForm({ ...editForm, type: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          >
                            {TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Status
                          </label>
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                          Tagline
                        </label>
                        <input
                          value={editForm.tagline}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              tagline: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.description ?? ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Vision
                          </label>
                          <textarea
                            rows={2}
                            value={editForm.vision ?? ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                vision: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Impact
                          </label>
                          <textarea
                            rows={2}
                            value={editForm.impact ?? ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                impact: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            <Mail className="w-3.5 h-3.5 inline mr-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            <Phone className="w-3.5 h-3.5 inline mr-1" />
                            Phone
                          </label>
                          <input
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            <Globe className="w-3.5 h-3.5 inline mr-1" />
                            Website
                          </label>
                          <input
                            value={editForm.website}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                website: e.target.value,
                              })
                            }
                            placeholder="https://"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Locations
                          </label>
                          <input
                            value={editForm.locations}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                locations: e.target.value,
                              })
                            }
                            placeholder="Paris, London, Dakar"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                          Logo URL
                        </label>
                        <input
                          value={editForm.logo}
                          onChange={(e) =>
                            setEditForm({ ...editForm, logo: e.target.value })
                          }
                          placeholder="https://…"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Opportunities tab ── */}
                  {editTab === "opportunities" && (
                    <div className="space-y-4">
                      {editForm.opportunities.map((op, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-[#f0ece9] space-y-3 relative"
                        >
                          <button
                            onClick={() => removeOpportunity(i)}
                            className="absolute top-3 right-3 text-[#c0b9b4] hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                                Title
                              </label>
                              <input
                                value={op.title}
                                onChange={(e) =>
                                  updateOpportunity(i, "title", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                                Type
                              </label>
                              <input
                                value={op.type}
                                onChange={(e) =>
                                  updateOpportunity(i, "type", e.target.value)
                                }
                                placeholder="internship, grant…"
                                className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                              Level
                            </label>
                            <input
                              value={op.level}
                              onChange={(e) =>
                                updateOpportunity(i, "level", e.target.value)
                              }
                              placeholder="junior, senior…"
                              className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={op.description ?? ""}
                              onChange={(e) =>
                                updateOpportunity(
                                  i,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addOpportunity}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#f0ece9] text-sm text-[#8e8581] hover:border-[#ff5722] hover:text-[#ff5722] transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Opportunity
                      </button>
                    </div>
                  )}

                  {/* ── Testimonials tab ── */}
                  {editTab === "testimonials" && (
                    <div className="space-y-4">
                      {editForm.testimonials.map((ts, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-[#f0ece9] space-y-3 relative"
                        >
                          <button
                            onClick={() => removeTestimonial(i)}
                            className="absolute top-3 right-3 text-[#c0b9b4] hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div>
                            <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                              Quote
                            </label>
                            <textarea
                              rows={2}
                              value={ts.quote ?? ""}
                              onChange={(e) =>
                                updateTestimonial(i, "quote", e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                                Author
                              </label>
                              <input
                                value={ts.author}
                                onChange={(e) =>
                                  updateTestimonial(i, "author", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[#8e8581] mb-1 uppercase tracking-wide">
                                Role
                              </label>
                              <input
                                value={ts.role}
                                onChange={(e) =>
                                  updateTestimonial(i, "role", e.target.value)
                                }
                                placeholder="CEO, Manager…"
                                className="w-full px-3 py-2 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addTestimonial}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#f0ece9] text-sm text-[#8e8581] hover:border-[#ff5722] hover:text-[#ff5722] transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Testimonial
                      </button>
                    </div>
                  )}

                  {/* ── Sponsor Package tab ── */}
                  {editTab === "sponsor" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Package Type
                          </label>
                          <select
                            value={editPkg.packageType}
                            onChange={(e) =>
                              setEditPkg({
                                ...editPkg,
                                packageType: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          >
                            {PACKAGES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Budget ($)
                          </label>
                          <input
                            type="number"
                            value={editPkg.budget}
                            onChange={(e) =>
                              setEditPkg({ ...editPkg, budget: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={editPkg.startDate}
                            onChange={(e) =>
                              setEditPkg({
                                ...editPkg,
                                startDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={editPkg.endDate}
                            onChange={(e) =>
                              setEditPkg({
                                ...editPkg,
                                endDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                          Benefits (comma-separated)
                        </label>
                        <input
                          value={editPkg.benefits}
                          onChange={(e) =>
                            setEditPkg({ ...editPkg, benefits: e.target.value })
                          }
                          placeholder="Logo placement, Speaking slot…"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8e8581] mb-1.5 uppercase tracking-wide">
                          Notes
                        </label>
                        <textarea
                          rows={3}
                          value={editPkg.notes ?? ""}
                          onChange={(e) =>
                            setEditPkg({ ...editPkg, notes: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-[#f0ece9] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/30 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
