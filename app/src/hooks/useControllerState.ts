import { useRef, useCallback, useEffect, useState } from 'react';
import { ButtonName, GamepadAxes, ButtonsState, ConnectionMode, ConnectionStatus } from '../types/controller';
import { triggerHaptic } from '../services/haptics';
import BluetoothHid from '../../modules/bluetooth-hid/src';

const INITIAL_BUTTONS: ButtonsState = {
  dpad_up: false,
  dpad_down: false,
  dpad_left: false,
  dpad_right: false,
  cross: false,
  circle: false,
  square: false,
  triangle: false,
  l1: false,
  r1: false,
  l2: false,
  r2: false,
  l3: false,
  r3: false,
  select: false,
  start: false,
  ps: false,
  touchpad: false,
};

const INITIAL_AXES: GamepadAxes = {
  lx: 0,
  ly: 0,
  rx: 0,
  ry: 0,
  l2: 0,
  r2: 0,
};

function getDpadHatValue(up: boolean, right: boolean, down: boolean, left: boolean): number {
  if (up && right) return 2;
  if (down && right) return 4;
  if (down && left) return 6;
  if (up && left) return 8;
  if (up) return 1;
  if (right) return 3;
  if (down) return 5;
  if (left) return 7;
  return 0; // centered
}

export function useControllerState() {
  const [buttons, setButtons] = useState<ButtonsState>(INITIAL_BUTTONS);
  const [axes, setAxes] = useState<GamepadAxes>(INITIAL_AXES);

  const [mode, setMode] = useState<ConnectionMode>('bluetooth'); // Default to Direct Bluetooth HID Gamepad
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [targetDevice, setTargetDevice] = useState<string>('');
  const [serverIp, setServerIp] = useState<string>('192.168.1.100');
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [playerColor, setPlayerColor] = useState<string>('#00e5ff');

  const wsRef = useRef<WebSocket | null>(null);
  const buttonsRef = useRef<ButtonsState>(INITIAL_BUTTONS);
  const axesRef = useRef<GamepadAxes>(INITIAL_AXES);
  const rafIdRef = useRef<number | null>(null);

  // Send updates to either Bluetooth HID or WebSocket
  const flushState = useCallback(() => {
    const curButtons = buttonsRef.current;
    const curAxes = axesRef.current;

    // 1. Bluetooth HID Mode
    if (mode === 'bluetooth') {
      let buttonMask = 0;
      if (curButtons.square) buttonMask |= 1 << 0;
      if (curButtons.cross) buttonMask |= 1 << 1;
      if (curButtons.circle) buttonMask |= 1 << 2;
      if (curButtons.triangle) buttonMask |= 1 << 3;
      if (curButtons.l1) buttonMask |= 1 << 4;
      if (curButtons.r1) buttonMask |= 1 << 5;
      if (curButtons.l2 || curAxes.l2 > 0.2) buttonMask |= 1 << 6;
      if (curButtons.r2 || curAxes.r2 > 0.2) buttonMask |= 1 << 7;
      if (curButtons.select) buttonMask |= 1 << 8;
      if (curButtons.start) buttonMask |= 1 << 9;
      if (curButtons.l3) buttonMask |= 1 << 10;
      if (curButtons.r3) buttonMask |= 1 << 11;
      if (curButtons.ps) buttonMask |= 1 << 12;
      if (curButtons.touchpad) buttonMask |= 1 << 13;

      const dpadHat = getDpadHatValue(
        curButtons.dpad_up,
        curButtons.dpad_right,
        curButtons.dpad_down,
        curButtons.dpad_left
      );

      const lx = Math.max(0, Math.min(255, Math.round((curAxes.lx + 1) * 127.5)));
      const ly = Math.max(0, Math.min(255, Math.round((curAxes.ly + 1) * 127.5)));
      const rx = Math.max(0, Math.min(255, Math.round((curAxes.rx + 1) * 127.5)));
      const ry = Math.max(0, Math.min(255, Math.round((curAxes.ry + 1) * 127.5)));
      const l2 = Math.max(0, Math.min(255, Math.round(curAxes.l2 * 255)));
      const r2 = Math.max(0, Math.min(255, Math.round(curAxes.r2 * 255)));

      BluetoothHid.sendGamepadReport(buttonMask, dpadHat, lx, ly, rx, ry, l2, r2);
    }

    // 2. PC Server Mode (WebSocket)
    if (mode === 'pc_server' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'input',
            buttons: curButtons,
            axes: curAxes,
          })
        );
      } catch (err) {}
    }
  }, [mode]);

  // Press / Release button handlers - kirim segera agar tidak ada lag
  const pressButton = useCallback(
    (name: ButtonName) => {
      triggerHaptic('light');
      buttonsRef.current = { ...buttonsRef.current, [name]: true };
      setButtons((prev) => ({ ...prev, [name]: true }));
      flushState();
    },
    [flushState]
  );

  const releaseButton = useCallback(
    (name: ButtonName) => {
      buttonsRef.current = { ...buttonsRef.current, [name]: false };
      setButtons((prev) => ({ ...prev, [name]: false }));
      flushState();
    },
    [flushState]
  );

  // Update axes dengan requestAnimationFrame throttle agar tidak membebani jaringan / lag
  const updateAxes = useCallback(
    (newAxes: Partial<GamepadAxes>) => {
      axesRef.current = { ...axesRef.current, ...newAxes };
      setAxes((prev) => ({ ...prev, ...newAxes }));

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          flushState();
        });
      }
    },
    [flushState]
  );

  // Inisialisasi Bluetooth
  useEffect(() => {
    BluetoothHid.requestBluetoothPermissions();
    BluetoothHid.initProfileProxy();

    const connSub = BluetoothHid.addConnectionListener((evt) => {
      if (evt.isConnected) {
        setStatus('connected');
        setTargetDevice(evt.deviceName || 'Laptop / PC (Bluetooth)');
        setConnectionError(null);
        triggerHaptic('medium');
      } else {
        if (mode === 'bluetooth') {
          setStatus('disconnected');
          setTargetDevice('');
        }
      }
    });

    return () => {
      connSub?.remove();
    };
  }, [mode]);

  // WebSocket Server connection - dengan auto-port 8765 & diagnosa error
  const connectToServer = useCallback((ip: string) => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setConnectionError(null);
    setStatus('connecting');

    // Membersihkan format input IP
    let rawAddress = ip.trim().replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
    if (!rawAddress.includes(':')) {
      rawAddress = `${rawAddress}:8765`;
    }
    const cleanUrl = `ws://${rawAddress}`;
    setServerIp(rawAddress);

    let connectionTimeout: any = null;

    try {
      const socket = new WebSocket(cleanUrl);
      wsRef.current = socket;

      connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          try {
            socket.close();
          } catch (e) {}
          setStatus('disconnected');
          setConnectionError(
            `Waktu koneksi habis ke ${cleanUrl}.\nPastikan server.py di laptop sudah berjalan dan HP berada di WiFi/Hotspot yang sama.`
          );
        }
      }, 5000);

      socket.onopen = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        setStatus('connected');
        setConnectionError(null);
        setTargetDevice(`PC (${rawAddress})`);
        triggerHaptic('medium');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'handshake') {
            if (data.player) {
              setPlayerNumber(data.player);
            }
            if (data.playerColor) {
              setPlayerColor(data.playerColor);
            }
            if (data.playerName) {
              setTargetDevice(`${data.playerName} (Laptop)`);
            }
          } else if (data.type === 'pong' && data.time) {
            setPingMs(Date.now() - data.time);
          } else if (data.type === 'error') {
            setConnectionError(data.message || 'Error dari server');
          }
        } catch (e) {}
      };

      socket.onerror = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        setStatus('disconnected');
        setConnectionError(
          `Gagal terhubung ke ${cleanUrl}.\nPeriksa kembali IP laptop atau izinkan akses port 8765 di Windows Firewall.`
        );
      };

      socket.onclose = () => {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        setStatus('disconnected');
      };
    } catch (e: any) {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      setStatus('disconnected');
      setConnectionError(`Error: ${e?.message || 'Gagal membuat soket'}`);
    }
  }, []);

  const disconnectFromServer = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setStatus('disconnected');
    setConnectionError(null);
  }, []);

  return {
    buttons,
    axes,
    mode,
    status,
    connectionError,
    targetDevice,
    serverIp,
    pingMs,
    playerNumber,
    playerColor,
    setMode,
    pressButton,
    releaseButton,
    updateAxes,
    connectToServer,
    disconnectFromServer,
  };
}
