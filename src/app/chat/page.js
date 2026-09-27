export default function ChatPage() {
  return (
    <div className="flex h-full min-h-[500px] items-center justify-center bg-[#FFFFFF] text-[#000000] transition-colors dark:bg-[#000000] dark:text-[#FFFFFF]">
      <div className="max-w-sm px-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5] text-2xl transition-colors dark:bg-[#171717]">
          💬
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
          Akselera Chat
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#737373] dark:text-[#A3A3A3]">
          Pilih percakapan di sebelah kiri untuk mulai mengirim pesan.
        </p>
      </div>
    </div>
  );
}
