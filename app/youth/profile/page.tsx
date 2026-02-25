"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Mail,
  Shield,
  Building,
  Edit2,
  Save,
  X,
} from "lucide-react";

export default function YouthProfilePage() {
  const { user, isLoading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "?";

  const [form, setForm] = useState({
    name: user?.name ?? "",
    organization: (user as any)?.organization ?? "",
    bio: (user as any)?.bio ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 text-slate-800 text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
          Profil mis a jour
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Profil
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Vos informations personnelles
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(!editing);
            setForm({
              name: user?.name ?? "",
              organization: (user as any)?.organization ?? "",
              bio: (user as any)?.bio ?? "",
            });
          }}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all font-medium ${editing
              ? "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              : "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
            }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          {editing ? "Annuler" : "Modifier"}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Identity card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {initials}
            </div>

            <div>
              <p className="text-base font-bold text-slate-900">
                {user?.name ?? "—"}
              </p>
              <p className="text-sm text-slate-400 mt-0.5 capitalize">
                {user?.role ?? "youth"}
              </p>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-slate-100 pt-4 space-y-2.5 text-left w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {user?.email ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-500 capitalize">
                  {user?.role ?? "youth"}
                </span>
              </div>
              {(user as any)?.organization && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-500">
                    {(user as any).organization}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Editable details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Name */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Nom complet
            </label>
            {editing ? (
              <div className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-slate-500 transition-colors">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom complet"
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700">{user?.name ?? "—"}</span>
              </div>
            )}
          </div>

          {/* Organisation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Organisation / Ecole
            </label>
            {editing ? (
              <div className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 focus-within:border-slate-500 transition-colors">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) =>
                    setForm({ ...form, organization: e.target.value })
                  }
                  placeholder="Votre ecole ou organisation"
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700">
                  {(user as any)?.organization || (
                    <span className="text-slate-400 italic">Non renseigne</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Bio{" "}
              <span className="font-normal normal-case tracking-normal">
                (optionnel)
              </span>
            </label>
            {editing ? (
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Parlez un peu de vous..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors resize-none"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 min-h-[80px]">
                {(user as any)?.bio || (
                  <span className="text-slate-400 italic">
                    Aucune bio renseignee.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Save */}
          {editing && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
