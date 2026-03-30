import { defineConfig, devices } from '@playwright/test';

/**
 * Integration test configuration - uses real Docker database instead of mocks.
 *
 * Prerequisites:
 * 1. Start test database: docker compose -f docker-compose.test.yml up -d
 * 2. Run migrations: DATABASE_URL=postgresql://test:test@localhost:5433/buzzling_test pnpm prisma migrate deploy
 * 3. Run tests: pnpm test:e2e:integration
 */
export default defineConfig({
  testDir: './e2e/integration',
  fullyParallel: false, // Sequential to avoid database conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for database isolation
  reporter: [
    ['html', { outputFolder: 'playwright-report-integration' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  use: {
    baseURL: 'http://localhost:3300',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3300',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5433/buzzling_test',
    },
  },
});
