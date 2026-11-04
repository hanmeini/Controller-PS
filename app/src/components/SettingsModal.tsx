import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ControllerSettings } from '../types/controller';
import { configureHaptics } from '../services/haptics';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ControllerSettings;
  onUpdateSettings: (newSettings: Partial<ControllerSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const toggleVibration = (val: boolean) => {
    onUpdateSettings({ vibration: val });
    configureHaptics(val, settings.vibrationStrength);
  };

  const setVibrationStrength = (strength: 'light' | 'medium' | 'heavy') => {
    onUpdateSettings({ vibrationStrength: strength });
    configureHaptics(settings.vibration, strength);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="settings-sharp" size={20} color="#00e5ff" />
              <Text style={styles.title}>Pengaturan Controller</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#8a94ac" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Getaran / Haptic Feedback */}
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Getaran Tombol (Haptics)</Text>
                <Text style={styles.settingDesc}>Efek getar saat tombol ditekan</Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={toggleVibration}
                thumbColor={settings.vibration ? '#00e5ff' : '#6b7280'}
                trackColor={{ false: '#1f2433', true: '#0e3b52' }}
              />
            </View>

            {/* Intensitas Getaran */}
            {settings.vibration && (
              <View style={styles.settingItemCol}>
                <Text style={styles.settingTitle}>Kekuatan Getaran:</Text>
                <View style={styles.segmentedControl}>
                  {(['light', 'medium', 'heavy'] as const).map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.segmentBtn,
                        settings.vibrationStrength === lvl && styles.segmentBtnActive,
                      ]}
                      onPress={() => setVibrationStrength(lvl)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          settings.vibrationStrength === lvl && styles.segmentTextActive,
                        ]}
                      >
                        {lvl === 'light' ? 'Ringan' : lvl === 'medium' ? 'Sedang' : 'Kuat'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Analog Deadzone */}
            <View style={styles.settingItemCol}>
              <Text style={styles.settingTitle}>Analog Stick Deadzone:</Text>
              <View style={styles.segmentedControl}>
                {[0.05, 0.1, 0.15].map((dz) => (
                  <TouchableOpacity
                    key={dz}
                    style={[
                      styles.segmentBtn,
                      settings.stickDeadzone === dz && styles.segmentBtnActive,
                    ]}
                    onPress={() => onUpdateSettings({ stickDeadzone: dz })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        settings.stickDeadzone === dz && styles.segmentTextActive,
                      ]}
                    >
                      {dz * 100}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
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
    maxWidth: 460,
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
    marginBottom: 16,
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
  body: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemCol: {
    gap: 8,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f5',
  },
  settingDesc: {
    fontSize: 11,
    color: '#717c98',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#0c0e15',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#1b2336',
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#727c96',
  },
  segmentTextActive: {
    color: '#00e5ff',
  },
});
