# Akselera.Tech Internal Chat
Akselera.Tech Internal Chat adalah aplikasi web chat internal yang dibuat sebagai bagian dari technical test Akselera.Tech. Aplikasi memungkinkan pengguna melakukan percakapan one-on-one secara realtime dengan autentikasi, penyimpanan pesan, pembatasan akses percakapan, light/dark mode, serta fitur tambahan seperti unread message, online status, dan read receipt.

## Features
### Main Features
- Login dan logout menggunakan akun pengguna.
- Halaman chat hanya dapat diakses oleh pengguna yang sudah login.
- Membuat percakapan baru dengan pengguna lain yang terdaftar.
- Percakapan one-on-one antar pengguna.
- Mengirim dan menerima pesan teks.
- Pesan tersimpan dan tetap tersedia setelah refresh atau login kembali.
- Daftar chat menampilkan nama pengguna, pesan terakhir, dan timestamp.
- Pengguna hanya dapat membaca conversation yang diikutinya.
- Light mode dan dark mode.
- Branding Akselera.Tech dengan font Nunito.

### Additional Features
- Realtime messaging.
- Realtime update daftar percakapan.
- Self-registration.
- Persistent theme preference.
- Unread message indicator.
- Search conversation.
- Online/offline status.
- Read receipt (`✓` terkirim dan `✓✓` dibaca).
- Responsive untuk desktop dan mobile.

## Tech Stack
- **Next.js 16** - framework aplikasi.
- **React** - membangun user interface.
- **JavaScript** - bahasa pemrograman.
- **Tailwind CSS** - styling dan responsive layout.
- **Supabase Authentication** - login, register, logout, dan session.
- **PostgreSQL (Supabase)** - penyimpanan data.
- **Row Level Security (RLS)** - pembatasan akses pada level database.
- **Supabase Realtime** - realtime message dan read receipt.
- **Supabase Presence** - online/offline status.

## Infrastructure Selection
Aplikasi menggunakan **Next.js** sebagai framework utama dan **Supabase** sebagai backend infrastructure. Pemilihan ini disesuaikan dengan kebutuhan aplikasi yang memerlukan autentikasi, penyimpanan data persisten, keamanan akses data, serta komunikasi realtime.

### Why Next.js?
Next.js dipilih karena dapat menangani kebutuhan frontend dan server-side dalam satu project. App Router memudahkan pengaturan halaman seperti `/login`, `/register`, `/chat`, dan `/chat/[id]`, sedangkan Server Component dapat digunakan untuk mengecek autentikasi dan mengambil data awal sebelum halaman diberikan kepada pengguna.

Untuk scope technical test ini, pendekatan tersebut membuat struktur aplikasi lebih sederhana karena tidak perlu membuat project frontend dan backend secara terpisah.

### Why Supabase?
Supabase dipilih karena menyediakan beberapa layanan yang dibutuhkan aplikasi dalam satu platform:
- **Authentication** untuk login, register, logout, dan session pengguna.
- **PostgreSQL** untuk menyimpan profil, conversation, member, dan messages.
- **Row Level Security** untuk membatasi akses data langsung pada level database.
- **Realtime** untuk menerima pesan dan perubahan read status tanpa refresh.
- **Presence** untuk mengetahui status online/offline pengguna.

Supabase juga mengurangi kebutuhan untuk membangun authentication server, database server, dan WebSocket server secara terpisah. Hal ini sesuai dengan scope technical test, tetapi keamanan data tetap dijaga melalui RLS dan validasi membership.

### Infrastructure Overview
```text
User / Browser
      |
      v
Next.js Application
      |
      v
Supabase
 ├── Authentication
 ├── PostgreSQL
 ├── Row Level Security
 ├── Realtime
 └── Presence
```

## Application Structure
Project menggunakan Next.js App Router dengan struktur utama:
```text
src/
├── app/
│   ├── chat/
│   │   ├── [id]/
│   │   ├── layout.js
│   │   └── page.js
│   ├── login/
│   └── register/
├── components/
│   ├── ChatMessages.js
│   ├── ChatShell.js
│   ├── ConversationSidebar.js
│   ├── LogoutButton.js
│   ├── MarkConversationRead.js
│   ├── NewChat.js
│   ├── OnlineStatus.js
│   ├── SendMessageForm.js
│   ├── ThemeToggle.js
│   └── UserPresence.js
└── lib/
    └── supabase/
        ├── client.js
        └── server.js
```

## Database
Database menggunakan PostgreSQL melalui Supabase dengan empat tabel utama:
- `profiles` - menyimpan profil pengguna.
- `conversations` - menyimpan conversation.
- `conversation_members` - menghubungkan pengguna dengan conversation dan menyimpan `last_read_at`.
- `messages` - menyimpan pesan, sender, conversation, dan waktu pengiriman.

Relasi sederhananya:
```text
profiles
   |
conversation_members
   |
conversations
   |
messages
```

