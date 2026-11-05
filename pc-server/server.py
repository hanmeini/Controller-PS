#!/usr/bin/env python3
"""
Controller-PS - Multi-Player Laptop Receiver Server v1.1
Mendukung hingga 4 HP bermain bersamaan dalam 1 laptop (Player 1 - Player 4).
Kompatibel dengan FIFA, PES, Overcooked, Tekken, Naruto, Emulator PS2/PS3, Steam, dll.
"""

import sys
import socket
import json
import asyncio
import platform
import os

try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    class Fore:
        GREEN = YELLOW = CYAN = RED = BLUE = MAGENTA = WHITE = ""
    class Style:
        BRIGHT = RESET_ALL = ""

# Deteksi dukungan vgamepad (Virtual Gamepad untuk Windows)
HAS_VGAMEPAD = False
VGAMEPAD_ERROR = ""
if platform.system() == "Windows":
    try:
        import vgamepad as vg
        # Tes instansiasi untuk memastikan driver ViGEmBus terpasang di Windows
        _test_gp = vg.VX360Gamepad()
        del _test_gp
        HAS_VGAMEPAD = True
    except Exception as e:
        HAS_VGAMEPAD = False
        VGAMEPAD_ERROR = str(e)

try:
    from pynput.keyboard import Controller as KbController, Key
    keyboard = KbController()
    HAS_KEYBOARD = True
except Exception:
    keyboard = None
    HAS_KEYBOARD = False

# Mapping tombol Xbox 360 (vgamepad)
if HAS_VGAMEPAD:
    import vgamepad as vg
    VG_BUTTONS = {
        'cross': vg.XUSB_BUTTON.XUSB_GAMEPAD_A,          # Cross = A
        'circle': vg.XUSB_BUTTON.XUSB_GAMEPAD_B,         # Circle = B
        'square': vg.XUSB_BUTTON.XUSB_GAMEPAD_X,         # Square = X
        'triangle': vg.XUSB_BUTTON.XUSB_GAMEPAD_Y,       # Triangle = Y
        'dpad_up': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP,
        'dpad_down': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN,
        'dpad_left': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT,
        'dpad_right': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT,
        'l1': vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER,
        'r1': vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER,
        'l3': vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_THUMB,
        'r3': vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_THUMB,
        'start': vg.XUSB_BUTTON.XUSB_GAMEPAD_START,
        'select': vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK,
        'ps': vg.XUSB_BUTTON.XUSB_GAMEPAD_GUIDE,
    }

# Warna indikator lampu DualShock/DualSense per player
PLAYER_CONFIG = {
    1: {"name": "Player 1", "color": "#2979ff", "color_term": Fore.BLUE},
    2: {"name": "Player 2", "color": "#ff1744", "color_term": Fore.RED},
    3: {"name": "Player 3", "color": "#00e676", "color_term": Fore.GREEN},
    4: {"name": "Player 4", "color": "#e040fb", "color_term": Fore.MAGENTA},
}

class PlayerSlotManager:
    """Mengelola 4 Slot Virtual Gamepad untuk 4 HP sekaligus"""
    def __init__(self):
        self.slots = {1: None, 2: None, 3: None, 4: None}
        self.gamepads = {}

    def allocate_slot(self, ws):
        for slot in range(1, 5):
            if self.slots[slot] is None:
                self.slots[slot] = ws
                if HAS_VGAMEPAD:
                    try:
                        self.gamepads[slot] = vg.VX360Gamepad()
                    except Exception as e:
                        print(f"Gagal inisialisasi gamepad slot {slot}: {e}")
                return slot
        return None

    def release_slot(self, slot):
        if slot in self.slots:
            self.slots[slot] = None
            if slot in self.gamepads:
                try:
                    self.gamepads[slot].reset()
                    self.gamepads[slot].update()
                except Exception:
                    pass
                del self.gamepads[slot]

    def get_gamepad(self, slot):
        return self.gamepads.get(slot)

    def active_players_count(self):
        return sum(1 for v in self.slots.values() if v is not None)

slot_manager = PlayerSlotManager()

def get_all_local_ips():
    """Mendapatkan semua alamat IP lokal (WiFi, Hotspot, LAN)"""
    ips = []
    try:
        # Coba cara standar
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None):
            ip = info[4][0]
            if ':' not in ip and not ip.startswith('127.'):
                if ip not in ips:
                    ips.append(ip)
    except Exception:
        pass

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        primary_ip = s.getsockname()[0]
        s.close()
        if primary_ip not in ips and not primary_ip.startswith('127.'):
            ips.insert(0, primary_ip)
    except Exception:
        pass

    if not ips:
        ips.append("127.0.0.1")
    return ips

