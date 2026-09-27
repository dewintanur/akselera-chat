"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const PresenceContext = createContext({
  onlineUserIds: [],
});

export function usePresence() {
  return useContext(PresenceContext);
}

export default function UserPresence({ userId, children }) {
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const supabase = createClient();

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    const syncPresence = () => {
      const state = channel.presenceState();

      const userIds = Object.keys(state);

      setOnlineUserIds(userIds);
    };

    channel
      .on("presence", { event: "sync" }, () => {
        syncPresence();
      })
      .on("presence", { event: "join" }, () => {
        syncPresence();
      })
      .on("presence", { event: "leave" }, () => {
        syncPresence();
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds }}>
      {children}
    </PresenceContext.Provider>
  );
}
