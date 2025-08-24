/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/',
        'src/types/',
        '**/*.d.ts',
        'dist/',
        'build/',
        'coverage/',
        'public/',
        '*.config.{js,ts}',
        'src/main.tsx',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // Automatically retry flaky tests
    retry: 2,
    // Timeout for tests
    testTimeout: 10000,
    // Watch settings
    watch: {
      exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
    },
  },
})
