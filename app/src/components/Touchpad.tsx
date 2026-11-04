import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonName } from '../types/controller';

interface TouchpadProps {
  onPressIn: (name: ButtonName) => void;
  onPressOut: (name: ButtonName) => void;
  isPressed: boolean;
  playerColor?: string;
}

export const Touchpad: React.FC<TouchpadProps> = ({
  onPressIn,
  onPressOut,
  isPressed,
  playerColor = '#00e5ff',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={() => onPressIn('touchpad')}
      onPressOut={() => onPressOut('touchpad')}
      style={[styles.container, isPressed && styles.containerPressed]}
    >
      <View style={[styles.topLightBar, { backgroundColor: playerColor }]} />
      <View style={styles.innerContent}>
        <Ionicons
          name="finger-print-outline"
          size={24}
          color={isPressed ? playerColor : '#4b546d'}
        />
        <Text style={[styles.label, isPressed && { color: playerColor }]}>TOUCHPAD</Text>
      </View>
      <View style={[styles.bottomClicker, isPressed && { backgroundColor: playerColor }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 75,
    backgroundColor: '#161924',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#262c3e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  containerPressed: {
    borderColor: '#00e5ff',
    backgroundColor: '#132338',
    transform: [{ scale: 0.97 }],
  },
  topLightBar: {
    position: 'absolute',
    top: 0,
    width: 60,
    height: 3,
    backgroundColor: '#00e5ff',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.8,
  },
  innerContent: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5b647f',
    letterSpacing: 2,
  },
  labelPressed: {
    color: '#00e5ff',
  },
  bottomClicker: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 4,
    backgroundColor: '#1f2434',
  },
  bottomClickerPressed: {
    backgroundColor: '#00e5ff',
  },
});
