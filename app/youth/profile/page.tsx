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
  Loader2,
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
    await new Promise((r) => setTimeout(r, 700)); // placeholder — wire to API when ready
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-[#1a2e25] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl z-50">
          ✓ Profil mis à jour
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#1a2e25]">Mon profil</h1>
        <p className="text-sm text-[#7aaa94] mt-0.5">
          Consultez et modifiez vos informations personnelles.
        </p>
      </div>

      {/* Avatar card */}
      <div className="bg-white border border-[#e2f0eb] rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#1a2e25] to-emerald-700" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-10 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {initials}
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
              className="flex items-center gap-1.5 text-xs border border-[#e2f0eb] px-3.5 py-2 rounded-xl hover:bg-[#f4fbf8] transition-colors font-semibold text-[#7aaa94]"
            >
              {editing ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <Edit2 className="w-3.5 h-3.5" />
              )}
              {editing ? "Annuler" : "Modifier"}
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-black text-[#1a2e25]">
              {user?.name ?? "—"}
            </h2>
            <p className="text-sm text-emerald-600 font-semibold capitalize">
              {user?.role ?? "youth"}
            </p>
          </div>
        </div>
      </div>

      {/* Info / edit card */}
      <div className="bg-white border border-[#e2f0eb] rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-black text-[#1a2e25] uppercase tracking-wider">
          Informations
        </h3>

        {/* E-mail — read only */}
        <div>
          <label className="block text-[10px] font-black text-[#9dbfb0] mb-1.5 uppercase tracking-wider">
            Adresse e-mail
          </label>
          <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-4 py-3 text-sm text-[#7aaa94]">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            {user?.email ?? "—"}
          </div>
        </div>

        {/* Role — read only */}
        <div>
          <label className="block text-[10px] font-black text-[#9dbfb0] mb-1.5 uppercase tracking-wider">
            Rôle
          </label>
          <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-4 py-3 text-sm text-[#7aaa94]">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="capitalize">{user?.role ?? "youth"}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[10px] font-black text-[#9dbfb0] mb-1.5 uppercase tracking-wider">
            Nom complet
          </label>
          {editing ? (
            <div className="flex items-center gap-2 border border-emerald-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 transition">
              <User className="w-4 h-4 text-emerald-400 shrink-0 ml-4" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom complet"
                className="flex-1 bg-transparent py-3 pr-4 text-sm text-[#1a2e25] placeholder:text-[#c5e0d5] focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-4 py-3 text-sm text-[#1a2e25]">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              {user?.name ?? "—"}
            </div>
          )}
        </div>

        {/* Organisation */}
        <div>
          <label className="block text-[10px] font-black text-[#9dbfb0] mb-1.5 uppercase tracking-wider">
            Organisation / École
          </label>
          {editing ? (
            <div className="flex items-center gap-2 border border-emerald-400 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 transition">
              <Building className="w-4 h-4 text-emerald-400 shrink-0 ml-4" />
              <input
                type="text"
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
                placeholder="Nom de votre école ou organisation"
                className="flex-1 bg-transparent py-3 pr-4 text-sm text-[#1a2e25] placeholder:text-[#c5e0d5] focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-4 py-3 text-sm text-[#1a2e25]">
              <Building className="w-4 h-4 text-emerald-400 shrink-0" />
              {(user as any)?.organization || (
                <span className="text-[#c5e0d5]">Non renseigné</span>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-[10px] font-black text-[#9dbfb0] mb-1.5 uppercase tracking-wider">
            Bio <span className="font-normal text-[#c5e0d5]">(optionnel)</span>
          </label>
          {editing ? (
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Parlez un peu de vous…"
              className="w-full bg-[#f4fbf8] border border-emerald-400 rounded-xl py-3 px-4 text-sm text-[#1a2e25] placeholder:text-[#c5e0d5] focus:outline-none focus:ring-2 focus:ring-emerald-200 transition resize-none"
            />
          ) : (
            <div className="bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-4 py-3 text-sm text-[#1a2e25] min-h-16">
              {(user as any)?.bio || (
                <span className="text-[#c5e0d5]">
                  Aucune bio pour le moment.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Save */}
        {editing && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
