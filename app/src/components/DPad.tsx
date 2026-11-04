import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonName } from '../types/controller';

interface DPadProps {
  onPressIn: (name: ButtonName) => void;
  onPressOut: (name: ButtonName) => void;
  activeButtons: {
    dpad_up: boolean;
    dpad_down: boolean;
    dpad_left: boolean;
    dpad_right: boolean;
  };
}

export const DPad: React.FC<DPadProps> = ({ onPressIn, onPressOut, activeButtons }) => {
  return (
    <View style={styles.container}>
      {/* Background Cross Plate */}
      <View style={styles.crossPlateVertical} />
      <View style={styles.crossPlateHorizontal} />
      <View style={styles.crossCenter} />

      {/* UP */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('dpad_up')}
        onPressOut={() => onPressOut('dpad_up')}
        style={[styles.button, styles.btnUp, activeButtons.dpad_up && styles.btnActive]}
      >
        <Ionicons name="caret-up" size={26} color={activeButtons.dpad_up ? '#00e5ff' : '#a0a5b5'} />
      </TouchableOpacity>

      {/* RIGHT */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('dpad_right')}
        onPressOut={() => onPressOut('dpad_right')}
        style={[styles.button, styles.btnRight, activeButtons.dpad_right && styles.btnActive]}
      >
        <Ionicons name="caret-forward" size={26} color={activeButtons.dpad_right ? '#00e5ff' : '#a0a5b5'} />
      </TouchableOpacity>

      {/* DOWN */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('dpad_down')}
        onPressOut={() => onPressOut('dpad_down')}
        style={[styles.button, styles.btnDown, activeButtons.dpad_down && styles.btnActive]}
      >
        <Ionicons name="caret-down" size={26} color={activeButtons.dpad_down ? '#00e5ff' : '#a0a5b5'} />
      </TouchableOpacity>

      {/* LEFT */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('dpad_left')}
        onPressOut={() => onPressOut('dpad_left')}
        style={[styles.button, styles.btnLeft, activeButtons.dpad_left && styles.btnActive]}
      >
        <Ionicons name="caret-back" size={26} color={activeButtons.dpad_left ? '#00e5ff' : '#a0a5b5'} />
      </TouchableOpacity>
    </View>
  );
};

const SIZE = 160;
const BTN_SIZE = 52;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossPlateVertical: {
    position: 'absolute',
    width: BTN_SIZE + 6,
    height: SIZE,
    backgroundColor: '#161922',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262a38',
  },
  crossPlateHorizontal: {
    position: 'absolute',
    width: SIZE,
    height: BTN_SIZE + 6,
    backgroundColor: '#161922',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262a38',
  },
  crossCenter: {
    position: 'absolute',
    width: BTN_SIZE - 6,
    height: BTN_SIZE - 6,
    backgroundColor: '#1e2230',
    borderRadius: (BTN_SIZE - 6) / 2,
    zIndex: 1,
  },
  button: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: '#222634',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  btnUp: {
    top: 2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  btnRight: {
    right: 2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  btnDown: {
    bottom: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  btnLeft: {
    left: 2,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  btnActive: {
    backgroundColor: '#1a3045',
    borderColor: '#00e5ff',
    borderWidth: 1.5,
    transform: [{ scale: 0.94 }],
  },
});
