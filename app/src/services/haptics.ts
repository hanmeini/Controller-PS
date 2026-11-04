import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

let vibrationEnabled = true;
let vibrationType: 'light' | 'medium' | 'heavy' = 'light';

export const configureHaptics = (enabled: boolean, strength: 'light' | 'medium' | 'heavy') => {
  vibrationEnabled = enabled;
  vibrationType = strength;
};

export const triggerHaptic = (customStrength?: 'light' | 'medium' | 'heavy') => {
  if (!vibrationEnabled) return;
  const strength = customStrength || vibrationType;

  try {
    if (strength === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (strength === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch (e) {
    // Fallback standard vibration
    Vibration.vibrate(15);
  }
};
