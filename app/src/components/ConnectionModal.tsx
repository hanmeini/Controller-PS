import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConnectionMode, ConnectionStatus } from '../types/controller';
import BluetoothHid, { PairedDevice, BluetoothDiagnostics } from '../../modules/bluetooth-hid/src';

interface ConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: ConnectionMode;
  onSelectMode: (mode: ConnectionMode) => void;
  status: ConnectionStatus;
  connectionError?: string | null;
  targetDevice: string;
  serverIp: string;
  onConnectServer: (ip: string) => void;
  onDisconnectServer: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  visible,
  onClose,
  currentMode,
  onSelectMode,
  status,
  connectionError,
  targetDevice,
  serverIp,
  onConnectServer,
  onDisconnectServer,
}) => {
  const [ipInput, setIpInput] = useState(serverIp || '192.168.1.100');
  const [btStatusMsg, setBtStatusMsg] = useState('');
  const [btErrorMsg, setBtErrorMsg] = useState<string | null>(null);
  const [diag, setDiag] = useState<BluetoothDiagnostics | null>(null);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [connectingBtAddr, setConnectingBtAddr] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  useEffect(() => {
    if (serverIp) {
      setIpInput(serverIp);
    }
  }, [serverIp]);

  const refreshBluetoothInfo = () => {
    try {
      BluetoothHid.requestBluetoothPermissions();
      BluetoothHid.initProfileProxy();
      const d = BluetoothHid.getBluetoothDiagnostics();
      setDiag(d);
      const list = BluetoothHid.getPairedDevices();
      setPairedDevices(list);
    } catch (e) {}
  };

  // Refresh daftar paired devices & status saat modal terbuka
  useEffect(() => {
    if (visible && currentMode === 'bluetooth') {
      refreshBluetoothInfo();
    }
  }, [visible, currentMode]);

  const handleRegisterAndDiscover = async () => {
    try {
      setIsActivating(true);
      setBtErrorMsg(null);
      setBtStatusMsg('⏳ Mengaktifkan Bluetooth HID & mendaftarkan stik gamepad...');

      BluetoothHid.requestBluetoothPermissions();
      const success = await BluetoothHid.registerGamepadApp();

      if (success) {
        BluetoothHid.requestDiscoverable();
        const d = BluetoothHid.getBluetoothDiagnostics();
        setDiag(d);
        setBtStatusMsg(
          `📡 Mode stik aktif! Di laptop buka Add device lalu pilih "${d.myDeviceName}" atau "Wireless Controller".`
        );
      } else {
        setBtErrorMsg(
          'Gagal mengaktifkan mode stik. Pastikan Bluetooth di HP aktif dan berikan izin Bluetooth.'
        );
      }
      refreshBluetoothInfo();
    } catch (e: any) {
      setBtErrorMsg(`Error: ${e?.message || 'Gagal mendaftarkan Bluetooth stik'}`);
    } finally {
      setIsActivating(false);
    }
  };

  const handleConnectBtDevice = async (address: string, name: string) => {
    try {
      setConnectingBtAddr(address);
      setBtErrorMsg(null);
      setBtStatusMsg(`Menghubungkan ke ${name} (${address})...`);

      const success = await BluetoothHid.connectDevice(address);
      if (success) {
        setBtStatusMsg(`🟢 Berhasil terhubung ke ${name}!`);
      } else {
        setBtErrorMsg(
          `Tidak dapat menghubungkan ke ${name}. Pastikan Bluetooth di laptop aktif dan tidak sedang mode Sleep.`
        );
      }
    } catch (e: any) {
      setBtErrorMsg(
        `Koneksi gagal: ${e?.message || e}\nTips: Jika laptop pernah dipasangkan dengan HP ini, hapus (Remove device) di Bluetooth Windows lalu pasangkan kembali.`
      );
    } finally {
      setConnectingBtAddr(null);
    }
  };

  const handleDisconnectBt = () => {
    BluetoothHid.disconnectDevice();
    setBtStatusMsg('Koneksi Bluetooth diputus.');
    refreshBluetoothInfo();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="gamepad-variant" size={24} color="#00e5ff" />
              <Text style={styles.title}>Koneksi Controller ke Laptop</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#8a94ac" />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectMode('bluetooth')}
              style={[styles.tab, currentMode === 'bluetooth' && styles.tabActive]}
            >
              <MaterialCommunityIcons
                name="bluetooth"
                size={18}
                color={currentMode === 'bluetooth' ? '#00e5ff' : '#7d87a1'}
              />
              <Text
                style={[
                  styles.tabText,
                  currentMode === 'bluetooth' && styles.tabTextActive,
                ]}
              >
                Bluetooth HID (Direct)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectMode('pc_server')}
              style={[styles.tab, currentMode === 'pc_server' && styles.tabActive]}
            >
              <MaterialCommunityIcons
                name="wifi"
                size={18}
                color={currentMode === 'pc_server' ? '#00e5ff' : '#7d87a1'}
              />
              <Text
                style={[
                  styles.tabText,
                  currentMode === 'pc_server' && styles.tabTextActive,
                ]}
              >
                PC Server (WiFi / Hotspot)
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* BLUETOOTH HID MODE */}
            {currentMode === 'bluetooth' && (
              <View style={styles.section}>
                {/* Status Box */}
                <View style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Status Bluetooth:</Text>
                  <Text style={[styles.statusValue, isConnected ? styles.textSuccess : styles.textMuted]}>
                    {isConnected ? `🟢 Terhubung ke ${targetDevice}` : '⚪ Belum Terhubung'}
                  </Text>
                </View>

                {/* Live Diagnostics Badges */}
                <View style={styles.diagRow}>
                  <View style={styles.diagBadge}>
                    <Text style={styles.diagKey}>Bluetooth HP:</Text>
                    <Text style={[styles.diagVal, diag?.isEnabled ? styles.diagOk : styles.diagWarn]}>
                      {diag?.isEnabled ? 'Aktif' : 'Nonaktif'}
                    </Text>
                  </View>
                  <View style={styles.diagBadge}>
                    <Text style={styles.diagKey}>Mode Stik HID:</Text>
                    <Text style={[styles.diagVal, diag?.isRegistered ? styles.diagOk : styles.diagWarn]}>
                      {diag?.isRegistered ? 'Siap' : 'Belum Siap'}
                    </Text>
                  </View>
                  <View style={[styles.diagBadge, { flex: 1.4 }]}>
                    <Text style={styles.diagKey}>Nama HP:</Text>
                    <Text style={[styles.diagVal, { color: '#00e5ff' }]} numberOfLines={1}>
                      {diag?.myDeviceName || 'HP Android'}
                    </Text>
                  </View>
                </View>

                {/* Error Box */}
                {btErrorMsg ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#ff3d00" />
                    <Text style={styles.errorText}>{btErrorMsg}</Text>
                  </View>
                ) : null}

                {/* Info / Status Message */}
                {btStatusMsg ? <Text style={styles.infoAlert}>{btStatusMsg}</Text> : null}

                {/* Action Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnPrimary, isActivating && styles.btnDisabled]}
                    disabled={isActivating}
                    onPress={handleRegisterAndDiscover}
                  >
                    {isActivating ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <>
                        <Ionicons name="bluetooth" size={16} color="#000" />
                        <Text style={styles.btnPrimaryText}>Aktifkan Stik & Jadikan Terlihat</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnSecondary]}
                    onPress={() => BluetoothHid.openBluetoothSettings()}
                  >
                    <Ionicons name="settings-outline" size={16} color="#00e5ff" />
                    <Text style={styles.btnSecondaryText}>Bluetooth HP</Text>
                  </TouchableOpacity>
                </View>

                {isConnected && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnDisconnectFull]}
                    onPress={handleDisconnectBt}
                  >
                    <Text style={styles.btnDisconnectText}>Putuskan Koneksi Bluetooth</Text>
                  </TouchableOpacity>
                )}

                {/* DAFTAR PERANGKAT LAPTOP PAIRED */}
                <View style={styles.pairedSection}>
                  <View style={styles.pairedHeader}>
                    <Text style={styles.pairedTitle}>Perangkat Laptop Paired (Tersimpan):</Text>
                    <TouchableOpacity onPress={refreshBluetoothInfo} style={styles.refreshBtn}>
                      <Ionicons name="refresh" size={15} color="#00e5ff" />
                      <Text style={styles.refreshText}>Refresh</Text>
                    </TouchableOpacity>
                  </View>

                  {pairedDevices.length > 0 ? (
                    pairedDevices.map((dev) => (
                      <View key={dev.address} style={styles.deviceItem}>
                        <View style={styles.deviceInfo}>
                          <MaterialCommunityIcons
                            name={dev.isComputer ? 'laptop' : 'bluetooth'}
                            size={20}
                            color={dev.isComputer ? '#00e5ff' : '#a0abbf'}
                          />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.deviceName} numberOfLines={1}>{dev.name}</Text>
                              {dev.isComputer && (
                                <Text style={styles.pcBadge}>PC / Laptop</Text>
                              )}
                            </View>
                            <Text style={styles.deviceAddress}>{dev.address}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.connectDevBtn,
                            connectingBtAddr === dev.address && styles.btnDisabled,
                          ]}
                          disabled={connectingBtAddr === dev.address}
                          onPress={() => handleConnectBtDevice(dev.address, dev.name)}
                        >
                          {connectingBtAddr === dev.address ? (
                            <ActivityIndicator size="small" color="#000" />
                          ) : (
                            <Text style={styles.connectDevBtnText}>Hubungkan</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDeviceText}>
                      Belum ada perangkat paired. Klik "Aktifkan Stik & Jadikan Terlihat", lalu buka Bluetooth Laptop dan Add Device.
                    </Text>
                  )}
                </View>

                {/* Panduan Pairing & Tips Anti Gagal */}
                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>Cara Menghubungkan Bluetooth ke Laptop:</Text>
                  <Text style={styles.guideStep}>
                    1. Tekan tombol <Text style={styles.bold}>"Aktifkan Stik & Jadikan Terlihat"</Text> di atas (izinkan jika muncul prompt izin).
                  </Text>
                  <Text style={styles.guideStep}>
                    2. Di Laptop: Buka <Text style={styles.bold}>Settings {'>'} Bluetooth & devices {'>'} Add device {'>'} Bluetooth</Text>.
                  </Text>
                  <Text style={styles.guideStep}>
                    3. Pilih perangkat dengan nama <Text style={styles.bold}>"{diag?.myDeviceName || 'Nama HP'}"</Text> atau <Text style={styles.bold}>"Wireless Controller"</Text>.
                  </Text>
                  <View style={styles.noticeBox}>
                    <Ionicons name="information-circle" size={16} color="#ffb74d" />
                    <Text style={styles.noticeText}>
                      <Text style={{ fontWeight: '800', color: '#ffb74d' }}>PENTING: </Text>
                      Jika laptop sebelumnya sudah pernah dipasangkan dengan HP ini, buka Bluetooth Windows $\rightarrow$ klik titik tiga pada HP ini $\rightarrow$ pilih <Text style={{ fontWeight: '800', color: '#fff' }}>"Remove device" (Hapus)</Text> terlebih dahulu, lalu pasangkan kembali.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* PC SERVER MODE */}
            {currentMode === 'pc_server' && (
              <View style={styles.section}>
                <View style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Status Koneksi:</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      isConnected ? styles.textSuccess : isConnecting ? styles.textWarning : styles.textMuted,
                    ]}
                  >
                    {isConnected
                      ? `🟢 Terhubung ke ${targetDevice}`
                      : isConnecting
                      ? '🟡 Sedang Menghubungkan...'
                      : '⚪ Belum Terhubung'}
                  </Text>
                </View>

                {connectionError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#ff3d00" />
                    <Text style={styles.errorText}>{connectionError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alamat IP Laptop:</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.textInput}
                      value={ipInput}
                      onChangeText={setIpInput}
                      placeholder="Contoh: 192.168.1.15"
                      placeholderTextColor="#5a637a"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="numbers-and-punctuation"
                    />
                    {isConnected ? (
                      <TouchableOpacity
                        style={[styles.connectBtn, styles.btnDisconnect]}
                        onPress={onDisconnectServer}
                      >
                        <Text style={styles.connectBtnText}>Putus</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.connectBtn, styles.btnConnect]}
                        onPress={() => onConnectServer(ipInput)}
                      >
                        <Text style={styles.connectBtnText}>{isConnecting ? 'Tunggu...' : 'Hubungkan'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.inputHint}>💡 Cukup masukkan angka IP dari terminal server laptop.</Text>
                </View>

                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>Cara Menjalankan Server di Laptop:</Text>
                  <Text style={styles.guideStep}>
                    1. Buka folder <Text style={styles.bold}>pc-server</Text> di laptop $\rightarrow$ klik kanan{' '}
                    <Text style={styles.bold}>start-windows.bat</Text> $\rightarrow$ Run as Administrator.
                  </Text>
                  <Text style={styles.guideStep}>
                    2. Pastikan HP dan Laptop berada di <Text style={styles.bold}>WiFi yang sama</Text>, atau nyalakan{' '}
                    <Text style={styles.bold}>Hotspot HP</Text> dan sambungkan laptop.
                  </Text>
                  <Text style={styles.guideStep}>3. Masukkan IP yang tertera di layar terminal laptop.</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 580,
    maxHeight: '92%',
    backgroundColor: '#12151e',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#262c3e',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1c202d',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0c0e15',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#1b2233',
    borderColor: '#00e5ff',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7d87a1',
  },
  tabTextActive: {
    color: '#00e5ff',
  },
  body: {
    maxHeight: 300,
  },
  section: {
    gap: 10,
  },
  statusBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#181c28',
    borderWidth: 1,
    borderColor: '#262d40',
  },
  statusLabel: {
    fontSize: 12,
    color: '#8b94ab',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSuccess: {
    color: '#00e676',
  },
  textWarning: {
    color: '#ffb300',
  },
  textMuted: {
    color: '#717b94',
  },
  diagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  diagBadge: {
    flex: 1,
    backgroundColor: '#161a26',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22283a',
  },
  diagKey: {
    fontSize: 9,
    color: '#7c86a2',
    fontWeight: '700',
  },
  diagVal: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  diagOk: {
    color: '#00e676',
  },
  diagWarn: {
    color: '#ffb300',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: '#00e5ff',
    flex: 1.4,
  },
  btnPrimaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  btnSecondary: {
    backgroundColor: '#192233',
    borderWidth: 1,
    borderColor: '#00e5ff',
    flex: 1,
  },
  btnSecondaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00e5ff',
  },
  btnDisconnectFull: {
    backgroundColor: '#2e1212',
    borderWidth: 1,
    borderColor: '#ff3d00',
    paddingVertical: 8,
  },
  btnDisconnectText: {
    color: '#ff5252',
    fontWeight: '700',
    fontSize: 12,
  },
  infoAlert: {
    fontSize: 11,
    color: '#00e5ff',
    backgroundColor: '#082535',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#104968',
  },
  pairedSection: {
    backgroundColor: '#141824',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#242b3d',
  },
  pairedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c2cadc',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#1d2335',
  },
  refreshText: {
    fontSize: 10,
    color: '#00e5ff',
    fontWeight: '700',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c2233',
    padding: 8,
    borderRadius: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  deviceName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  pcBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00e5ff',
    backgroundColor: '#073347',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  deviceAddress: {
    fontSize: 9,
    color: '#717c96',
  },
  connectDevBtn: {
    backgroundColor: '#00e5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  connectDevBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  noDeviceText: {
    fontSize: 11,
    color: '#6c7792',
    fontStyle: 'italic',
  },
  guideBox: {
    backgroundColor: '#0e111a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#202636',
    gap: 4,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b0bad3',
    marginBottom: 2,
  },
  guideStep: {
    fontSize: 11,
    color: '#8792ad',
    lineHeight: 16,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#261b0c',
    borderWidth: 1,
    borderColor: '#e69500',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 10,
    color: '#ffdfa8',
    lineHeight: 15,
  },
  bold: {
    fontWeight: '700',
    color: '#e0e6f5',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#301111',
    borderWidth: 1,
    borderColor: '#ff3d00',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: '#ffb4ab',
    lineHeight: 16,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b94ab',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0c0e15',
    borderWidth: 1,
    borderColor: '#282f42',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#ffffff',
  },
  inputHint: {
    fontSize: 10,
    color: '#00e5ff',
    opacity: 0.8,
  },
  connectBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  btnConnect: {
    backgroundColor: '#00e5ff',
  },
  btnDisconnect: {
    backgroundColor: '#ff3d00',
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
});
