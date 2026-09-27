"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl bg-[#000000] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#262626] dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5]"
    >
      Logout
    </button>
  );
}
