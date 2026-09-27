import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ChatMessages from "@/components/ChatMessages";
import MarkConversationRead from "@/components/MarkConversationRead";
import OnlineStatus from "@/components/OnlineStatus";

export default async function ConversationPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();

  // =========================
  // CEK USER LOGIN
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================
  // CEK MEMBER CONVERSATION
  // =========================
  const { data: isMember, error: memberError } = await supabase.rpc(
    "is_conversation_member",
    {
      conversation_uuid: id,
    },
  );

  if (memberError) {
    console.error("MEMBER ERROR:", memberError);

    notFound();
  }

  if (!isMember) {
    notFound();
  }

  // =========================
  // AMBIL USER LAWAN CHAT
  // + LAST READ
  // =========================
  const { data: members, error: membersError } = await supabase
    .from("conversation_members")
    .select(
      `
      user_id,
      last_read_at,
      profiles (
        id,
        name,
        email
      )
    `,
    )
    .eq("conversation_id", id)
    .neq("user_id", user.id);

  if (membersError) {
    console.error("MEMBERS ERROR:", membersError);
  }

  const otherUser = members?.[0]?.profiles;

  const otherUserLastReadAt = members?.[0]?.last_read_at || null;

  // =========================
  // AMBIL PESAN
  // =========================
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      sender_id,
      created_at
    `,
    )
    .eq("conversation_id", id)
    .order("created_at", {
      ascending: true,
    });

  if (messagesError) {
    console.error("MESSAGES ERROR:", messagesError);
  }

  return (
    <main className="flex h-full min-h-0 flex-col bg-white px-4 py-4 text-black transition-colors dark:bg-[#000000] dark:text-[#FFFFFF] sm:px-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col">
        {/* =========================
            MOBILE BACK BUTTON
        ========================= */}
        <Link
          href="/chat"
          className="mb-3 inline-block shrink-0 text-sm text-gray-500 transition hover:text-black dark:text-[#A3A3A3] dark:hover:text-[#FFFFFF] md:hidden"
        >
          ← Kembali
        </Link>

        {/* =========================
            CHAT HEADER
        ========================= */}
        <header className="shrink-0 border-b border-gray-200 pb-4 transition-colors dark:border-[#262626]">
          <h1 className="text-2xl font-bold capitalize text-black dark:text-[#FFFFFF]">
            {otherUser?.name || "Conversation"}
          </h1>

          {otherUser?.id ? (
            <OnlineStatus otherUserId={otherUser.id} />
          ) : (
            <p className="mt-1 text-sm text-gray-500 dark:text-[#A3A3A3]">
              Internal Chat
            </p>
          )}
        </header>

        {/* =========================
            MARK CHAT AS READ
        ========================= */}
        <MarkConversationRead conversationId={id} />

        {/* =========================
            MESSAGES
        ========================= */}
        <div className="min-h-0 flex-1">
          <ChatMessages
            conversationId={id}
            userId={user.id}
            initialMessages={messages || []}
            initialOtherUserLastReadAt={otherUserLastReadAt}
          />
        </div>
      </div>
    </main>
  );
}
