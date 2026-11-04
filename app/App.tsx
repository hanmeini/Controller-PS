import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

import { useControllerState } from './src/hooks/useControllerState';
import { ControllerSettings } from './src/types/controller';
import { DPad } from './src/components/DPad';
import { ActionButtons } from './src/components/ActionButtons';
import { AnalogStick } from './src/components/AnalogStick';
import { ShoulderTriggers } from './src/components/ShoulderTriggers';
import { Touchpad } from './src/components/Touchpad';
import { CenterBar } from './src/components/CenterBar';
import { ConnectionModal } from './src/components/ConnectionModal';
import { SettingsModal } from './src/components/SettingsModal';

export default function App() {
  const {
    buttons,
    mode,
    status,
    targetDevice,
    serverIp,
    pingMs,
    playerNumber,
    playerColor,
    setMode,
    pressButton,
    releaseButton,
    updateAxes,
    connectToServer,
    disconnectFromServer,
  } = useControllerState();

  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [settings, setSettings] = useState<ControllerSettings>({
    vibration: true,
    vibrationStrength: 'light',
    stickDeadzone: 0.08,
    motionControl: false,
    theme: 'dark',
    touchpadMode: 'gamepad',
  });

  // Lock to landscape mode
  useEffect(() => {
    async function lockOrientation() {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (e) {
        // Fallback for dev / web
      }
    }
    lockOrientation();
  }, []);

  const handleUpdateSettings = (newSettings: Partial<ControllerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar hidden={true} />

      <View style={styles.controllerBody}>
        {/* TOP ROW: SHOULDER TRIGGERS & TOUCHPAD */}
        <View style={styles.topRow}>
          {/* LEFT TRIGGERS (L1, L2) */}
          <ShoulderTriggers
            side="left"
            onPressIn={pressButton}
            onPressOut={releaseButton}
            bumperActive={buttons.l1}
            triggerActive={buttons.l2}
          />

          {/* CENTER TOUCHPAD */}
          <Touchpad
            onPressIn={pressButton}
            onPressOut={releaseButton}
            isPressed={buttons.touchpad}
            playerColor={playerColor}
          />

          {/* RIGHT TRIGGERS (R1, R2) */}
          <ShoulderTriggers
            side="right"
            onPressIn={pressButton}
            onPressOut={releaseButton}
            bumperActive={buttons.r1}
            triggerActive={buttons.r2}
          />
        </View>

        {/* MAIN CONTROLS ROW */}
        <View style={styles.mainControlsRow}>
          {/* LEFT SIDE: D-PAD & LEFT ANALOG */}
          <View style={styles.leftControlWing}>
            <DPad
              onPressIn={pressButton}
              onPressOut={releaseButton}
              activeButtons={{
                dpad_up: buttons.dpad_up,
                dpad_down: buttons.dpad_down,
                dpad_left: buttons.dpad_left,
                dpad_right: buttons.dpad_right,
              }}
            />

            <View style={styles.stickWrapperLeft}>
              <AnalogStick
                label="L3"
                onMove={(x, y) => updateAxes({ lx: x, ly: y })}
                onClick={pressButton}
                onReleaseClick={releaseButton}
                isClicked={buttons.l3}
                deadzone={settings.stickDeadzone}
              />
            </View>
          </View>

          {/* CENTER CONTROLS (SHARE, OPTIONS, PS BUTTON, STATUS) */}
          <View style={styles.centerSection}>
            <CenterBar
              onPressIn={pressButton}
              onPressOut={releaseButton}
              onOpenConnection={() => setConnectionModalVisible(true)}
              onOpenSettings={() => setSettingsModalVisible(true)}
              mode={mode}
              status={status}
              targetDevice={targetDevice}
              pingMs={pingMs}
              buttonsActive={{
                select: buttons.select,
                start: buttons.start,
                ps: buttons.ps,
              }}
            />
          </View>

          {/* RIGHT SIDE: ACTION BUTTONS & RIGHT ANALOG */}
          <View style={styles.rightControlWing}>
            <ActionButtons
              onPressIn={pressButton}
              onPressOut={releaseButton}
              activeButtons={{
                triangle: buttons.triangle,
                circle: buttons.circle,
                cross: buttons.cross,
                square: buttons.square,
              }}
            />

            <View style={styles.stickWrapperRight}>
              <AnalogStick
                label="R3"
                onMove={(x, y) => updateAxes({ rx: x, ry: y })}
                onClick={pressButton}
                onReleaseClick={releaseButton}
                isClicked={buttons.r3}
                deadzone={settings.stickDeadzone}
              />
            </View>
          </View>
        </View>
      </View>

      {/* CONNECTION MODAL */}
      <ConnectionModal
        visible={connectionModalVisible}
        onClose={() => setConnectionModalVisible(false)}
        currentMode={mode}
        onSelectMode={setMode}
        status={status}
        targetDevice={targetDevice}
        serverIp={serverIp}
        onConnectServer={connectToServer}
        onDisconnectServer={disconnectFromServer}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0a0c12',
  },
  controllerBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  mainControlsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControlWing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightControlWing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stickWrapperLeft: {
    marginLeft: 6,
    marginTop: 24,
  },
  stickWrapperRight: {
    marginRight: 6,
    marginTop: 24,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
});
