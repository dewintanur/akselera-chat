"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import SendMessageForm from "@/components/SendMessageForm";

export default function ChatMessages({
  conversationId,
  userId,
  initialMessages = [],
  initialOtherUserLastReadAt = null,
}) {
  const [messages, setMessages] = useState(initialMessages);

  const [otherUserLastReadAt, setOtherUserLastReadAt] = useState(
    initialOtherUserLastReadAt,
  );

  const messagesEndRef = useRef(null);

  // =========================
  // SCROLL KE BAWAH
  // =========================
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (date1, date2) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    if (isSameDay(date, today)) {
      return "Hari ini";
    }

    if (isSameDay(date, yesterday)) {
      return "Kemarin";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // CEK SEPARATOR TANGGAL
  // =========================
  const shouldShowDate = (message, previousMessage) => {
    if (!previousMessage) {
      return true;
    }

    const currentDate = new Date(message.created_at);

    const previousDate = new Date(previousMessage.created_at);

    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate()
    );
  };

  // =========================
  // CEK PESAN SUDAH DIBACA
  // =========================
  const isMessageRead = (message) => {
    if (!otherUserLastReadAt) {
      return false;
    }

    const messageTime = new Date(message.created_at).getTime();

    const lastReadTime = new Date(otherUserLastReadAt).getTime();

    return messageTime <= lastReadTime;
  };

  // =========================
  // SYNC SAAT GANTI CHAT
  // =========================
  useEffect(() => {
    setMessages(initialMessages);

    setOtherUserLastReadAt(initialOtherUserLastReadAt);

    requestAnimationFrame(() => {
      scrollToBottom("auto");
    });
  }, [conversationId, initialMessages, initialOtherUserLastReadAt]);

  // =========================
  // REALTIME MESSAGE
  // =========================
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;

          setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (message) => message.id === newMessage.id,
            );

            if (alreadyExists) {
              return currentMessages;
            }

            return [...currentMessages, newMessage];
          });

          requestAnimationFrame(() => {
            scrollToBottom("smooth");
          });
        },
      )
      .subscribe((status) => {
        console.log("MESSAGE REALTIME STATUS:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // =========================
  // REALTIME READ RECEIPT
  // =========================
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`read-receipt-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMember = payload.new;

          // Abaikan update milik diri sendiri.
          // Kita hanya butuh last_read_at
          // milik lawan chat.
          if (updatedMember.user_id === userId) {
            return;
          }

          setOtherUserLastReadAt(updatedMember.last_read_at);
        },
      )
      .subscribe((status) => {
        console.log("READ RECEIPT STATUS:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-black transition-colors dark:bg-[#000000] dark:text-[#FFFFFF]">
      {/* =========================
          AREA PESAN
      ========================= */}
      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {messages.length > 0 ? (
          <div>
            {messages.map((message, index) => {
              const isMine = message.sender_id === userId;

              const read = isMine && isMessageRead(message);

              const previousMessage = messages[index - 1];

              const showDate = shouldShowDate(message, previousMessage);

              return (
                <div key={message.id}>
                  {/* =====================
                        DATE SEPARATOR
                    ===================== */}
                  {showDate && (
                    <div className="my-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200 dark:bg-[#262626]" />

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-[#171717] dark:text-[#A3A3A3]">
                        {formatDateLabel(message.created_at)}
                      </span>

                      <div className="h-px flex-1 bg-gray-200 dark:bg-[#262626]" />
                    </div>
                  )}

                  {/* =====================
                        MESSAGE
                    ===================== */}
                  <div
                    className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${isMine ? "bg-black text-white dark:bg-[#FFFFFF] dark:text-[#000000]" : "bg-gray-100 text-black dark:bg-[#262626] dark:text-[#FFFFFF]"}`}
                    >
                      <p className="break-words">{message.content}</p>

                      {/* =====================
                            TIME + READ RECEIPT
                        ===================== */}
                      <div
                        className={`mt-1 flex items-center gap-1 text-xs ${isMine ? "justify-end text-gray-300 dark:text-[#737373]" : "text-gray-400 dark:text-[#A3A3A3]"}`}
                      >
                        <span>
                          {message.created_at
                            ? new Date(message.created_at).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </span>

                        {/* HANYA PESAN SENDIRI */}
                        {isMine && (
                          <span
                            title={read ? "Sudah dibaca" : "Terkirim"}
                            className="font-bold"
                          >
                            {read ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AUTO SCROLL TARGET */}
            <div ref={messagesEndRef} className="h-px" />
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-[#737373]">
              Belum ada pesan. Mulai percakapan 👋
            </p>
          </div>
        )}
      </div>

      {/* =========================
          INPUT PESAN
      ========================= */}
      <div className="shrink-0 bg-white transition-colors dark:bg-[#000000]">
        <SendMessageForm conversationId={conversationId} userId={userId} />
      </div>
    </div>
  );
}
