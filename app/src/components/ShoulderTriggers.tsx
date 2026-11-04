import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ButtonName } from '../types/controller';

interface ShoulderTriggersProps {
  side: 'left' | 'right';
  onPressIn: (name: ButtonName) => void;
  onPressOut: (name: ButtonName) => void;
  bumperActive: boolean;
  triggerActive: boolean;
}

export const ShoulderTriggers: React.FC<ShoulderTriggersProps> = ({
  side,
  onPressIn,
  onPressOut,
  bumperActive,
  triggerActive,
}) => {
  const isLeft = side === 'left';
  const bumperName: ButtonName = isLeft ? 'l1' : 'r1';
  const triggerName: ButtonName = isLeft ? 'l2' : 'r2';
  const bumperLabel = isLeft ? 'L1' : 'R1';
  const triggerLabel = isLeft ? 'L2' : 'R2';

  return (
    <View style={[styles.container, isLeft ? styles.alignLeft : styles.alignRight]}>
      {/* TRIGGER (L2 / R2) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn(triggerName)}
        onPressOut={() => onPressOut(triggerName)}
        style={[styles.triggerBtn, triggerActive && styles.triggerActive]}
      >
        <Text style={[styles.triggerText, triggerActive && styles.textActive]}>{triggerLabel}</Text>
        <View style={[styles.triggerRidge, triggerActive && styles.ridgeActive]} />
      </TouchableOpacity>

      {/* BUMPER (L1 / R1) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn(bumperName)}
        onPressOut={() => onPressOut(bumperName)}
        style={[styles.bumperBtn, bumperActive && styles.bumperActive]}
      >
        <Text style={[styles.bumperText, bumperActive && styles.textActive]}>{bumperLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  triggerBtn: {
    width: 90,
    height: 44,
    backgroundColor: '#1b1f2b',
    borderWidth: 1.5,
    borderColor: '#2e3549',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  triggerActive: {
    backgroundColor: '#15324e',
    borderColor: '#00e5ff',
    transform: [{ scale: 0.95 }],
  },
  triggerRidge: {
    position: 'absolute',
    bottom: 3,
    width: 40,
    height: 3,
    backgroundColor: '#30374d',
    borderRadius: 2,
  },
  ridgeActive: {
    backgroundColor: '#00e5ff',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8b94ab',
    letterSpacing: 1,
  },
  bumperBtn: {
    width: 80,
    height: 44,
    backgroundColor: '#222736',
    borderWidth: 1.5,
    borderColor: '#353c52',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bumperActive: {
    backgroundColor: '#1d395a',
    borderColor: '#00e5ff',
    transform: [{ scale: 0.95 }],
  },
  bumperText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#a3adcb',
    letterSpacing: 1,
  },
  textActive: {
    color: '#ffffff',
  },
});
