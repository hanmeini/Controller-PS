import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ButtonName, ConnectionMode, ConnectionStatus } from '../types/controller';

interface CenterBarProps {
  onPressIn: (name: ButtonName) => void;
  onPressOut: (name: ButtonName) => void;
  onOpenConnection: () => void;
  onOpenSettings: () => void;
  onOpenLayout: () => void;
  mode: ConnectionMode;
  status: ConnectionStatus;
  targetDevice: string;
  pingMs: number | null;
  buttonsActive: {
    select: boolean;
    start: boolean;
    ps: boolean;
  };
}

export const CenterBar: React.FC<CenterBarProps> = ({
  onPressIn,
  onPressOut,
  onOpenConnection,
  onOpenSettings,
  onOpenLayout,
  mode,
  status,
  targetDevice,
  pingMs,
  buttonsActive,
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <View style={styles.container}>
      {/* Top Status & Controls */}
      <View style={styles.topRow}>
        {/* SHARE / CREATE */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPressIn={() => onPressIn('select')}
          onPressOut={() => onPressOut('select')}
          style={[styles.smallBtn, buttonsActive.select && styles.smallBtnActive]}
        >
          <Ionicons name="share-outline" size={14} color={buttonsActive.select ? '#00e5ff' : '#8891a9'} />
          <Text style={[styles.btnLabel, buttonsActive.select && styles.labelActive]}>SHARE</Text>
        </TouchableOpacity>

        {/* CONNECTION STATUS PILL */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenConnection}
          style={[
            styles.statusPill,
            isConnected ? styles.pillConnected : isConnecting ? styles.pillConnecting : styles.pillDisconnected,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isConnected ? styles.dotConnected : isConnecting ? styles.dotConnecting : styles.dotDisconnected,
            ]}
          />
          <MaterialCommunityIcons
            name={mode === 'bluetooth' ? 'bluetooth' : 'wifi'}
            size={13}
            color={isConnected ? '#00e5ff' : isConnecting ? '#ffb300' : '#8a94ac'}
          />
          <Text style={styles.statusText} numberOfLines={1}>
            {isConnected
              ? targetDevice || 'Terhubung'
              : isConnecting
              ? 'Menghubungkan...'
              : 'Pilih Koneksi'}
          </Text>
          {isConnected && pingMs !== null && (
            <Text style={styles.pingText}>{pingMs}ms</Text>
          )}
        </TouchableOpacity>

        {/* OPTIONS */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPressIn={() => onPressIn('start')}
          onPressOut={() => onPressOut('start')}
          style={[styles.smallBtn, buttonsActive.start && styles.smallBtnActive]}
        >
          <Ionicons name="menu-outline" size={14} color={buttonsActive.start ? '#00e5ff' : '#8891a9'} />
          <Text style={[styles.btnLabel, buttonsActive.start && styles.labelActive]}>OPTIONS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Center: PS BUTTON, LAYOUT, CONNECTION & SETTINGS */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenLayout}
          style={styles.iconBtn}
        >
          <MaterialCommunityIcons name="gamepad-circle" size={17} color="#00e5ff" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenSettings}
          style={styles.iconBtn}
        >
          <Ionicons name="settings-outline" size={16} color="#767f97" />
        </TouchableOpacity>

        {/* PS LOGO HOME BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={() => onPressIn('ps')}
          onPressOut={() => onPressOut('ps')}
          style={[styles.psButton, buttonsActive.ps && styles.psButtonActive]}
        >
          <View style={styles.psInner}>
            <Text style={[styles.psText, buttonsActive.ps && styles.psTextActive]}>PS</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenConnection}
          style={styles.iconBtn}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color="#767f97" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  smallBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#181b26',
    borderWidth: 1,
    borderColor: '#292f42',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  smallBtnActive: {
    borderColor: '#00e5ff',
    backgroundColor: '#14273e',
  },
  btnLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8891a9',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#00e5ff',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    maxWidth: 160,
  },
  pillConnected: {
    backgroundColor: '#0a2335',
    borderColor: '#00e5ff',
  },
  pillConnecting: {
    backgroundColor: '#2e240a',
    borderColor: '#ffb300',
  },
  pillDisconnected: {
    backgroundColor: '#181b26',
    borderColor: '#292f42',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotConnected: {
    backgroundColor: '#00e5ff',
  },
  dotConnecting: {
    backgroundColor: '#ffb300',
  },
  dotDisconnected: {
    backgroundColor: '#606a84',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d4daea',
  },
  pingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00e676',
    marginLeft: 2,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#161924',
    borderWidth: 1,
    borderColor: '#262c3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#12141c',
    borderWidth: 2,
    borderColor: '#2e3549',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  psButtonActive: {
    borderColor: '#00e5ff',
    backgroundColor: '#0a243a',
    transform: [{ scale: 0.93 }],
  },
  psInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1c202e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b0b9d2',
    letterSpacing: 1,
  },
  psTextActive: {
    color: '#00e5ff',
  },
});
