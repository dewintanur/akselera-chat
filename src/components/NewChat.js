"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function NewChat({ users = [] }) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [loadingUserId, setLoadingUserId] = useState(null);

  const [error, setError] = useState("");

  // =========================
  // FILTER USER
  // =========================
  const filteredUsers = users.filter((user) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    const name = user.name?.toLowerCase() || "";

    const email = user.email?.toLowerCase() || "";

    return name.includes(keyword) || email.includes(keyword);
  });

  // =========================
  // START CHAT
  // =========================
  const handleStartChat = async (userId) => {
    if (loadingUserId) {
      return;
    }

    setLoadingUserId(userId);
    setError("");

    const supabase = createClient();

    const { data: conversationId, error: startError } = await supabase.rpc(
      "start_conversation",
      {
        other_user_id: userId,
      },
    );

    if (startError) {
      console.error("START CHAT ERROR:", startError);

      setError(startError.message);
      setLoadingUserId(null);

      return;
    }

    setIsOpen(false);
    setSearch("");
    setLoadingUserId(null);

    router.push(`/chat/${conversationId}`);

    router.refresh();
  };

  return (
    <>
      {/* =========================
          BUTTON CHAT BARU
      ========================= */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="
          shrink-0
          whitespace-nowrap
          rounded-full

          bg-[#000000]
          px-4
          py-2

          text-xs
          font-semibold
          text-[#FFFFFF]

          transition

          hover:bg-[#262626]

          dark:bg-[#FFFFFF]
          dark:text-[#000000]
          dark:hover:bg-[#E5E5E5]
        "
      >
        + Chat baru
      </button>

      {/* =========================
          MODAL
      ========================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[120px] sm:items-center sm:p-4">
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl

              border
              border-[#E5E5E5]

              bg-[#FFFFFF]
              text-[#000000]

              shadow-xl

              transition-colors

              dark:border-[#262626]
              dark:bg-[#000000]
              dark:text-[#FFFFFF]
            "
          >
            {/* =====================
                HEADER
            ===================== */}
            <div
              className="
                flex
                items-center
                justify-between

                border-b
                border-[#E5E5E5]

                px-5
                py-4

                dark:border-[#262626]
              "
            >
              <div>
                <h2 className="font-bold">Chat baru</h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#737373]

                    dark:text-[#A3A3A3]
                  "
                >
                  Pilih user untuk memulai percakapan
                </p>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                  setError("");
                }}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full

                  text-[#737373]

                  transition

                  hover:bg-[#F5F5F5]
                  hover:text-[#000000]

                  dark:text-[#A3A3A3]
                  dark:hover:bg-[#171717]
                  dark:hover:text-[#FFFFFF]
                "
              >
                ✕
              </button>
            </div>

            {/* =====================
                SEARCH USER
            ===================== */}
            <div className="p-4">
              <div
                className="
                  flex
                  items-center
                  rounded-xl

                  border
                  border-[#E5E5E5]

                  bg-[#F5F5F5]
                  px-3

                  transition-colors

                  dark:border-[#404040]
                  dark:bg-[#171717]
                "
              >
                <span className="mr-2 text-sm">🔍</span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  autoFocus
                  className="
                    w-full
                    bg-transparent
                    py-3
                    text-sm
                    text-[#000000]
                    outline-none

                    placeholder:text-[#A3A3A3]

                    dark:text-[#FFFFFF]
                    dark:placeholder:text-[#737373]
                  "
                />
              </div>
            </div>

            {/* =====================
                USER LIST
            ===================== */}
            <div className="max-h-[350px] overflow-y-auto px-3 pb-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isLoading = loadingUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={loadingUserId !== null}
                      onClick={() => handleStartChat(user.id)}
                      className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl

                          p-3
                          text-left

                          transition

                          hover:bg-[#F5F5F5]

                          disabled:opacity-50

                          dark:hover:bg-[#171717]
                        "
                    >
                      {/* AVATAR */}
                      <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full

                            bg-[#E5E5E5]

                            font-semibold
                            uppercase
                            text-[#000000]

                            dark:bg-[#262626]
                            dark:text-[#FFFFFF]
                          "
                      >
                        {user.name?.charAt(0) || "?"}
                      </div>

                      {/* USER INFO */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="
                              truncate
                              text-sm
                              font-semibold
                              capitalize

                              text-[#000000]
                              dark:text-[#FFFFFF]
                            "
                        >
                          {user.name}
                        </p>

                        <p
                          className="
                              mt-0.5
                              truncate
                              text-xs

                              text-[#737373]
                              dark:text-[#A3A3A3]
                            "
                        >
                          {user.email}
                        </p>
                      </div>

                      {/* LOADING */}
                      {isLoading && (
                        <span
                          className="
                              text-xs
                              text-[#737373]
                              dark:text-[#A3A3A3]
                            "
                        >
                          Membuka...
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <p
                    className="
                      text-sm
                      text-[#737373]
                      dark:text-[#A3A3A3]
                    "
                  >
                    User tidak ditemukan.
                  </p>
                </div>
              )}
            </div>

            {/* =====================
                ERROR
            ===================== */}
            {error && (
              <div
                className="
                  border-t
                  border-[#E5E5E5]
                  px-5
                  py-3

                  dark:border-[#262626]
                "
              >
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
