import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn(triggerName);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut(triggerName);
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut(triggerName);
        }}
        style={[styles.triggerBtn, triggerActive && styles.triggerActive]}
      >
        <Text style={[styles.triggerText, triggerActive && styles.textActive]}>{triggerLabel}</Text>
        <View style={[styles.triggerRidge, triggerActive && styles.ridgeActive]} />
      </View>

      {/* BUMPER (L1 / R1) - Sprint di PES, dirancang untuk multi-touch simultan */}
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn(bumperName);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut(bumperName);
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut(bumperName);
        }}
        style={[styles.bumperBtn, bumperActive && styles.bumperActive]}
      >
        <Text style={[styles.bumperText, bumperActive && styles.textActive]}>{bumperLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  triggerBtn: {
    width: 95,
    height: 46,
    backgroundColor: '#1b1f2b',
    borderWidth: 1.5,
    borderColor: '#2e3549',
    borderRadius: 12,
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
    width: 44,
    height: 3,
    backgroundColor: '#30374d',
    borderRadius: 2,
  },
  ridgeActive: {
    backgroundColor: '#00e5ff',
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8b94ab',
    letterSpacing: 1,
  },
  bumperBtn: {
    width: 95,
    height: 46,
    backgroundColor: '#222736',
    borderWidth: 1.5,
    borderColor: '#353c52',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bumperActive: {
    backgroundColor: '#1d395a',
    borderColor: '#00e5ff',
    borderWidth: 2,
    transform: [{ scale: 0.95 }],
  },
  bumperText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#a3adcb',
    letterSpacing: 1,
  },
  textActive: {
    color: '#ffffff',
  },
});
