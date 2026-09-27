"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SendMessageForm({ conversationId, userId }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // KIRIM PESAN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || loading) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: cleanMessage,
    });

    if (error) {
      console.error("SEND MESSAGE ERROR:", error);

      setError(error.message);
      setLoading(false);

      return;
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white pt-4 transition-colors dark:border-[#262626] dark:bg-[#000000]">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* INPUT */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
          disabled={loading}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition placeholder:text-gray-400 focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-[#404040] dark:bg-[#171717] dark:text-[#FFFFFF] dark:placeholder:text-[#737373] dark:focus:border-[#737373] dark:disabled:bg-[#171717] dark:disabled:text-[#737373]"
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="shrink-0 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5]"
        >
          {loading ? "Mengirim..." : "Kirim"}
        </button>
      </form>

      {/* ERROR */}
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
