import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ControllerLayoutConfig } from '../types/controller';

interface LayoutModalProps {
  visible: boolean;
  onClose: () => void;
  layout: ControllerLayoutConfig;
  onUpdateLayout: (newLayout: Partial<ControllerLayoutConfig>) => void;
  onResetLayout: () => void;
}

export const LayoutModal: React.FC<LayoutModalProps> = ({
  visible,
  onClose,
  layout,
  onUpdateLayout,
  onResetLayout,
}) => {
  const setPreset = (preset: 'dualshock' | 'xbox') => {
    if (preset === 'dualshock') {
      onUpdateLayout({
        preset: 'dualshock',
        dpadOnTop: true,
        actionOnTop: true,
        leftWingOffsetX: 0,
        leftWingOffsetY: 0,
        rightWingOffsetX: 0,
        rightWingOffsetY: 0,
      });
    } else if (preset === 'xbox') {
      onUpdateLayout({
        preset: 'xbox',
        dpadOnTop: false, // L3 di Atas, D-Pad di Bawah
        actionOnTop: true,
        leftWingOffsetX: 0,
        leftWingOffsetY: 0,
        rightWingOffsetX: 0,
        rightWingOffsetY: 0,
      });
    }
  };

  const toggleLeftSwap = () => {
    onUpdateLayout({
      preset: 'custom',
      dpadOnTop: !layout.dpadOnTop,
    });
  };

  const toggleRightSwap = () => {
    onUpdateLayout({
      preset: 'custom',
      actionOnTop: !layout.actionOnTop,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="gamepad-circle" size={22} color="#00e5ff" />
              <Text style={styles.title}>Sesuaikan Posisi & Ukuran Stik</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#8a94ac" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* PRESET PILIHAN CEPAT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pilihan Preset Cepat:</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    layout.preset === 'dualshock' && styles.presetBtnActive,
                  ]}
                  onPress={() => setPreset('dualshock')}
                >
                  <Text style={[styles.presetText, layout.preset === 'dualshock' && styles.presetTextActive]}>
                    🎮 DualShock (PS)
                  </Text>
                  <Text style={styles.presetSub}>D-Pad Atas, L3 Bawah</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    layout.preset === 'xbox' && styles.presetBtnActive,
                  ]}
                  onPress={() => setPreset('xbox')}
                >
                  <Text style={[styles.presetText, layout.preset === 'xbox' && styles.presetTextActive]}>
                    🎯 Xbox Style
                  </Text>
                  <Text style={styles.presetSub}>L3 Atas, D-Pad Bawah</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* TUKAR POSISI ATAS / BAWAH */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tukar Posisi Tombol & Stik Analog:</Text>
              <View style={styles.btnRow}>
                {/* Sisi Kiri */}
                <TouchableOpacity
                  style={[styles.toggleBtn, !layout.dpadOnTop && styles.toggleBtnActive]}
                  onPress={toggleLeftSwap}
                >
                  <Ionicons name="swap-vertical" size={18} color={layout.dpadOnTop ? '#8a94ac' : '#00e5ff'} />
                  <View>
                    <Text style={styles.toggleBtnText}>Sisi Kiri (L3 / D-Pad)</Text>
                    <Text style={styles.toggleBtnSub}>
                      {layout.dpadOnTop ? 'D-Pad di Atas, L3 di Bawah' : 'L3 di Atas, D-Pad di Bawah'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Sisi Kanan */}
                <TouchableOpacity
                  style={[styles.toggleBtn, !layout.actionOnTop && styles.toggleBtnActive]}
                  onPress={toggleRightSwap}
                >
                  <Ionicons name="swap-vertical" size={18} color={layout.actionOnTop ? '#8a94ac' : '#00e5ff'} />
                  <View>
                    <Text style={styles.toggleBtnText}>Sisi Kanan (R3 / Aksi)</Text>
                    <Text style={styles.toggleBtnSub}>
                      {layout.actionOnTop ? 'Aksi di Atas, R3 di Bawah' : 'R3 di Atas, Aksi di Bawah'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* UKURAN TOMBOL AKSI */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ukuran Tombol Aksi (△ ○ ✕ □):</Text>
              <View style={styles.segmentedControl}>
                {[
                  { label: 'Normal (100%)', scale: 1.0 },
                  { label: 'Besar (115%)', scale: 1.15 },
                  { label: 'Jumbo (130%)', scale: 1.3 },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.segmentBtn,
                      layout.buttonScale === item.scale && styles.segmentBtnActive,
                    ]}
                    onPress={() => onUpdateLayout({ buttonScale: item.scale, preset: 'custom' })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        layout.buttonScale === item.scale && styles.segmentTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* GESER POSISI HORIZONTAL SISI KIRI & KANAN */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Geser Posisi dari Tepi Layar (Jarak Jempol):</Text>
              
              <View style={styles.adjustRow}>
                <Text style={styles.adjustLabel}>Sisi Kiri (D-Pad & L3):</Text>
                <View style={styles.adjustControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      onUpdateLayout({
                        leftWingOffsetX: Math.max(-20, layout.leftWingOffsetX - 15),
                        preset: 'custom',
                      })
                    }
                  >
                    <Text style={styles.stepBtnText}>⇦ Tepi</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{layout.leftWingOffsetX > 0 ? `+${layout.leftWingOffsetX}` : layout.leftWingOffsetX}px</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      onUpdateLayout({
                        leftWingOffsetX: Math.min(50, layout.leftWingOffsetX + 15),
                        preset: 'custom',
                      })
                    }
                  >
                    <Text style={styles.stepBtnText}>Tengah ⇨</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.adjustRow}>
                <Text style={styles.adjustLabel}>Sisi Kanan (Aksi & R3):</Text>
                <View style={styles.adjustControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      onUpdateLayout({
                        rightWingOffsetX: Math.min(20, layout.rightWingOffsetX + 15),
                        preset: 'custom',
                      })
                    }
                  >
                    <Text style={styles.stepBtnText}>Tepi ⇨</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{layout.rightWingOffsetX > 0 ? `+${layout.rightWingOffsetX}` : layout.rightWingOffsetX}px</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() =>
                      onUpdateLayout({
                        rightWingOffsetX: Math.max(-50, layout.rightWingOffsetX - 15),
                        preset: 'custom',
                      })
                    }
                  >
                    <Text style={styles.stepBtnText}>⇦ Tengah</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* RESET BUTTON */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={onResetLayout}>
                <Ionicons name="refresh" size={14} color="#ff3d00" />
                <Text style={styles.resetBtnText}>Kembalikan ke Default</Text>
              </TouchableOpacity>
            </View>
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
  body: {
    maxHeight: 280,
  },
  section: {
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b94ab',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#171b26',
    borderWidth: 1,
    borderColor: '#282f42',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnActive: {
    borderColor: '#00e5ff',
    backgroundColor: '#10283c',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a0aabf',
  },
  presetTextActive: {
    color: '#00e5ff',
  },
  presetSub: {
    fontSize: 10,
    color: '#656f87',
    marginTop: 2,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171b26',
    borderWidth: 1,
    borderColor: '#282f42',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  toggleBtnActive: {
    borderColor: '#00e5ff',
    backgroundColor: '#10283c',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d4daea',
  },
  toggleBtnSub: {
    fontSize: 9,
    color: '#6c7792',
    marginTop: 1,
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
    paddingVertical: 8,
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
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171b26',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adjustLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c2cadc',
  },
  adjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#202636',
    borderRadius: 6,
  },
  stepBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00e5ff',
  },
  stepVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    minWidth: 36,
    textAlign: 'center',
  },
  footerRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#2b1414',
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff3d00',
  },
});
