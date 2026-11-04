import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConnectionMode, ConnectionStatus } from '../types/controller';
import BluetoothHid from '../../modules/bluetooth-hid/src';

interface ConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: ConnectionMode;
  onSelectMode: (mode: ConnectionMode) => void;
  status: ConnectionStatus;
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
  targetDevice,
  serverIp,
  onConnectServer,
  onDisconnectServer,
}) => {
  const [ipInput, setIpInput] = useState(serverIp || '192.168.1.100:8765');
  const [btStatusMsg, setBtStatusMsg] = useState('');
  const isConnected = status === 'connected';

  const handleRegisterBt = async () => {
    try {
      setBtStatusMsg('Mendaftarkan HID Gamepad ke sistem...');
      const success = await BluetoothHid.registerGamepadApp();
      if (success) {
        setBtStatusMsg('✅ HID Gamepad terdaftar! Membuka Bluetooth discoverable...');
        BluetoothHid.requestDiscoverable();
      } else {
        setBtStatusMsg('⚠️ Gagal mendaftarkan profil HID Bluetooth pada perangkat ini.');
      }
    } catch (e: any) {
      setBtStatusMsg(`Error: ${e?.message || 'Gagal'}`);
    }
  };

  const handleMakeDiscoverable = () => {
    BluetoothHid.requestDiscoverable();
    setBtStatusMsg('📡 Bluetooth HP sekarang dapat ditemukan oleh Laptop (300 detik).');
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
                <View style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Status Bluetooth:</Text>
                  <Text style={[styles.statusValue, isConnected ? styles.textSuccess : styles.textMuted]}>
                    {isConnected ? `🟢 Terhubung: ${targetDevice}` : '⚪ Belum Terhubung'}
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnPrimary]}
                    onPress={handleRegisterBt}
                  >
                    <Ionicons name="bluetooth" size={16} color="#000" />
                    <Text style={styles.btnPrimaryText}>Aktifkan Mode Gamepad</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnSecondary]}
                    onPress={handleMakeDiscoverable}
                  >
                    <Ionicons name="radio-outline" size={16} color="#00e5ff" />
                    <Text style={styles.btnSecondaryText}>Buat HP Terlihat (Pairing)</Text>
                  </TouchableOpacity>
                </View>

                {btStatusMsg ? <Text style={styles.infoAlert}>{btStatusMsg}</Text> : null}

                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>Cara Hubungkan via Bluetooth ke Laptop:</Text>
                  <Text style={styles.guideStep}>1. Tekan tombol <Text style={styles.bold}>"Aktifkan Mode Gamepad"</Text> di atas.</Text>
                  <Text style={styles.guideStep}>2. Buka <Text style={styles.bold}>Settings {'>'} Bluetooth</Text> di Laptop Windows/Mac.</Text>
                  <Text style={styles.guideStep}>3. Pilih <Text style={styles.bold}>"Add Device"</Text> {'>'} pilih perangkat bernama <Text style={styles.bold}>"Wireless Controller"</Text>.</Text>
                  <Text style={styles.guideStep}>4. Setelah berpasangan, game di laptop akan langsung mendeteksi joystick!</Text>
                </View>
              </View>
            )}

            {/* PC SERVER MODE */}
            {currentMode === 'pc_server' && (
              <View style={styles.section}>
                <View style={styles.statusBox}>
                  <Text style={styles.statusLabel}>Status PC Server:</Text>
                  <Text style={[styles.statusValue, isConnected ? styles.textSuccess : styles.textMuted]}>
                    {isConnected ? `🟢 Terhubung ke ${targetDevice}` : '⚪ Belum Terhubung'}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alamat IP & Port Laptop:</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.textInput}
                      value={ipInput}
                      onChangeText={setIpInput}
                      placeholder="Contoh: 192.168.1.15:8765"
                      placeholderTextColor="#5a637a"
                      autoCapitalize="none"
                      autoCorrect={false}
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
                        <Text style={styles.connectBtnText}>Hubungkan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.guideBox}>
                  <Text style={styles.guideTitle}>Cara Menjalankan Server di Laptop:</Text>
                  <Text style={styles.guideStep}>1. Buka folder <Text style={styles.bold}>pc-server</Text> di laptop Anda.</Text>
                  <Text style={styles.guideStep}>2. Klik ganda <Text style={styles.bold}>start-windows.bat</Text> (atau jalankan <Text style={styles.bold}>python server.py</Text>).</Text>
                  <Text style={styles.guideStep}>3. Server akan menampilkan alamat IP laptop di terminal.</Text>
                  <Text style={styles.guideStep}>4. Masukkan IP tersebut pada kolom di atas lalu tekan <Text style={styles.bold}>Hubungkan</Text>.</Text>
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
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '90%',
    maxWidth: 580,
    maxHeight: '90%',
    backgroundColor: '#12151e',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#262c3e',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#7d87a1',
  },
  tabTextActive: {
    color: '#00e5ff',
  },
  body: {
    maxHeight: 280,
  },
  section: {
    gap: 12,
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
  textMuted: {
    color: '#717b94',
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
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  btnSecondary: {
    backgroundColor: '#192233',
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00e5ff',
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
  guideBox: {
    backgroundColor: '#0e111a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#202636',
    gap: 5,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b0bad3',
    marginBottom: 4,
  },
  guideStep: {
    fontSize: 11,
    color: '#8792ad',
    lineHeight: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#e0e6f5',
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
