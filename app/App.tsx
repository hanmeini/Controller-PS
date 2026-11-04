import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
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
      } catch (e) {}
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
          {/* LEFT BUMPERS (L2 & L1) */}
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

          {/* RIGHT BUMPERS (R1 & R2) - R1 untuk Sprint di PES */}
          <ShoulderTriggers
            side="right"
            onPressIn={pressButton}
            onPressOut={releaseButton}
            bumperActive={buttons.r1}
            triggerActive={buttons.r2}
          />
        </View>

        {/* MAIN GAMEPLAY AREA: VERTICAL DUALSHOCK STACK */}
        <View style={styles.mainControlsRow}>
          {/* LEFT WING: D-PAD DI ATAS, ANALOG L3 DI BAWAHNYA */}
          <View style={styles.verticalLeftWing}>
            <View style={styles.dpadBox}>
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
            </View>

            <View style={styles.stickBoxLeft}>
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

          {/* CENTER SECTION: SHARE, OPTIONS, STATUS & PS BUTTON */}
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

          {/* RIGHT WING: TOMBOL AKSI DIPERBESAR DI ATAS, ANALOG R3 DI BAWAHNYA */}
          <View style={styles.verticalRightWing}>
            <View style={styles.actionButtonsBox}>
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
            </View>

            <View style={styles.stickBoxRight}>
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
    paddingHorizontal: 18,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  mainControlsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalLeftWing: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 4,
  },
  dpadBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickBoxLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  verticalRightWing: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 4,
  },
  actionButtonsBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickBoxRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
});
