import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.mysaarthi',
  appName: 'MySaarthi',
  webDir: 'dist',

  plugins: {
    StatusBar: {
      visible: true,
      style: 'LIGHT',
      overlaysWebView: false,
      backgroundColor: '#ffffff', // 👈 prevents edge-to-edge on some devices
    },
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;
