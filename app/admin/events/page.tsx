"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Calendar,
  MapPin,
  Phone,
  DollarSign,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: string | null;
  price: number | null;
  phone_number: string | null;
  createdAt: string;
}

const EVENT_TYPES = [
  "Keynote",
  "Workshop",
  "Networking",
  "Panel",
  "Showcase",
  "Ceremony",
  "Other",
];

const empty = (): Partial<Event> => ({
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  type: "Workshop",
  price: undefined,
  phone_number: "",
});

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Partial<Event>>(empty());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then((d) => {
        setEvents(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(empty());
    setModal("create");
  };

  const openEdit = (ev: Event) => {
    setForm({
      ...ev,
      date: new Date(ev.date).toISOString().slice(0, 16), // for datetime-local input
    });
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setForm(empty());
  };

  const save = async () => {
    if (!form.title || !form.date)
      return showToast("Title and date are required");
    setSaving(true);
    const isEdit = modal === "edit";
    const res = await fetch("/api/admin/events", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    let d;
    try {
      const text = await res.text();
      d = text ? JSON.parse(text) : {};
    } catch (e) {
      d = { error: "Invalid server response" };
    }

    if (res.ok) {
      showToast(isEdit ? "Event updated" : "Event created");
      closeModal();
      load();
    } else {
      showToast(d.error || `Server error (${res.status})`);
    }
  };

  const deleteEvent = async (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      showToast("Event deleted");
      load();
    } else showToast("Failed to delete");
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-50 text-slate-800">
          {toast}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold">
                {modal === "create" ? "Create Event" : "Edit Event"}
              </h2>
              <button
                onClick={closeModal}
                className="text-foreground/30 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Event title"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional description"
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={
                      form.date
                        ? new Date(form.date).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time: e.target.value }))
                    }
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Location / Venue
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="e.g. Accra, Ghana or Online"
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={form.type || "Workshop"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Ticket Price (Ar)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      placeholder="e.g. 5000"
                      className="w-full bg-background border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input
                      type="text"
                      value={form.phone_number || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone_number: e.target.value }))
                      }
                      placeholder="e.g. +226 70 00 00 00"
                      className="w-full bg-background border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 text-sm bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : modal === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            {events.length} events in total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 text-sm bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Event
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
            <p className="text-foreground/30 text-sm">No events yet</p>
            <button
              onClick={openCreate}
              className="mt-4 text-xs text-primary font-bold"
            >
              Create the first event →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground/20">
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-[10px]">
                    Location
                  </th>
                  <th className="px-6 py-4 text-right font-bold uppercase text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                      {ev.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-md">
                        {ev.type || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/50">
                      <div>{new Date(ev.date).toLocaleDateString()}</div>
                      <div className="text-[10px] font-bold text-primary mt-0.5">
                        {ev.time || "--:--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-primary">
                      {ev.price != null
                        ? `${ev.price.toLocaleString()} Ar`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/50">
                      {ev.phone_number || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary/40" />
                        <span className="truncate max-w-[150px]">
                          {ev.location || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 rounded-lg text-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(ev.id, ev.title)}
                        disabled={deleting === ev.id}
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
      </div>
    </div>
  );
}
