import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'firebase/app': resolve(__dirname, './node_modules/firebase/app'),
      'firebase/auth': resolve(__dirname, './node_modules/firebase/auth'),
      'firebase/firestore': resolve(__dirname, './node_modules/firebase/firestore'),
      'firebase/storage': resolve(__dirname, './node_modules/firebase/storage'),
      '@react-native-async-storage/async-storage': resolve(__dirname, './src/stubs/async-storage.js'),
    },
  },
});
