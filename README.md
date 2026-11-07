# 🎮 Controller-PS

Aplikasi pengubah smartphone Android menjadi **PlayStation Controller (DualShock / DualSense)** nirkabel untuk bermain game di Laptop / PC via **WiFi / Hotspot (PC Server)** dan **Bluetooth HID Direct**.

Mendukung hingga **4 Pemain Sekaligus (Multiplayer)** dalam 1 laptop untuk bermain **PES / eFootball, FIFA, Overcooked, Tekken, Naruto Shippuden, Party Animals, emulator PS2/PS3**, dan semua game PC lainnya!

---

## 📥 Download File APK Siap Pasang

File APK rilis sudah langsung tersedia di repositori ini dan bisa langsung diunduh ke HP Anda:

👉 **[Unduh Controller-PS-v1.0.0.apk](https://github.com/hanmeini/Controller-PS/raw/main/releases/Controller-PS-v1.0.0.apk)** *(Ukuran: ~29 MB)*

---

## 📱 Panduan Penginstalan di HP Android

Ikuti langkah-langkah mudah berikut untuk memasang aplikasi di HP Anda:

### Langkah 1: Unduh File APK ke HP
1. Buka browser (Google Chrome) di HP Anda.
2. Buka link download APK di atas:  
   `https://github.com/hanmeini/Controller-PS/raw/main/releases/Controller-PS-v1.0.0.apk`
3. Tunggu hingga proses pengunduhan selesai.

### Langkah 2: Izinkan Penginstalan dari Sumber Tak Dikenal (*Unknown Sources*)
Jika ini pertama kali Anda menginstal file APK dari luar Play Store:
1. Buka notifikasi unduhan selesai, atau buka aplikasi **File Manager / Pengelola File** $\rightarrow$ buka folder **Download**.
2. Tap file **`Controller-PS-v1.0.0.apk`**.
3. Jika muncul pesan *"Demi keamanan, ponsel Anda tidak diizinkan memasang aplikasi yang tidak dikenal dari sumber ini"*:
   - Tap tombol **Setelan / Settings**.
   - Aktifkan toggle **"Izinkan dari sumber ini"** (*Allow from this source*).
   - Tekan tombol kembali (*Back*).

### Langkah 3: Selesaikan Pemasangan
1. Tap tombol **Pasang / Install**.
2. Tunggu beberapa detik hingga proses instalasi selesai.
3. Tap **Buka / Open**.
4. Berikan izin Bluetooth & Jaringan saat aplikasi meminta izin pertama kali.
5. Aplikasi akan langsung terkunci ke tampilan horizontal (*Landscape*) menyerupai stik konsol PS asli.

---

## 💻 Panduan Penginstalan & Persiapan di Laptop / PC

Untuk bermain game PC seperti PES / FIFA dengan respon tombol instan dan dukungan hingga 4 stik virtual, gunakan program receiver di folder `pc-server`.

### Persyaratan Awal:
* Laptop menggunakan sistem operasi **Windows 10 / 11** (didukung juga untuk Linux & macOS).
* Sudah terpasang **Python** (versi 3.8 ke atas).  
  *(Jika belum punya Python, unduh gratis di [python.org](https://www.python.org/downloads/) dan pastikan centang opsi **"Add python.exe to PATH"** saat instalasi).*

---

### Cara Menjalankan di Windows (1-Klik Praktis)

1. **Unduh Repositori ini ke Laptop**:
   * Klik tombol hijau **Code** di atas $\rightarrow$ pilih **Download ZIP**, lalu ekstrak filenya di laptop Anda.  
   *(Atau lewat git: `git clone https://github.com/hanmeini/Controller-PS.git`)*
2. Buka folder **`Controller-PS`** $\rightarrow$ masuk ke subfolder **`pc-server`**.
3. Klik kanan file **`start-windows.bat`** $\rightarrow$ pilih **Run as administrator** (atau klik 2x biasa).
4. Script akan otomatis memasang paket dependensi yang dibutuhkan (`vgamepad`, `websockets`, `colorama`).
5. Terminal akan menampilkan tulisan:
   ```text
   ==================================================================
         🎮  CONTROLLER-PS - 4-PLAYER LAPTOP RECEIVER SERVER  🎮
   ==================================================================
   Sistem Operasi   : Windows (10/11)
   Kapasitas Pemain : Hingga 4 Orang Sekaligus (Multiplayer Co-op / Versus)
   Emulasi Virtual  : Virtual Xbox 360 Gamepad (XInput Slot 1-4) AKTIF

   Hubungkan ke-4 HP Anda ke:
     👉  IP Laptop : ws://192.168.1.15:8765
     👉  Port      : 8765
   ==================================================================
   Menunggu koneksi dari pemain...
   ```
6. **Catatan Windows Firewall**: Jika muncul kotak dialog *"Windows Security Alert / Firewall"*, centang kedua opsi (**Private networks** & **Public networks**), lalu klik **Allow access**.

---

### Alternatif Manual via Terminal / Command Prompt (CMD)

Jika ingin menjalankan secara manual via CMD / PowerShell / Terminal:
```bash
# 1. Masuk ke folder pc-server
cd pc-server

# 2. Pasang dependensi
pip install -r requirements.txt

# 3. Jalankan server
python server.py
```

---

## ⚽ Cara Bermain Game PES / eFootball (1 s/d 4 Pemain)

Setelah server di laptop menyala dan aplikasi terpasang di HP:

### 1. Hubungkan HP ke Jaringan Laptop
* Pastikan HP dan Laptop terhubung ke **WiFi yang sama**, **ATAU**
* Jika tidak ada router WiFi, nyalakan **Hotspot Pribadi** dari HP Anda dan hubungkan laptop ke hotspot tersebut (tidak membutuhkan kuota internet).

### 2. Hubungkan Stik HP ke Laptop
1. Buka aplikasi **PS Controller** di HP.
2. Tap tombol status koneksi di bagian tengah atas layar (yang bertuliskan *"Pilih Koneksi"*).
3. Pilih tab **PC Server (WiFi / Hotspot)**.
4. Masukkan alamat IP yang muncul di layar terminal laptop Anda (contoh: `192.168.1.15:8765`).
5. Tekan tombol **Hubungkan**.
6. Status akan langsung berubah hijau **"Terhubung ke Laptop"**.
7. Touchpad di HP Anda akan menyala dengan warna nomor pemain Anda:
   * 🔵 **Player 1**: Biru
   * 🔴 **Player 2**: Merah
   * 🟢 **Player 3**: Hijau
   * 🟣 **Player 4**: Ungu / Pink

*(Jika bermain beramai-ramai 2–4 orang, minta teman Anda melakukan langkah 1–5 di HP masing-masing).*

### 3. Konfigurasi PES & Mulai Tanding
1. Masuk ke folder instalasi game PES Anda di laptop (misal: PES 2013, 2017, 2021, dll).
2. Buka file **`Settings.exe`**.
3. Klik tab **Controller**:
   * Pada kolom **Controller 1**, pilih `DirectInput` atau `XInput` $\rightarrow$ kontroler akan otomatis terdeteksi sebagai **"Controller (XBOX 360 For Windows)"**.
   * Jika ada 2–4 pemain, cek tab **Controller 2, 3, dan 4**, semuanya akan otomatis terhubung ke HP masing-masing.
   * Klik **OK**.
4. Buka game PES Anda $\rightarrow$ masuk ke menu **Exhibition Match**.
5. Pada layar pemilihan sisi (*Select Side*), geser ikon kontroler HP Anda ke tim **Home** atau **Away**!

---

## 🎮 Mapping Tombol Standar PES

| Tombol HP | Fungsi di PES (Menyerang) | Fungsi di PES (Bertahan) |
| :--- | :--- | :--- |
| **✕ (Cross / Silang)** | Umpan Pendek / Operan Datar | Merebut Bola (*Pressing*) |
| **□ (Square / Kotak)** | Tembakan ke Gawang (*Shoot*) | Buang Bola (*Clearance*) |
| **○ (Circle / Lingkaran)** | Umpan Lambung / *Crossing* | *Sliding Tackle* |
| **△ (Triangle / Segitiga)** | Umpan Terobos (*Through Ball*) | Kiper Maju |
| **R1** | **Lari Cepat (*Sprint*)** | Lari Cepat (*Sprint*) |
| **L1** | Ganti Kursor Pemain / *Chip Shot* | Ganti Kursor Pemain |
| **R2** | *Placing / Finesse Shot* | Kawal Lawan (*Jockey*) |
| **L2** | Kontrol Manual Bola | *Body Charge* |
| **Analog Kiri (L3)** | Dribble 360 Derajat Bebas | Mengarahkan Gerakan Pemain |
| **Options / Start** | Jeda / Menu Formasi & Taktik | Jeda / Menu Formasi & Taktik |

---

## 🔵 Panduan Mode Bluetooth HID Langsung (Tanpa Software Laptop)

Jika Anda ingin menyambungkan HP langsung ke laptop via Bluetooth murni tanpa membuka server:

1. Pastikan Bluetooth aktif di Laptop dan di HP Anda.
2. Buka aplikasi **PS Controller** di HP (aplikasi otomatis berada di mode **Bluetooth HID Direct**).
3. Tap status koneksi di bagian atas (atau ikon koneksi) $\rightarrow$ pastikan berada di tab **Bluetooth HID (Direct)**.
4. Tap tombol **"Aktifkan Stik & Jadikan Terlihat"** (izinkan prompt izin jika muncul).
5. Di Laptop Anda:
   * Buka **Settings** $\rightarrow$ **Bluetooth & devices** $\rightarrow$ **Add device** $\rightarrow$ **Bluetooth**.
   * Pilih perangkat dengan nama **[Nama HP Anda]** atau **"Wireless Controller"** (ikon Game Controller).
6. **⚠️ PENTING (Solusi jika gagal / tidak mau terhubung):**
   * Jika laptop Anda sebelumnya pernah dipasangkan (*paired*) dengan HP ini (misal untuk transfer file atau Phone Link), Windows mengingat HP Anda sebagai ponsel biasa dan bukan stik game.
   * **Solusinya**: Buka Pengaturan Bluetooth di Windows $\rightarrow$ cari nama HP Anda $\rightarrow$ klik titik tiga $\rightarrow$ pilih **"Remove device" (Hapus perangkat)** terlebih dahulu.
   * Setelah dihapus di Windows, lakukan pairing ulang seperti langkah 4 & 5.
7. **Koneksi Cepat (Bila sudah pernah Paired):**
   * Buka menu koneksi di aplikasi HP $\rightarrow$ pada daftar **"Perangkat Laptop Paired (Tersimpan)"**, cukup klik tombol **[Hubungkan]** di samping nama laptop Anda!

---

## 📁 Struktur Repositori

```text
Controller-PS/
├── app/                  # Source code aplikasi Android (Expo + React Native + Native Bluetooth HID)
├── pc-server/            # Server laptop penerima 4-Player (Python + Node.js)
│   ├── server.py         # Multi-slot virtual controller Xbox 360
│   ├── start-windows.bat # Launcher 1-klik untuk Windows
│   ├── start-linux-mac.sh# Launcher untuk Linux / macOS
│   └── requirements.txt  # Daftar dependensi Python
├── releases/             # File APK rilis siap install
│   └── Controller-PS-v1.0.0.apk
└── README.md             # Dokumentasi panduan lengkap
```
