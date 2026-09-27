import { redirect } from "next/navigation";
import { Nunito } from "next/font/google";

import { createClient } from "@/lib/supabase/server";

import ChatShell from "@/components/ChatShell";
import ConversationSidebar from "@/components/ConversationSidebar";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import UserPresence from "@/components/UserPresence";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export default async function ChatLayout({ children }) {
  const supabase = await createClient();

  // =========================
  // USER LOGIN
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================
  // PROFILE USER
  // =========================
  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("PROFILE ERROR:", profileError);
  }

  // =========================
  // CONVERSATIONS
  // =========================
  const { data: conversations, error: conversationsError } = await supabase.rpc(
    "get_my_conversations",
  );

  if (conversationsError) {
    console.error("CONVERSATIONS ERROR:", conversationsError);
  }

  // =========================
  // USERS
  // =========================
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .neq("id", user.id)
    .order("name");

  if (usersError) {
    console.error("USERS ERROR:", usersError);
  }

  // =========================
  // DISPLAY USER
  // =========================
  const displayName =
    currentProfile?.name || user.email?.split("@")[0] || "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main
      className={`${nunito.className} min-h-screen bg-[#F5F5F5] text-[#000000] transition-colors duration-300 dark:bg-[#000000] dark:text-[#FFFFFF] md:p-4`}
    >
      {/* =========================
          PRESENCE PROVIDER
      ========================= */}
      <UserPresence userId={user.id}>
        <div className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden bg-[#FFFFFF] transition-colors duration-300 dark:bg-[#000000] md:h-[calc(100vh-32px)] md:rounded-2xl md:border md:border-[#E5E5E5] md:shadow-sm md:dark:border-[#262626]">
          {/* =========================
              TOP HEADER
          ========================= */}
          <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-[#FFFFFF] px-4 transition-colors duration-300 dark:border-[#262626] dark:bg-[#000000] md:px-5">
            {/* =====================
                LOGO
            ===================== */}
            <div className="flex min-w-0 items-center">
              {/* LIGHT MODE */}
              <img
                src="/Akselera Tech dark logo.png"
                alt="Akselera Tech"
                className="block h-[80px] w-auto object-contain dark:hidden"
              />

              {/* DARK MODE */}
              <img
                src="/Akselera Tech white logo.png"
                alt="Akselera Tech"
                className="hidden h-[80px] w-auto object-contain dark:block"
              />
            </div>

            {/* =====================
                USER AREA
            ===================== */}
            <div className="flex items-center gap-3">
              {/* USER INFO */}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold capitalize text-[#000000] dark:text-[#FFFFFF]">
                  {displayName}
                </p>

                <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                  {currentProfile?.email || user.email}
                </p>
              </div>

              {/* AVATAR */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-xs font-bold text-[#000000] dark:bg-[#262626] dark:text-[#FFFFFF]">
                {initial}
              </div>

              {/* THEME */}
              <ThemeToggle />

              {/* LOGOUT */}
              <LogoutButton />
            </div>
          </header>

          {/* =========================
              CHAT CONTENT
          ========================= */}
          <div className="min-h-0 flex-1">
            <ChatShell
              sidebar={
                <ConversationSidebar
                  initialConversations={conversations || []}
                  currentUserId={user.id}
                  users={users || []}
                />
              }
            >
              {children}
            </ChatShell>
          </div>
        </div>
      </UserPresence>
    </main>
  );
}
