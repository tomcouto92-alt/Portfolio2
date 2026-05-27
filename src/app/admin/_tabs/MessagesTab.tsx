"use client";

import { useEffect, useState } from "react";
import { getContactMessages, deleteContactMessage, type ContactMessage } from "@/lib/supabase";

export default function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyEmail(id: string, email: string) {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getContactMessages();
    setMessages(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    setDeletingId(id);
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl tracking-tight">Mensajes recibidos</h2>
          <p className="text-[var(--p-muted)] text-sm mt-1">
            {messages.length === 0
              ? "Todavía no hay mensajes."
              : `${messages.length} mensaje${messages.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={load}
          className="text-sm text-[var(--p-muted)] hover:text-white transition-colors px-4 py-2 border border-white/10 rounded-full"
        >
          Actualizar
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl text-[var(--p-muted)] text-sm">
          Cuando alguien complete el formulario de contacto, los mensajes aparecen acá.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{msg.name}</div>
                  <button
                    onClick={() => copyEmail(msg.id, msg.email)}
                    className="text-sm text-[var(--p-muted)] hover:text-white transition-colors truncate max-w-full block"
                  >
                    {copiedId === msg.id ? "✓ Copiado" : msg.email}
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[var(--p-muted)] whitespace-nowrap">{formatDate(msg.created_at)}</span>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={deletingId === msg.id}
                    className="w-8 h-8 flex items-center justify-center border border-red-400/20 text-red-400 rounded-full hover:bg-red-400/10 transition-colors text-lg leading-none disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--p-muted)] leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-3">
                {msg.message}
              </p>
              <button
                onClick={() => copyEmail(msg.id, msg.email)}
                className="inline-block text-xs border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 transition-colors"
              >
                {copiedId === msg.id ? "✓ Email copiado" : "Copiar email"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
