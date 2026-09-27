"use client";

import { usePresence } from "@/components/UserPresence";

export default function OnlineStatus({ otherUserId }) {
  const { onlineUserIds } = usePresence();

  const isOnline = onlineUserIds.includes(otherUserId);

  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-[#A3A3A3] dark:bg-[#737373]"}`}
      />

      <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
