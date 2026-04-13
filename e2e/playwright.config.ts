import { defineConfig, devices } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';
const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['line']],

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'ui',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

export { API_URL, APP_URL };
