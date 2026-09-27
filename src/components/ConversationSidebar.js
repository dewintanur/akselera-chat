"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import NewChat from "@/components/NewChat";

export default function ConversationSidebar({
  initialConversations = [],
  currentUserId,
  users = [],
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [search, setSearch] = useState("");

  const conversationsRef = useRef(initialConversations);

  const pathname = usePathname();

  // =========================
  // UPDATE STATE + REF
  // =========================
  const updateConversations = (value) => {
    setConversations((current) => {
      const nextValue = typeof value === "function" ? value(current) : value;

      conversationsRef.current = nextValue;

      return nextValue;
    });
  };

  // =========================
  // SYNC CONVERSATIONS
  // =========================
  useEffect(() => {
    setConversations(initialConversations);
    conversationsRef.current = initialConversations;
  }, [initialConversations]);

  // =========================
  // RESET UNREAD CHAT AKTIF
  // =========================
  useEffect(() => {
    if (!pathname.startsWith("/chat/")) {
      return;
    }

    const conversationId = pathname.split("/chat/")[1];

    if (!conversationId) {
      return;
    }

    updateConversations((current) =>
      current.map((conversation) =>
        conversation.conversation_id === conversationId
          ? {
              ...conversation,
              unread_count: 0,
            }
          : conversation,
      ),
    );
  }, [pathname]);

  // =========================
  // REALTIME SIDEBAR
  // =========================
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("sidebar-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new;

          const isMyMessage = newMessage.sender_id === currentUserId;

          const isCurrentConversation =
            pathname === `/chat/${newMessage.conversation_id}`;

          // =========================
          // AUTO MARK READ
          // =========================
          if (!isMyMessage && isCurrentConversation) {
            const { error } = await supabase.rpc("mark_conversation_read", {
              conversation_uuid: newMessage.conversation_id,
            });

            if (error) {
              console.error("AUTO MARK READ ERROR:", error);
            }
          }

          // =========================
          // CEK APAKAH CONVERSATION
          // SUDAH ADA DI SIDEBAR
          // =========================
          const conversationExists = conversationsRef.current.some(
            (conversation) =>
              conversation.conversation_id === newMessage.conversation_id,
          );

          // =========================
          // CONVERSATION BARU
          // FETCH ULANG SIDEBAR
          // =========================
          if (!conversationExists) {
            const { data: refreshedConversations, error: refreshError } =
              await supabase.rpc("get_my_conversations");

            if (refreshError) {
              console.error("REFRESH CONVERSATIONS ERROR:", refreshError);

              return;
            }

            updateConversations(refreshedConversations || []);

            return;
          }

          // =========================
          // CONVERSATION SUDAH ADA
          // UPDATE REALTIME
          // =========================
          updateConversations((current) => {
            const index = current.findIndex(
              (conversation) =>
                conversation.conversation_id === newMessage.conversation_id,
            );

            if (index === -1) {
              return current;
            }

            const conversation = current[index];

            let unreadCount = Number(conversation.unread_count || 0);

            // =========================
            // TAMBAH UNREAD
            // =========================
            if (!isMyMessage && !isCurrentConversation) {
              unreadCount += 1;
            }

            // =========================
            // CHAT SEDANG DIBUKA
            // =========================
            if (isCurrentConversation) {
              unreadCount = 0;
            }

            const updatedConversation = {
              ...conversation,
              last_message: newMessage.content,
              last_message_at: newMessage.created_at,
              unread_count: unreadCount,
            };

            const remaining = current.filter((_, i) => i !== index);

            // Chat terbaru pindah ke atas
            return [updatedConversation, ...remaining];
          });
        },
      )
      .subscribe((status) => {
        console.log("SIDEBAR REALTIME:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, pathname]);

  // =========================
  // SEARCH
  // =========================
  const filteredConversations = conversations.filter((conversation) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    const name = conversation.other_user_name?.toLowerCase() || "";

    const email = conversation.other_user_email?.toLowerCase() || "";

    const lastMessage = conversation.last_message?.toLowerCase() || "";

    return (
      name.includes(keyword) ||
      email.includes(keyword) ||
      lastMessage.includes(keyword)
    );
  });

  return (
    <div className="flex h-full flex-col bg-[#FFFFFF] text-[#000000] transition-colors dark:bg-[#000000] dark:text-[#FFFFFF]">
      {/* =========================
          SEARCH + CHAT BARU
      ========================= */}
      <div className="shrink-0 p-4">
        <div className="flex items-center gap-2">
          {/* SEARCH */}
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-3 transition-colors dark:border-[#404040] dark:bg-[#171717]">
            <span className="mr-2 text-xs">🔍</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari chat"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#000000] outline-none placeholder:text-[#A3A3A3] dark:text-[#FFFFFF] dark:placeholder:text-[#737373]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-[#A3A3A3] transition hover:text-[#000000] dark:text-[#737373] dark:hover:text-[#FFFFFF]"
              >
                ✕
              </button>
            )}
          </div>

          {/* CHAT BARU */}
          <NewChat users={users} />
        </div>
      </div>

      {/* =========================
          CONVERSATION LIST
      ========================= */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {/* BELUM ADA CHAT */}
        {conversations.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-[#A3A3A3] dark:text-[#737373]">
              Belum ada percakapan.
            </p>
          </div>
        )}

        {/* SEARCH TIDAK DITEMUKAN */}
        {conversations.length > 0 && filteredConversations.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-[#A3A3A3] dark:text-[#737373]">
              Chat tidak ditemukan.
            </p>
          </div>
        )}

        {/* =========================
            LIST CHAT
        ========================= */}
        {filteredConversations.map((conversation) => {
          const href = `/chat/${conversation.conversation_id}`;

          const isActive = pathname === href;

          const unreadCount = Number(conversation.unread_count || 0);

          return (
            <Link
              key={conversation.conversation_id}
              href={href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                isActive
                  ? "bg-[#F5F5F5] dark:bg-[#262626]"
                  : "hover:bg-[#F5F5F5] dark:hover:bg-[#171717]"
              }`}
            >
              {/* AVATAR */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5E5E5] text-sm font-bold uppercase text-[#000000] dark:bg-[#262626] dark:text-[#FFFFFF]">
                {conversation.other_user_name?.charAt(0) || "?"}
              </div>

              {/* INFO CHAT */}
              <div className="min-w-0 flex-1">
                {/* NAME + TIME */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-sm capitalize text-[#000000] dark:text-[#FFFFFF] ${
                      unreadCount > 0 ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {conversation.other_user_name}
                  </p>

                  {conversation.last_message_at && (
                    <span className="shrink-0 text-[11px] text-[#A3A3A3] dark:text-[#737373]">
                      {new Date(
                        conversation.last_message_at,
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {/* MESSAGE + UNREAD */}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-xs ${
                      unreadCount > 0
                        ? "font-medium text-[#000000] dark:text-[#FFFFFF]"
                        : "text-[#A3A3A3] dark:text-[#737373]"
                    }`}
                  >
                    {conversation.last_message || "Belum ada pesan"}
                  </p>

                  {/* UNREAD BADGE */}
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#000000] px-1.5 text-[10px] font-bold text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
