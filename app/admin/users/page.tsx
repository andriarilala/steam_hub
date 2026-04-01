"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCog,
  Download,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  organization: string | null;
  createdAt: string;
  emailVerified: string | null;
}

const ALL_ROLES = [
  "youth",
  "company",
  "institution",
  "mentor",
  "sponsor",
  "admin",
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-slate-900 text-white border border-slate-900",
  youth: "bg-blue-50 text-blue-700 border border-blue-200",
  company: "bg-slate-100 text-slate-700 border border-slate-200",
  institution: "bg-purple-50 text-purple-700 border border-purple-200",
  mentor: "bg-blue-50/50 text-blue-600 border border-blue-100",
  sponsor: "bg-amber-50 text-amber-700 border border-amber-200",
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // userId
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // debounce search
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    setActionLoading(null);
    if (res.ok) {
      showToast("Role updated");
      load();
    } else {
      showToast("Failed to update role");
    }
  };

  const deleteUser = async () => {
    if (!confirmDelete) return;
    const { id: userId } = confirmDelete;
    setActionLoading(userId);
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: "DELETE",
    });
    setActionLoading(null);
    setConfirmDelete(null);
    if (res.ok) {
      showToast("User deleted");
      load();
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to delete");
    }
  };

  const exportUsersToPdf = () => {
    if (users.length === 0) {
      showToast("No users to export");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = users
      .map(
        (u, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(u.name || "")}</td>
            <td>${escapeHtml(u.email)}</td>
          </tr>
        `,
      )
      .join("");

    const content = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Liste des utilisateurs - Pass Avenir</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; color: #334155; }
            h1 { color: #0f172a; margin-bottom: 4px; font-size: 22px; }
            p { margin-bottom: 20px; font-size: 13px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 11px; color: #475569; }
            td:nth-child(1) { width: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>PASS AVENIR - LISTE DES UTILISATEURS</h1>
          <p>Exporté le: ${new Date().toLocaleString("fr-FR")} — Total: ${users.length} utilisateurs (page actuelle)</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 text-slate-800">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 mt-1">{total} registered accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportUsersToPdf}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
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
            placeholder="Search name or email…"
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-card border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-foreground/30 text-sm">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground/20">
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right font-bold uppercase text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="group hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      {u.name || (
                        <span className="text-foreground/30 italic">
                          unnamed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground/50 text-xs">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={actionLoading === u.id}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize border-0 focus:outline-none cursor-pointer ${ROLE_COLORS[u.role] || "bg-foreground/10 text-foreground/60"}`}
                      >
                        {ALL_ROLES.map((r) => (
                          <option
                            key={r}
                            value={r}
                            className="bg-card text-foreground"
                          >
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-foreground/50 text-xs">
                      {u.organization || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-tight ${u.emailVerified ? "bg-slate-100 text-slate-900" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                      >
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/40">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmDelete({ id: u.id, name: u.name || u.email })}
                        disabled={actionLoading === u.id}
                        className="p-1.5 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              Page {page} of {totalPages} ({total} users)
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
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${confirmDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={deleteUser}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
