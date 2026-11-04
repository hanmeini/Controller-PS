export type ButtonName =
  | 'dpad_up'
  | 'dpad_down'
  | 'dpad_left'
  | 'dpad_right'
  | 'cross'
  | 'circle'
  | 'square'
  | 'triangle'
  | 'l1'
  | 'r1'
  | 'l2'
  | 'r2'
  | 'l3'
  | 'r3'
  | 'select'
  | 'start'
  | 'ps'
  | 'touchpad';

export interface GamepadAxes {
  lx: number; // -1.0 to 1.0
  ly: number; // -1.0 to 1.0
  rx: number; // -1.0 to 1.0
  ry: number; // -1.0 to 1.0
  l2: number; // 0.0 to 1.0
  r2: number; // 0.0 to 1.0
}

export type ButtonsState = Record<ButtonName, boolean>;

export type ConnectionMode = 'bluetooth' | 'pc_server';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface ControllerSettings {
  vibration: boolean;
  vibrationStrength: 'light' | 'medium' | 'heavy';
  stickDeadzone: number;
  motionControl: boolean;
  theme: 'dark' | 'dualsense' | 'cyberpunk';
  touchpadMode: 'gamepad' | 'mouse';
}
