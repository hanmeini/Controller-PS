# 🎮 Controller-PS

Aplikasi pengubah smartphone Android menjadi **PlayStation Controller (DualShock / DualSense)** nirkabel untuk bermain game di Laptop / PC via **Bluetooth HID** dan **WiFi / Hotspot (PC Server)**.

Mendukung hingga **4 Pemain Sekaligus (Multiplayer)** dalam 1 laptop untuk bermain **PES / eFootball, FIFA, Overcooked, Tekken, Naruto Shippuden, Party Animals, emulator PS2/PS3**, dan game PC lainnya!

---

## ✨ Fitur Utama

- 🎮 **Desain Otentik PlayStation**:
  - D-Pad 4 arah dengan respon cepat & haptic feedback.
  - Tombol aksi khas PS: Triangle (△), Circle (○), Cross (✕), Square (□).
  - Bumper & Trigger bahu: L1, R1, L2, R2.
  - Dua Stik Analog 360° (L3 & R3 yang bisa diklik).
  - Tombol Share (Select), Options (Start), dan Tombol Logo PS (Home).
  - Touchpad di bagian tengah dengan indikator lampu LED warna per pemain.
- 👥 **Multiplayer Hingga 4 Pemain**:
  - Server otomatis membagi 4 slot stik independen (Player 1 s/d Player 4).
  - Lampu LED Touchpad di HP menyala sesuai warna pemain:
    - 🔵 **Player 1**: Biru
    - 🔴 **Player 2**: Merah
    - 🟢 **Player 3**: Hijau
    - 🟣 **Player 4**: Ungu / Pink
- ⚡ **2 Pilihan Mode Koneksi**:
  1. **Mode PC Server (WiFi / Hotspot) [Paling Direkomendasikan]**:
     - Mengemulasikan **Virtual Xbox 360 Controller (XInput)** tingkat kernel Windows (`vgamepad`).
     - Kompatibel 100% dengan PES, FIFA, Steam, Epic Games, emulator, dll.
     - Latensi ultra-rendah (1–3 ms).
  2. **Mode Bluetooth HID (Direct)**:
     - HP langsung terbaca sebagai stik *Wireless Controller* Bluetooth tanpa software tambahan di laptop.
- 📳 **Haptic Feedback**: Getaran responsif saat tombol ditekan (bisa diatur kekuatannya).

---

## 🚀 Panduan Bermain PES / Game Laptop (Mode PC Server)

### 1. Di Laptop (Jalankan Server Penerima)
Pastikan laptop dan HP terhubung ke jaringan WiFi atau Hotspot HP yang sama.

**Untuk Windows:**
1. Masuk ke folder `pc-server`.
2. Klik dua kali file **`start-windows.bat`** (atau buka terminal dan jalankan `python server.py`).
3. Terminal akan menampilkan alamat IP laptop Anda, contoh: `ws://192.168.1.15:8765`.

### 2. Di Aplikasi HP
1. Buka aplikasi **PS Controller** di Android.
2. Tap tombol status koneksi di bagian atas (atau ikon colokan).
3. Pilih tab **PC Server (WiFi / Hotspot)**.
4. Masukkan IP yang tertera di terminal laptop, lalu tekan **Hubungkan**.
5. Touchpad HP Anda akan langsung menyala sesuai nomor pemain (P1/P2/P3/P4).

### 3. Di Game PES / eFootball
1. Buka folder instalasi PES di laptop, lalu buka **`Settings.exe`**.
2. Masuk ke tab **Controller**:
   - Controller 1 s/d 4 akan langsung terdeteksi otomatis sebagai **"Controller (XBOX 360 For Windows)"**.
3. Buka game PES Anda, masuk ke menu pertandingan (*Exhibition / Match*), lalu geser stik HP Anda ke tim yang diinginkan!

---

## 🎯 Mapping Tombol PES

| Tombol HP | Fungsi di PES (Menyerang) | Fungsi di PES (Bertahan) |
| :--- | :--- | :--- |
| **✕ (Cross)** | Umpan Pendek / Operan Datar | Merebut Bola (*Pressing*) |
| **□ (Square)** | Tembakan ke Gawang (*Shoot*) | Buang Bola (*Clearance*) |
| **○ (Circle)** | Umpan Lambung / *Crossing* | *Sliding Tackle* |
| **△ (Triangle)** | Umpan Terobos (*Through Pass*) | Kiper Maju |
| **R1** | **Lari Cepat (*Sprint*)** | Lari Cepat (*Sprint*) |
| **L1** | Ganti Kursor Pemain / *Chip Shot* | Ganti Kursor Pemain |
| **R2** | *Placing / Finesse Shoot* | Kawal Lawan (*Jockey*) |
| **L2** | Kontrol Manual Bola | *Body Charge* |
| **Analog Kiri** | Dribble 360° | Mengarahkan Pemain |
| **Options** | Jeda / Menu Taktik | Jeda / Menu Taktik |

---

## 📁 Struktur Repositori

```text
Controller-PS/
├── app/                  # Source code aplikasi Android (Expo + React Native + Native Bluetooth HID)
├── pc-server/            # Server laptop penerima 4-Player (Python + Node.js)
│   ├── server.py         # Multi-slot virtual controller Xbox 360
│   ├── start-windows.bat # Launcher 1-klik untuk Windows
│   └── requirements.txt
├── releases/             # File APK rilis siap install di HP
└── README.md
```

---

## 🛠️ Build APK Mandiri

Jika ingin mengompilasi APK sendiri secara lokal:
```bash
cd app
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
File APK akan berada di `app/android/app/build/outputs/apk/release/app-release.apk`.
