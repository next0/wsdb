/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tsconfigPaths(), react()],

    server: {
        port: 8000,
        proxy: {
            '/api/v1/ws': {
                target: 'ws://localhost:8001',
                ws: true,
                changeOrigin: true,
            },
            '/api/v1/': {
                target: 'http://localhost:8001',
                changeOrigin: true,
            },
        },
    },

    test: {
        include: ['./src/**/*.test.{ts,tsx}'],
        reporters: ['default', 'html'],
        outputFile: './__reports__/unit-test-report/index.html',
        setupFiles: './src/setupTests.ts',
        environment: 'jsdom',
        globals: true,
        css: true,
    },
});
