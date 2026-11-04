import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import { ButtonName } from '../types/controller';

interface AnalogStickProps {
  label: 'L3' | 'R3';
  onMove: (x: number, y: number) => void;
  onClick: (name: ButtonName) => void;
  onReleaseClick: (name: ButtonName) => void;
  isClicked: boolean;
  deadzone?: number;
}

const BASE_RADIUS = 62;
const STICK_RADIUS = 32;
const MAX_DISTANCE = BASE_RADIUS - 14;

export const AnalogStick: React.FC<AnalogStickProps> = ({
  label,
  onMove,
  onClick,
  onReleaseClick,
  isClicked,
  deadzone = 0.08,
}) => {
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const buttonKey: ButtonName = label === 'L3' ? 'l3' : 'r3';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;
        let dy = gestureState.dy;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > MAX_DISTANCE) {
          const angle = Math.atan2(dy, dx);
          dx = Math.cos(angle) * MAX_DISTANCE;
          dy = Math.sin(angle) * MAX_DISTANCE;
        }

        setStickPos({ x: dx, y: dy });

        // Normalize to -1.0 to 1.0
        let normX = dx / MAX_DISTANCE;
        let normY = dy / MAX_DISTANCE;

        // Apply deadzone
        if (Math.abs(normX) < deadzone) normX = 0;
        if (Math.abs(normY) < deadzone) normY = 0;

        onMove(normX, normY);
      },
      onPanResponderRelease: () => {
        setStickPos({ x: 0, y: 0 });
        onMove(0, 0);
      },
      onPanResponderTerminate: () => {
        setStickPos({ x: 0, y: 0 });
        onMove(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Outer Socket */}
      <View style={styles.baseSocket}>
        <View style={styles.innerRing} />

        {/* Movable Thumbstick */}
        <View
          {...panResponder.panHandlers}
          style={[
            styles.thumbstick,
            {
              transform: [{ translateX: stickPos.x }, { translateY: stickPos.y }],
            },
            isClicked && styles.thumbstickClicked,
          ]}
        >
          {/* Grip Texture & L3/R3 Click */}
          <View
            onTouchStart={(e) => {
              e.stopPropagation();
              onClick(buttonKey);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onReleaseClick(buttonKey);
            }}
            onTouchCancel={(e) => {
              e.stopPropagation();
              onReleaseClick(buttonKey);
            }}
            style={styles.stickCenterCap}
          >
            <Text style={[styles.stickLabel, isClicked && styles.stickLabelActive]}>{label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseSocket: {
    width: BASE_RADIUS * 2,
    height: BASE_RADIUS * 2,
    borderRadius: BASE_RADIUS,
    backgroundColor: '#12141c',
    borderWidth: 2,
    borderColor: '#242938',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 3,
  },
  innerRing: {
    width: (BASE_RADIUS - 10) * 2,
    height: (BASE_RADIUS - 10) * 2,
    borderRadius: BASE_RADIUS - 10,
    borderWidth: 1,
    borderColor: '#1e2230',
  },
  thumbstick: {
    position: 'absolute',
    width: STICK_RADIUS * 2,
    height: STICK_RADIUS * 2,
    borderRadius: STICK_RADIUS,
    backgroundColor: '#272c3d',
    borderWidth: 2,
    borderColor: '#3a425c',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  thumbstickClicked: {
    backgroundColor: '#153154',
    borderColor: '#00e5ff',
    transform: [{ scale: 0.9 }],
  },
  stickCenterCap: {
    width: (STICK_RADIUS - 5) * 2,
    height: (STICK_RADIUS - 5) * 2,
    borderRadius: STICK_RADIUS - 5,
    backgroundColor: '#1d2130',
    borderWidth: 1,
    borderColor: '#32394f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7b839b',
  },
  stickLabelActive: {
    color: '#00e5ff',
  },
});
