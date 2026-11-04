import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ButtonName } from '../types/controller';

interface ActionButtonsProps {
  onPressIn: (name: ButtonName) => void;
  onPressOut: (name: ButtonName) => void;
  activeButtons: {
    triangle: boolean;
    circle: boolean;
    cross: boolean;
    square: boolean;
  };
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPressIn,
  onPressOut,
  activeButtons,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Circular Plate */}
      <View style={styles.plate} />

      {/* TRIANGLE (Top) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('triangle')}
        onPressOut={() => onPressOut('triangle')}
        style={[
          styles.button,
          styles.btnTriangle,
          activeButtons.triangle && styles.btnTriangleActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symTriangle, activeButtons.triangle && styles.symActive]}>
          ▲
        </Text>
      </TouchableOpacity>

      {/* CIRCLE (Right) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('circle')}
        onPressOut={() => onPressOut('circle')}
        style={[
          styles.button,
          styles.btnCircle,
          activeButtons.circle && styles.btnCircleActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symCircle, activeButtons.circle && styles.symActive]}>
          ●
        </Text>
      </TouchableOpacity>

      {/* CROSS (Bottom) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('cross')}
        onPressOut={() => onPressOut('cross')}
        style={[
          styles.button,
          styles.btnCross,
          activeButtons.cross && styles.btnCrossActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symCross, activeButtons.cross && styles.symActive]}>
          ✕
        </Text>
      </TouchableOpacity>

      {/* SQUARE (Left) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={() => onPressIn('square')}
        onPressOut={() => onPressOut('square')}
        style={[
          styles.button,
          styles.btnSquare,
          activeButtons.square && styles.btnSquareActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symSquare, activeButtons.square && styles.symActive]}>
          ■
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const SIZE = 160;
const BTN_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plate: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#262a38',
  },
  button: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: '#222634',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#2d3345',
  },
  btnTriangle: {
    top: 4,
  },
  btnCircle: {
    right: 4,
  },
  btnCross: {
    bottom: 4,
  },
  btnSquare: {
    left: 4,
  },
  symbol: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  symTriangle: {
    color: '#00e676', // Green
  },
  symCircle: {
    color: '#ff3d00', // Red
  },
  symCross: {
    color: '#2979ff', // Blue
  },
  symSquare: {
    color: '#f50057', // Pink
  },
  symActive: {
    color: '#ffffff',
  },
  btnTriangleActive: {
    backgroundColor: '#0a3d24',
    borderColor: '#00e676',
    borderWidth: 2,
    transform: [{ scale: 0.94 }],
  },
  btnCircleActive: {
    backgroundColor: '#441408',
    borderColor: '#ff3d00',
    borderWidth: 2,
    transform: [{ scale: 0.94 }],
  },
  btnCrossActive: {
    backgroundColor: '#092754',
    borderColor: '#2979ff',
    borderWidth: 2,
    transform: [{ scale: 0.94 }],
  },
  btnSquareActive: {
    backgroundColor: '#42071d',
    borderColor: '#f50057',
    borderWidth: 2,
    transform: [{ scale: 0.94 }],
  },
});
