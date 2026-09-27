"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MarkConversationRead({ conversationId }) {
  useEffect(() => {
    const markAsRead = async () => {
      const supabase = createClient();

      const { error } = await supabase.rpc("mark_conversation_read", {
        conversation_uuid: conversationId,
      });

      if (error) {
        console.error("MARK READ ERROR:", error);
      }
    };

    markAsRead();
  }, [conversationId]);

  return null;
}
