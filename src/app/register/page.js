"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nunito } from "next/font/google";

import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Nama wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
        },
      },
    });

    if (signUpError) {
      console.error("REGISTER ERROR:", signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/chat");
      router.refresh();
      return;
    }

    setSuccess("Akun berhasil dibuat. Silakan login.");
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  return (
    <main className={`${nunito.className} flex min-h-screen flex-col bg-[#FFFFFF] text-[#000000] transition-colors dark:bg-[#000000] dark:text-[#FFFFFF]`}>
      {/* =========================
          HEADER
      ========================= */}
      <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-[#FFFFFF] px-5 transition-colors dark:border-[#262626] dark:bg-[#000000] md:px-8">
        {/* LOGO */}
        <div className="flex min-w-0 items-center">
          {/* LIGHT MODE */}
          <img src="/Akselera Tech dark logo.png" alt="Akselera Tech" className="block h-[82px] w-auto object-contain dark:hidden" />

          {/* DARK MODE */}
          <img src="/Akselera Tech white logo.png" alt="Akselera.Tech" className="hidden h-[82px] w-auto object-contain dark:block" />
        </div>

        {/* THEME */}
        <ThemeToggle />
      </header>

      {/* =========================
          REGISTER CONTENT
      ========================= */}
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* TITLE */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold">
              Create account
            </h1>

            <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
              Create your account to start using Akselera Chat.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Name
              </label>

              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoComplete="name" className="w-full rounded-xl border border-[#D4D4D4] bg-[#FFFFFF] px-4 py-3 text-[#000000] outline-none transition placeholder:text-[#A3A3A3] focus:border-[#000000] dark:border-[#404040] dark:bg-[#171717] dark:text-[#FFFFFF] dark:placeholder:text-[#737373] dark:focus:border-[#737373]" />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required autoComplete="email" className="w-full rounded-xl border border-[#D4D4D4] bg-[#FFFFFF] px-4 py-3 text-[#000000] outline-none transition placeholder:text-[#A3A3A3] focus:border-[#000000] dark:border-[#404040] dark:bg-[#171717] dark:text-[#FFFFFF] dark:placeholder:text-[#737373] dark:focus:border-[#737373]" />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>

              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-[#D4D4D4] bg-[#FFFFFF] px-4 py-3 text-[#000000] outline-none transition placeholder:text-[#A3A3A3] focus:border-[#000000] dark:border-[#404040] dark:bg-[#171717] dark:text-[#FFFFFF] dark:placeholder:text-[#737373] dark:focus:border-[#737373]" />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Confirm Password
              </label>

              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-[#D4D4D4] bg-[#FFFFFF] px-4 py-3 text-[#000000] outline-none transition placeholder:text-[#A3A3A3] focus:border-[#000000] dark:border-[#404040] dark:bg-[#171717] dark:text-[#FFFFFF] dark:placeholder:text-[#737373] dark:focus:border-[#737373]" />
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {success}
              </p>
            )}

            {/* REGISTER BUTTON */}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#000000] py-3 font-bold text-[#FFFFFF] transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#FFFFFF] dark:text-[#000000] dark:hover:bg-[#E5E5E5]">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-6 text-center text-sm text-[#737373] dark:text-[#A3A3A3]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#000000] hover:underline dark:text-[#FFFFFF]">
              Sign in
            </Link>
          </p>

          {/* FOOTER */}
          <p className="mt-8 text-center text-xs text-[#A3A3A3] dark:text-[#737373]">
            Akselera.Tech Internal Communication
          </p>
        </div>
      </section>
    </main>
  );
}