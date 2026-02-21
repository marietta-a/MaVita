import { App } from '@capacitor/app';

export const CURRENT_APP_VERSION = "1.0.0";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.mavita.app";

export interface UpdateStatus {
  updateAvailable: boolean;
  currentVersion: string;
  remoteVersion: string;
}

/**
 * Checks if a newer version of the app is available.
 * In production, this would fetch a JSON file from your server.
 */
export const checkForAppUpdates = async (): Promise<UpdateStatus> => {
  try {
    // 1. Get Current Version
    // Capacitor: const info = await App.getInfo(); const current = info.version;
    const current = CURRENT_APP_VERSION;

    // 2. Fetch Remote Version
    // const response = await fetch('https://api.mavita.com/version.json');
    // const data = await response.json();
    // const remote = data.version;
    
    // SIMULATION: Hardcoded remote version for demo purposes
    // Change this value to test the prompt
    const remote = "1.2.0"; 

    // 3. Compare Versions (Simple string comparison for MVP)
    // For robust semantic versioning (1.0.0 vs 1.0.1), use a semver library
    const isAvailable = remote > current;

    return {
      updateAvailable: isAvailable,
      currentVersion: current,
      remoteVersion: remote
    };

  } catch (error) {
    console.error("Update check failed:", error);
    return {
      updateAvailable: false,
      currentVersion: CURRENT_APP_VERSION,
      remoteVersion: CURRENT_APP_VERSION
    };
  }
};

/**
 * Opens the Google Play Store to the app's listing
 */
export const openPlayStore = (): void => {
  // '_system' target ensures it opens in the external browser/Play Store app
  // rather than inside the WebView
  window.open(PLAY_STORE_URL, "_system");
};