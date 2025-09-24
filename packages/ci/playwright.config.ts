import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E de l'AI App Builder
 * Simule un humain interagissant avec l'éditeur de prompts et l'interface
 */
export default defineConfig({
  // Répertoire des tests
  testDir: './tests/e2e',
  
  // Nombre de workers parallèles
  workers: process.env.CI ? 2 : 4,
  
  // Timeout global pour les tests
  timeout: 60 * 1000, // 60 secondes
  
  // Timeout pour chaque assertion
  expect: {
    timeout: 10 * 1000, // 10 secondes
  },
  
  // Configuration de retry
  retries: process.env.CI ? 2 : 0,
  
  // Reporter pour CI et local
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ...(process.env.CI ? [['github']] : []),
  ],
  
  // Configuration globale
  use: {
    // Base URL de l'application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Actions par défaut
    actionTimeout: 15 * 1000, // 15 secondes
    
    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 secondes
    
    // Capture des traces pour debugging
    trace: 'on-first-retry',
    
    // Capture des vidéos
    video: 'retain-on-failure',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Headless par défaut, mais peut être overridé
    headless: process.env.HEADLESS !== 'false',
    
    // Viewport pour simuler différents écrans
    viewport: { width: 1280, height: 720 },
    
    // User agent pour simuler un navigateur réel
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Ignorer les erreurs HTTPS
    ignoreHTTPSErrors: true,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  },
  
  // Configuration des projets (différents navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Tests sur mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Configuration du serveur de développement
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
  
  // Configuration pour les tests d'accessibilité
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
  
  // Configuration des timeouts spécifiques
  
  // Configuration pour les tests visuels
  snapshotPathTemplate: '{testDir}/{testFile}-snapshots/{arg}{ext}',
  
  // Configuration pour les tests d'API
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
});
