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
  scale?: number;
}

const DEFAULT_BASE_RADIUS = 64;
const DEFAULT_STICK_RADIUS = 34;

export const AnalogStick: React.FC<AnalogStickProps> = ({
  label,
  onMove,
  onClick,
  onReleaseClick,
  isClicked,
  deadzone = 0.05,
  scale = 1.0,
}) => {
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const buttonKey: ButtonName = label === 'L3' ? 'l3' : 'r3';

  const baseRadius = DEFAULT_BASE_RADIUS * scale;
  const stickRadius = DEFAULT_STICK_RADIUS * scale;
  const maxDistance = baseRadius - (12 * scale);

  const startOffsetRef = useRef({ x: 0, y: 0 });
  const lastTapTimeRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt) => {
        // Deteksi double-tap cepat untuk L3 / R3 click
        const now = Date.now();
        if (now - lastTapTimeRef.current < 300) {
          onClick(buttonKey);
          setTimeout(() => onReleaseClick(buttonKey), 250);
        }
        lastTapTimeRef.current = now;

        // Ambil lokasi sentuhan relatif terhadap titik pusat baseSocket
        const localX = evt.nativeEvent.locationX;
        const localY = evt.nativeEvent.locationY;
        const center = baseRadius;

        let dx = localX - center;
        let dy = localY - center;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
          const angle = Math.atan2(dy, dx);
          dx = Math.cos(angle) * maxDistance;
          dy = Math.sin(angle) * maxDistance;
        }

        startOffsetRef.current = { x: dx, y: dy };
        setStickPos({ x: dx, y: dy });

        let normX = dx / maxDistance;
        let normY = dy / maxDistance;
        if (Math.abs(normX) < deadzone) normX = 0;
        if (Math.abs(normY) < deadzone) normY = 0;

        onMove(normX, normY);
      },

      onPanResponderMove: (_, gestureState) => {
        let dx = startOffsetRef.current.x + gestureState.dx;
        let dy = startOffsetRef.current.y + gestureState.dy;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
          const angle = Math.atan2(dy, dx);
          dx = Math.cos(angle) * maxDistance;
          dy = Math.sin(angle) * maxDistance;
        }

        setStickPos({ x: dx, y: dy });

        let normX = dx / maxDistance;
        let normY = dy / maxDistance;

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
      {/* Outer Socket - panHandlers dipasang di seluruh area soket agar selalu responsif */}
      <View
        {...panResponder.panHandlers}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={[
          styles.baseSocket,
          {
            width: baseRadius * 2,
            height: baseRadius * 2,
            borderRadius: baseRadius,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.innerRing,
            {
              width: (baseRadius - 10) * 2,
              height: (baseRadius - 10) * 2,
              borderRadius: baseRadius - 10,
            },
          ]}
        />

        {/* Movable Thumbstick - pointerEvents="none" agar sentuhan diproses mulus oleh baseSocket */}
        <View
          pointerEvents="none"
          style={[
            styles.thumbstick,
            {
              width: stickRadius * 2,
              height: stickRadius * 2,
              borderRadius: stickRadius,
              transform: [{ translateX: stickPos.x }, { translateY: stickPos.y }],
            },
            isClicked && styles.thumbstickClicked,
          ]}
        >
          {/* Grip Texture & Label */}
          <View
            style={[
              styles.stickCenterCap,
              {
                width: (stickRadius - 5) * 2,
                height: (stickRadius - 5) * 2,
                borderRadius: stickRadius - 5,
              },
            ]}
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
    backgroundColor: '#12141c',
    borderWidth: 2,
    borderColor: '#242938',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
  },
  innerRing: {
    borderWidth: 1.5,
    borderColor: '#1e2230',
  },
  thumbstick: {
    position: 'absolute',
    backgroundColor: '#272c3d',
    borderWidth: 2,
    borderColor: '#3a425c',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  thumbstickClicked: {
    backgroundColor: '#153154',
    borderColor: '#00e5ff',
    transform: [{ scale: 0.9 }],
  },
  stickCenterCap: {
    backgroundColor: '#1d2130',
    borderWidth: 1,
    borderColor: '#32394f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8b94ab',
  },
  stickLabelActive: {
    color: '#00e5ff',
  },
});
