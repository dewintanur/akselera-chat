"use client";

import { usePathname } from "next/navigation";

export default function ChatShell({ sidebar, children }) {
  const pathname = usePathname();

  const isConversationOpen = pathname.startsWith("/chat/");

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        bg-[#FFFFFF]
        transition-colors
        dark:bg-[#000000]
      "
    >
      {/* =========================
          SIDEBAR
      ========================= */}
      <aside
        className={`
          h-full
          shrink-0

          border-r
          border-[#E5E5E5]

          bg-[#FFFFFF]

          transition-colors

          dark:border-[#262626]
          dark:bg-[#000000]

          md:block
          md:w-[340px]

          ${isConversationOpen ? "hidden" : "w-full"}
        `}
      >
        {sidebar}
      </aside>

      {/* =========================
          CHAT AREA
      ========================= */}
      <section
        className={`
          min-w-0
          flex-1

          bg-[#FFFFFF]

          transition-colors

          dark:bg-[#000000]

          md:block

          ${isConversationOpen ? "block" : "hidden"}
        `}
      >
        {children}
      </section>
    </div>
  );
}
