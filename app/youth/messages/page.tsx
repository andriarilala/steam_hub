"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  User,
  Circle,
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string };
  receiver: { id: string; name: string | null; email: string };
}

interface Conversation {
  contact: { id: string; name: string | null; email: string };
  messages: Message[];
  unread: number;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string | null, email: string) {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return email[0].toUpperCase();
}

export default function YouthMessagesPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/connections/messages")
      .then((r) => r.json())
      .then((data: Message[]) => {
        if (!Array.isArray(data) || !user) {
          setConversations([]);
          setLoading(false);
          return;
        }
        const map = new Map<string, Conversation>();
        for (const msg of data) {
          const contact = msg.senderId === user.id ? msg.receiver : msg.sender;
          if (!map.has(contact.id))
            map.set(contact.id, { contact, messages: [], unread: 0 });
          map.get(contact.id)!.messages.push(msg);
        }
        const convs = Array.from(map.values()).map((c) => ({
          ...c,
          messages: c.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        }));
        setConversations(convs);
        if (convs.length > 0 && !active) setActive(convs[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  const handleSend = async () => {
    if (!text.trim() || !active || !user) return;
    setSending(true);
    try {
      const res = await fetch("/api/connections/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: active.contact.id,
          content: text.trim(),
        }),
      });
      if (res.ok) {
        setText("");
        load();
      }
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) =>
    (c.contact.name ?? c.contact.email)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-[#e2f0eb] rounded-2xl overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-[#e2f0eb] flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-[#e2f0eb]">
          <h2 className="text-base font-black text-[#1a2e25] mb-3">Messages</h2>
          <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-[#9dbfb0] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent text-xs text-[#1a2e25] placeholder:text-[#c5e0d5] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#c5e0d5]" />
              <p className="text-xs text-[#9dbfb0]">Aucune conversation</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const last = conv.messages.at(-1);
              const isActive = active?.contact.id === conv.contact.id;
              return (
                <button
                  key={conv.contact.id}
                  onClick={() => setActive(conv)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#f0f8f4] flex items-center gap-3 hover:bg-[#f4fbf8] transition-colors ${isActive ? "bg-emerald-50" : ""}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold shrink-0">
                    {getInitials(conv.contact.name, conv.contact.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${isActive ? "font-black text-emerald-700" : "font-semibold text-[#1a2e25]"}`}
                    >
                      {conv.contact.name ?? conv.contact.email}
                    </p>
                    {last && (
                      <p className="text-xs text-[#9dbfb0] truncate">
                        {last.content}
                      </p>
                    )}
                  </div>
                  {last && (
                    <span className="text-[10px] text-[#b0cfc5] shrink-0">
                      {formatTime(last.createdAt)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat panel ────────────────────────────────────── */}
      {active ? (
        <div className="flex-1 flex flex-col">
          {/* Contact header */}
          <div className="px-5 py-4 border-b border-[#e2f0eb] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
              {getInitials(active.contact.name, active.contact.email)}
            </div>
            <div>
              <p className="text-sm font-black text-[#1a2e25]">
                {active.contact.name ?? active.contact.email}
              </p>
              <p className="text-xs text-[#9dbfb0]">{active.contact.email}</p>
            </div>
            <Circle className="w-2.5 h-2.5 text-emerald-400 ml-auto fill-current" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {active.messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? "bg-[#1a2e25] text-white rounded-br-sm"
                        : "bg-[#f4fbf8] border border-[#e2f0eb] text-[#1a2e25] rounded-bl-sm"
                    }`}
                  >
                    <p className="leading-snug">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${isMine ? "text-white/40" : "text-[#9dbfb0]"}`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 pb-5 pt-3 border-t border-[#e2f0eb]">
            <div className="flex items-center gap-2 bg-[#f4fbf8] border border-[#e2f0eb] rounded-2xl px-4 py-2.5 focus-within:border-emerald-400 transition">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Écrire un message…"
                className="flex-1 bg-transparent text-sm text-[#1a2e25] placeholder:text-[#c5e0d5] focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-8 h-8 rounded-xl bg-[#1a2e25] hover:bg-emerald-700 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-[#c5e0d5]" />
            <p className="text-[#9dbfb0] text-sm">
              Sélectionnez une conversation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
