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

export interface PairedDevice {
  name: string;
  address: string;
  isComputer?: boolean;
}

export interface BluetoothDiagnostics {
  isSupported: boolean;
  isEnabled: boolean;
  hasPermissions: boolean;
  isProxyConnected: boolean;
  isRegistered: boolean;
  isConnected: boolean;
  connectedDeviceName: string;
  myDeviceName: string;
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
  getMyDeviceName(): string;
  getConnectedDeviceName(): string;
  getBluetoothDiagnostics(): BluetoothDiagnostics;
  initProfileProxy(): boolean;
  registerGamepadApp(): Promise<boolean>;
  unregisterGamepadApp(): boolean;
  requestDiscoverable(): boolean;
  openBluetoothSettings(): boolean;
  getPairedDevices(): PairedDevice[];
  connectDevice(address: string): Promise<boolean>;
  disconnectDevice(): boolean;
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

  getMyDeviceName(): string {
    return nativeModule?.getMyDeviceName() ?? 'HP Android';
  },

  getConnectedDeviceName(): string {
    return nativeModule?.getConnectedDeviceName() ?? '';
  },

  getBluetoothDiagnostics(): BluetoothDiagnostics {
    return (
      nativeModule?.getBluetoothDiagnostics() ?? {
        isSupported: true,
        isEnabled: false,
        hasPermissions: false,
        isProxyConnected: false,
        isRegistered: false,
        isConnected: false,
        connectedDeviceName: '',
        myDeviceName: 'HP Android',
      }
    );
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

  openBluetoothSettings(): boolean {
    return nativeModule?.openBluetoothSettings() ?? false;
  },

  getPairedDevices(): PairedDevice[] {
    return nativeModule?.getPairedDevices() ?? [];
  },

  async connectDevice(address: string): Promise<boolean> {
    if (!nativeModule) return false;
    return await nativeModule.connectDevice(address);
  },

  disconnectDevice(): boolean {
    return nativeModule?.disconnectDevice() ?? false;
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
