import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';
import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env';

export default defineConfig({
  plugins: [
    ValidateEnv({
      validator: 'builtin',
      schema: {
        VITE_FRONTEND_URL: Schema.string(),
        VITE_BACKEND_URL: Schema.string(),
      },
    }),
    react(),
    tailwindcss(),
    eslint({
      cache: false,
      // include: ['src/**/*.{js,jsx,ts,tsx}'],
      // exclude: ['node_modules', 'dist'],
      // fix: false, // Set to true if you want auto-fixing
      // lintOnStart: true, // Lint on development server start
      // emitWarning: true, // Show warnings in console
      // emitError: false, // Set to true if you want errors to break the build
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { open: true, port: 3000 },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
});
