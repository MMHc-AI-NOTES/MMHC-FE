import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';
import { Schema, ValidateEnv } from '@julr/vite-plugin-validate-env';

const vendorChunkMap: Array<{ test: RegExp; name: string }> = [
  { test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/, name: 'react-vendor' },
  { test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/, name: 'router' },
  { test: /[\\/]node_modules[\\/]@reduxjs[\\/]/, name: 'state' },
  { test: /[\\/]node_modules[\\/](formik|yup)[\\/]/, name: 'forms' },
  { test: /[\\/]node_modules[\\/](axios)[\\/]/, name: 'http' },
  { test: /[\\/]node_modules[\\/](moment)[\\/]/, name: 'date' },
  { test: /[\\/]node_modules[\\/](recharts|d3-|victory|chart\.js)[\\/]/, name: 'charts' },
  { test: /[\\/]node_modules[\\/]lucide-react[\\/]/, name: 'icons' },
  { test: /[\\/]node_modules[\\/](@radix-ui|@tanstack|class-variance-authority|clsx|tailwind-merge|sonner)[\\/]/, name: 'ui-kit' },
];

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
    eslint(),
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          const match = vendorChunkMap.find(entry => entry.test.test(id));
          if (match) return match.name;

          return undefined;
        },
      },
    },
  },
});
