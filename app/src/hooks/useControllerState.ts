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

  const [mode, setMode] = useState<ConnectionMode>('bluetooth');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [targetDevice, setTargetDevice] = useState<string>('');
  const [serverIp, setServerIp] = useState<string>('192.168.1.100:8765');
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [playerColor, setPlayerColor] = useState<string>('#00e5ff');

  const wsRef = useRef<WebSocket | null>(null);
  const buttonsRef = useRef<ButtonsState>(INITIAL_BUTTONS);
  const axesRef = useRef<GamepadAxes>(INITIAL_AXES);
  const dirtyRef = useRef<boolean>(false);

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

      // Map -1.0..1.0 to 0..255 (center 128)
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
      wsRef.current.send(
        JSON.stringify({
          type: 'input',
          buttons: curButtons,
          axes: curAxes,
        })
      );
    }
  }, [mode]);

  // Press / Release button handlers
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

  const updateAxes = useCallback(
    (newAxes: Partial<GamepadAxes>) => {
      axesRef.current = { ...axesRef.current, ...newAxes };
      setAxes((prev) => ({ ...prev, ...newAxes }));
      flushState();
    },
    [flushState]
  );

  // Bluetooth HID listeners
  useEffect(() => {
    BluetoothHid.initProfileProxy();

    const connSub = BluetoothHid.addConnectionListener((evt) => {
      if (evt.isConnected) {
        setStatus('connected');
        setTargetDevice(evt.deviceName || 'Laptop / PC');
        triggerHaptic('medium');
      } else {
        setStatus('disconnected');
        setTargetDevice('');
      }
    });

    return () => {
      connSub?.remove();
    };
  }, []);

  // WebSocket Server connection
  const connectToServer = useCallback((ip: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');
    setServerIp(ip);

    let cleanUrl = ip.trim();
    if (!cleanUrl.startsWith('ws://') && !cleanUrl.startsWith('wss://')) {
      cleanUrl = `ws://${cleanUrl}`;
    }

    try {
      const socket = new WebSocket(cleanUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        setTargetDevice(`PC (${cleanUrl.replace('ws://', '')})`);
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
          }
        } catch (e) {}
      };

      socket.onerror = () => {
        setStatus('disconnected');
      };

      socket.onclose = () => {
        setStatus('disconnected');
      };
    } catch (e) {
      setStatus('disconnected');
    }
  }, []);

  const disconnectFromServer = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  return {
    buttons,
    axes,
    mode,
    status,
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
