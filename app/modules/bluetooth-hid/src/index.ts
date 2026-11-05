import { NativeModule, requireNativeModule } from 'expo';

export type EventSubscription = {
  remove(): void;
};

export interface DeviceConnectionEvent {
  state: number;
  isConnected: boolean;
  deviceName: string;
  deviceAddress: string;
}

export interface RegistrationStatusEvent {
  registered: boolean;
}

export interface ProfileProxyEvent {
  connected: boolean;
}

type BluetoothHidEvents = {
  onRegistrationStatusChanged(event: RegistrationStatusEvent): void;
  onConnectionStateChanged(event: DeviceConnectionEvent): void;
  onProfileProxyConnected(event: ProfileProxyEvent): void;
};

declare class BluetoothHidModuleClass extends NativeModule<BluetoothHidEvents> {
  hasBluetoothPermissions(): boolean;
  requestBluetoothPermissions(): boolean;
  isSupported(): boolean;
  isEnabled(): boolean;
  isRegistered(): boolean;
  isConnected(): boolean;
  getConnectedDeviceName(): string;
  initProfileProxy(): boolean;
  registerGamepadApp(): Promise<boolean>;
  unregisterGamepadApp(): boolean;
  requestDiscoverable(): boolean;
  sendGamepadReport(
    buttons: number,
    dpad: number,
    lx: number,
    ly: number,
    rx: number,
    ry: number,
    l2: number,
    r2: number
  ): boolean;
}

let nativeModule: BluetoothHidModuleClass | null = null;
try {
  nativeModule = requireNativeModule<BluetoothHidModuleClass>('BluetoothHid');
} catch (e) {
  nativeModule = null;
}

export const BluetoothHid = {
  hasBluetoothPermissions(): boolean {
    return nativeModule?.hasBluetoothPermissions() ?? true;
  },

  requestBluetoothPermissions(): boolean {
    return nativeModule?.requestBluetoothPermissions() ?? true;
  },

  isSupported(): boolean {
    return nativeModule?.isSupported() ?? false;
  },

  isEnabled(): boolean {
    return nativeModule?.isEnabled() ?? false;
  },

  isRegistered(): boolean {
    return nativeModule?.isRegistered() ?? false;
  },

  isConnected(): boolean {
    return nativeModule?.isConnected() ?? false;
  },

  getConnectedDeviceName(): string {
    return nativeModule?.getConnectedDeviceName() ?? '';
  },

  initProfileProxy(): boolean {
    return nativeModule?.initProfileProxy() ?? false;
  },

  async registerGamepadApp(): Promise<boolean> {
    if (!nativeModule) return false;
    return await nativeModule.registerGamepadApp();
  },

  unregisterGamepadApp(): boolean {
    return nativeModule?.unregisterGamepadApp() ?? false;
  },

  requestDiscoverable(): boolean {
    return nativeModule?.requestDiscoverable() ?? false;
  },

  sendGamepadReport(
    buttons: number,
    dpad: number,
    lx: number,
    ly: number,
    rx: number,
    ry: number,
    l2: number,
    r2: number
  ): boolean {
    return nativeModule?.sendGamepadReport(buttons, dpad, lx, ly, rx, ry, l2, r2) ?? false;
  },

  addRegistrationListener(listener: (event: RegistrationStatusEvent) => void): EventSubscription | null {
    return nativeModule?.addListener('onRegistrationStatusChanged', listener) ?? null;
  },

  addConnectionListener(listener: (event: DeviceConnectionEvent) => void): EventSubscription | null {
    return nativeModule?.addListener('onConnectionStateChanged', listener) ?? null;
  },

  addProfileProxyListener(listener: (event: ProfileProxyEvent) => void): EventSubscription | null {
    return nativeModule?.addListener('onProfileProxyConnected', listener) ?? null;
  },
};

export default BluetoothHid;
