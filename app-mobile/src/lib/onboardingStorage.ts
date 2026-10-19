import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ONBOARDING_KEY = 'bt_has_completed_onboarding';

/**
 * Checks whether the user has completed or skipped the initial onboarding flow.
 */
export async function getHasCompletedOnboarding(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem(ONBOARDING_KEY) === 'true' : false;
    }
    const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return val === 'true';
  } catch (err) {
    console.warn('Error reading onboarding status:', err);
    return false;
  }
}

/**
 * Sets the onboarding completion status in persistent storage.
 */
export async function setHasCompletedOnboarding(completed: boolean = true): Promise<void> {
  try {
    const val = completed ? 'true' : 'false';
    if (Platform.OS === 'web') {
      window.localStorage.setItem(ONBOARDING_KEY, val);
    } else {
      await SecureStore.setItemAsync(ONBOARDING_KEY, val);
    }
  } catch (err) {
    console.warn('Error setting onboarding status:', err);
  }
}

/**
 * Resets the onboarding status (useful for debugging/testing).
 */
export async function resetOnboarding(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(ONBOARDING_KEY);
    } else {
      await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    }
  } catch (err) {
    console.warn('Error resetting onboarding status:', err);
  }
}