## Authentication
Authentication menggunakan Supabase Auth. Pengguna yang belum login tidak dapat mengakses `/chat` maupun `/chat/[id]`. Setelah login berhasil, pengguna diarahkan ke halaman chat. Aplikasi juga menyediakan self-registration untuk membuat akun baru.

## Conversation
Pengguna dapat memilih pengguna lain melalui fitur **Chat Baru**. Sistem terlebih dahulu memeriksa apakah conversation antara kedua pengguna sudah tersedia. Jika sudah ada, conversation tersebut digunakan kembali. Jika belum ada, sistem membuat conversation baru sehingga conversation one-on-one yang sama tidak dibuat berulang kali.

## Realtime Messaging
Pesan disimpan pada tabel `messages` dan Supabase Realtime digunakan untuk menerima pesan baru tanpa refresh.
```text
User A mengirim pesan
        ↓
PostgreSQL menyimpan pesan
        ↓
Supabase Realtime
        ↓
User B menerima pesan
```
Karena pesan disimpan di database, pesan tetap tersedia setelah refresh, logout, maupun login kembali.

## Unread Message
Unread message menggunakan `last_read_at` pada `conversation_members`. Ketika pengguna membuka conversation, aplikasi memperbarui waktu terakhir conversation dibaca. Pesan yang dibuat setelah waktu tersebut dihitung sebagai pesan yang belum dibaca.

## Read Receipt
Pesan milik pengguna memiliki indikator:
```text
✓   = pesan terkirim tetapi belum dibaca
✓✓  = pesan sudah dibaca penerima
```
Status dibaca ditentukan dengan membandingkan `messages.created_at` dengan `conversation_members.last_read_at`. Perubahan `last_read_at` diterima melalui Realtime sehingga indikator dapat berubah menjadi `✓✓` tanpa refresh.

## Online Status
Online/offline status menggunakan Supabase Realtime Presence. Pengguna dianggap online selama masih terhubung dengan aplikasi chat. Online status tidak digunakan sebagai penentu read status karena pengguna dapat online tanpa membuka conversation tertentu.

## Security
Keamanan aplikasi tidak hanya diterapkan pada UI. Supabase Row Level Security digunakan untuk membatasi akses pada level database.
- Pengguna hanya dapat membaca conversation yang diikutinya.
- Pengguna hanya dapat membaca messages dari conversation yang diikutinya.
- Pengguna hanya dapat mengirim pesan menggunakan identitas akun yang sedang login.
- Membership diperiksa sebelum `/chat/[id]` ditampilkan.

Dengan demikian, pengguna tidak dapat membaca conversation pengguna lain hanya dengan mengganti conversation ID pada URL.

## Theme and Branding
Aplikasi mendukung light dan dark mode. Preferensi theme disimpan pada browser sehingga tetap digunakan ketika aplikasi dibuka kembali.

Branding menggunakan:
```text
Black        #000000
White        #FFFFFF
Neutral Gray
Font         Nunito
```
Black logo digunakan pada light mode dan white logo digunakan pada dark mode.

## Responsive Design
Pada desktop, aplikasi menggunakan layout dua panel berupa conversation list di sebelah kiri dan isi conversation di sebelah kanan. Pada mobile, daftar conversation dan halaman chat ditampilkan secara terpisah agar tetap nyaman digunakan pada layar kecil.

## Installation
Clone repository:
```bash
git clone <repository-url>
```
Masuk ke project:
```bash
cd akselera-chat
```
Install dependencies:
```bash
npm install
```

## Environment Variables
Buat `.env.local` pada root project dengan `.env.example` sebagai referensi:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```
File `.env.local` tidak disimpan ke repository.

## Running Locally
Jalankan:
```bash
npm run dev
```
Kemudian buka:
```text
http://localhost:3000
```

## Production Build
Untuk production build:
```bash
npm run build
```
Project telah berhasil melewati production build menggunakan **Next.js 16.3.6**.

## Testing
Pengujian yang telah dilakukan:
- Protected route untuk `/chat` dan `/chat/[id]`.
- Login dan logout.
- Membuat dan menggunakan kembali conversation one-on-one.
- Mengirim dan menerima pesan realtime.
- Persistence pesan setelah refresh dan login kembali.
- Last message dan timestamp pada conversation list.
- Direct URL access menggunakan akun yang bukan member conversation.
- Light dan dark mode.
- Unread message.
- Online/offline status.
- Read receipt realtime `✓ / ✓✓`.
- Responsive layout desktop dan mobile.
- Production build.

## Scope
Implementasi project difokuskan pada internal web chat. Integrasi WhatsApp API tidak termasuk dalam technical test ini. Struktur aplikasi dibuat sebagai fondasi yang dapat dikembangkan lebih lanjut untuk kebutuhan CRM dan integrasi channel komunikasi lainnya.

## Future Improvements
Pengembangan selanjutnya dapat mencakup WhatsApp API integration, file attachment, typing indicator, group conversation, notification system, message pagination, dan role/permission yang lebih kompleks.

## Author
**Dewinta Nur Istiqomah**  
Technical Test - Akselera.Tech