def handle_gamepad_state(slot, data):
    """Update virtual gamepad state untuk player spesifik"""
    buttons = data.get('buttons', {})
    axes = data.get('axes', {})

    gp = slot_manager.get_gamepad(slot)
    if HAS_VGAMEPAD and gp:
        # Update Tombol
        for btn, is_down in buttons.items():
            vg_btn = VG_BUTTONS.get(btn)
            if vg_btn:
                if is_down:
                    gp.press_button(button=vg_btn)
                else:
                    gp.release_button(button=vg_btn)

        # Triggers L2 / R2 (0 - 255)
        l2_val = int(buttons.get('l2_val', 1.0 if buttons.get('l2') else 0.0) * 255)
        r2_val = int(buttons.get('r2_val', 1.0 if buttons.get('r2') else 0.0) * 255)
        gp.left_trigger(value=max(0, min(255, l2_val)))
        gp.right_trigger(value=max(0, min(255, r2_val)))

        # Joysticks Left & Right (-32768 s/d 32767)
        lx = int(float(axes.get('lx', 0.0)) * 32767)
        ly = int(float(axes.get('ly', 0.0)) * -32767)  # Invert Y sesuai standar XInput
        rx = int(float(axes.get('rx', 0.0)) * 32767)
        ry = int(float(axes.get('ry', 0.0)) * -32767)

        gp.left_joystick(x_value=max(-32768, min(32767, lx)), y_value=max(-32768, min(32767, ly)))
        gp.right_joystick(x_value=max(-32768, min(32767, rx)), y_value=max(-32768, min(32767, ry)))

        gp.update()

async def ws_handler(websocket):
    client_ip = websocket.remote_address[0]
    slot = slot_manager.allocate_slot(websocket)

    if slot is None:
        print(f"{Fore.RED}[!] Koneksi ditolak dari {client_ip}: Server penuh (Maksimal 4 Pemain).{Style.RESET_ALL}")
        await websocket.send(json.dumps({
            "type": "error",
            "message": "Server penuh! Maksimal 4 pemain sudah terhubung."
        }))
        await websocket.close()
        return

    p_info = PLAYER_CONFIG[slot]
    color_term = p_info["color_term"]
    print(f"{color_term}[+] {p_info['name']} TERHUBUNG dari {client_ip} (Total Pemain: {slot_manager.active_players_count()}/4){Style.RESET_ALL}")

    try:
        # Kirim info slot player & warna LED ke HP
        await websocket.send(json.dumps({
            "type": "handshake",
            "status": "connected",
            "player": slot,
            "playerName": p_info["name"],
            "playerColor": p_info["color"],
            "mode": "vgamepad" if HAS_VGAMEPAD else "keyboard",
        }))

        async for message in websocket:
            try:
                data = json.loads(message)
                msg_type = data.get('type')
                if msg_type == 'input':
                    handle_gamepad_state(slot, data)
                elif msg_type == 'ping':
                    await websocket.send(json.dumps({
                        "type": "pong",
                        "time": data.get("time"),
                        "player": slot,
                    }))
            except json.JSONDecodeError:
                pass
    except Exception as e:
        print(f"{Fore.YELLOW}[!] {p_info['name']} terputus: {e}{Style.RESET_ALL}")
    finally:
        slot_manager.release_slot(slot)
        print(f"{Fore.RED}[-] {p_info['name']} keluar. Slot {slot} kini kosong. (Total Pemain: {slot_manager.active_players_count()}/4){Style.RESET_ALL}")

async def main():
    try:
        import websockets
    except ImportError:
        print(f"{Fore.RED}Modul websockets belum terpasang! Jalankan: pip install websockets{Style.RESET_ALL}")
        sys.exit(1)

    all_ips = get_all_local_ips()
    port = 8765

    banner = f"""
{Fore.CYAN}==================================================================
      🎮  CONTROLLER-PS - 4-PLAYER LAPTOP RECEIVER SERVER  🎮
=================================================================={Style.RESET_ALL}
Sistem Operasi   : {platform.system()} ({platform.release()})
Kapasitas Pemain : {Fore.GREEN + Style.BRIGHT}Hingga 4 Orang Sekaligus (Multiplayer Co-op / Versus){Style.RESET_ALL}
Emulasi Virtual  : {Fore.GREEN + "Virtual Xbox 360 Gamepad (XInput Slot 1-4) AKTIF" if HAS_VGAMEPAD else Fore.YELLOW + "Fallback Keyboard (Install ViGEmBus untuk XInput stik PES)"}{Style.RESET_ALL}
"""
    if not HAS_VGAMEPAD and platform.system() == "Windows":
        banner += f"""
{Fore.YELLOW}⚠️  CATATAN PENTING UNTUK PES / STIK VIRTUAL:{Style.RESET_ALL}
Driver ViGEmBus belum terdeteksi di Windows ini ({VGAMEPAD_ERROR}).
Untuk bermain PES dengan stik virtual Xbox 360:
1. Unduh installer ViGEmBus: {Fore.CYAN}https://github.com/nefarius/ViGEmBus/releases/latest{Style.RESET_ALL}
2. Buka dan instal file 'ViGEmBusSetup_x64.msi', lalu jalankan server ini kembali.
"""

    banner += f"""
{Fore.GREEN}Alamat IP Laptop yang bisa dimasukkan di HP:{Style.RESET_ALL}"""
    for i, ip_addr in enumerate(all_ips):
        banner += f"""
  👉 Pilihan {i+1} : {Fore.WHITE + Style.BRIGHT}{ip_addr}{Style.RESET_ALL}  (atau ketik: {ip_addr}:{port})"""

    banner += f"""

Lampu Indikator di HP:
  🔵 Player 1 : Biru
  🔴 Player 2 : Merah
  🟢 Player 3 : Hijau
  🟣 Player 4 : Ungu / Pink

Pastikan HP dan Laptop berada dalam 1 WiFi atau Hotspot yang sama!
==================================================================
Menunggu koneksi dari aplikasi HP di port {port}... (Tekan Ctrl+C untuk berhenti)
"""
    print(banner)

    async with websockets.serve(ws_handler, "0.0.0.0", port):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Server dimatikan.{Style.RESET_ALL}")
