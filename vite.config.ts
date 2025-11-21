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
  // build: {
  //   outDir: 'build',
  //   emptyOutDir: true,
  //   chunkSizeWarningLimit: 1000,
  //   rollupOptions: {
  //     output: {
  //       manualChunks: id => {
  //         if (id.includes('node_modules')) {
  //           if (id.includes('@emotion')) return 'emotion';

  //           if (id.includes('@mui')) {
  //             if (id.includes('@mui/icons-material')) return 'mui-icons';
  //             return 'mui-core';
  //           }

  //           if (id.includes('redux-toolkit')) return 'redux-toolkit';

  //           if (id.includes('ag-grid')) {
  //             if (id.includes('ag-grid-community')) return 'ag-grid-community';
  //             if (id.includes('ag-grid-react')) return 'ag-grid-react';
  //             return 'ag-grid';
  //           }

  //           if (id.includes('ag-charts-community')) return 'ag-charts-community';

  //           if (id.includes('axios')) return 'axios';
  //           if (id.includes('formik')) return 'formik';
  //           if (id.includes('lodash')) return 'lodash';
  //           if (id.includes('moment')) return 'moment';
  //           if (id.includes('react-dnd-html5-backend')) return 'react-dnd-html5-backend';

  //           if (id.includes('react-error-boundary')) return 'react-error-boundary';
  //           if (id.includes('react-otp-input')) return 'react-otp-input';
  //           if (id.includes('react-spinners')) return 'react-spinners';
  //           if (id.includes('simplebar-react')) return 'simplebar-react';

  //           // if (id.includes('react-dom')) return 'react-dom';
  //           // if (id.includes('react-router-dom')) return 'react-router-dom';
  //           // if (id.includes('react-scripts')) return 'react-scripts';
  //           // if (id.includes('react')) return 'react';

  //           if (id.includes('web-vitals')) return 'web-vitals';
  //           if (id.includes('yup')) return 'yup';

  //           return 'others-packages';
  //         }
  //       },
  //     },
  //   },
  // },
});
