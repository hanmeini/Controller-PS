import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
      {/* Background Circular Plate (Diperbesar) */}
      <View style={styles.plate} />

      {/* TRIANGLE (Atas - Terobos di PES) */}
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn('triangle');
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut('triangle');
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut('triangle');
        }}
        style={[
          styles.button,
          styles.btnTriangle,
          activeButtons.triangle && styles.btnTriangleActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symTriangle, activeButtons.triangle && styles.symActive]}>
          ▲
        </Text>
      </View>

      {/* CIRCLE (Kanan - Crossing / Sliding di PES) */}
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn('circle');
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut('circle');
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut('circle');
        }}
        style={[
          styles.button,
          styles.btnCircle,
          activeButtons.circle && styles.btnCircleActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symCircle, activeButtons.circle && styles.symActive]}>
          ●
        </Text>
      </View>

      {/* CROSS (Bawah - Operan / Pressing di PES) */}
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn('cross');
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut('cross');
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut('cross');
        }}
        style={[
          styles.button,
          styles.btnCross,
          activeButtons.cross && styles.btnCrossActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symCross, activeButtons.cross && styles.symActive]}>
          ✕
        </Text>
      </View>

      {/* SQUARE (Kiri - Tendang / Shoot di PES) */}
      <View
        onTouchStart={(e) => {
          e.stopPropagation();
          onPressIn('square');
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onPressOut('square');
        }}
        onTouchCancel={(e) => {
          e.stopPropagation();
          onPressOut('square');
        }}
        style={[
          styles.button,
          styles.btnSquare,
          activeButtons.square && styles.btnSquareActive,
        ]}
      >
        <Text style={[styles.symbol, styles.symSquare, activeButtons.square && styles.symActive]}>
          ■
        </Text>
      </View>
    </View>
  );
};

const SIZE = 195;
const BTN_SIZE = 58;

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
    borderWidth: 1.5,
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: '#2d3345',
  },
  btnTriangle: {
    top: 6,
  },
  btnCircle: {
    right: 6,
  },
  btnCross: {
    bottom: 6,
  },
  btnSquare: {
    left: 6,
  },
  symbol: {
    fontSize: 26,
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
    borderWidth: 2.5,
    transform: [{ scale: 0.93 }],
  },
  btnCircleActive: {
    backgroundColor: '#441408',
    borderColor: '#ff3d00',
    borderWidth: 2.5,
    transform: [{ scale: 0.93 }],
  },
  btnCrossActive: {
    backgroundColor: '#092754',
    borderColor: '#2979ff',
    borderWidth: 2.5,
    transform: [{ scale: 0.93 }],
  },
  btnSquareActive: {
    backgroundColor: '#42071d',
    borderColor: '#f50057',
    borderWidth: 2.5,
    transform: [{ scale: 0.93 }],
  },
});
