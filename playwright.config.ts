import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Répertoire contenant les tests
  testDir: './tests',
  
  /* Exécuter les tests en parallèle */
  fullyParallel: true,
  
  /* Échouer le build sur CI si test.only est laissé dans le code */
  forbidOnly: !!process.env.CI,
  
  /* Retry automatique sur CI seulement */
  retries: process.env.CI ? 2 : 0,
  
  /* Limiter le nombre de workers sur CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter HTML pour les résultats */
  reporter: 'html',
  
  /* Configuration globale pour tous les projets */
  use: {
    /* URL de base pour les actions comme page.goto('/') */
    baseURL: 'http://localhost:3000',
    
    /* Collecter les traces lors des retry */
    trace: 'on-first-retry',
    
    /* Prendre des screenshots seulement en cas d'échec */
    screenshot: 'only-on-failure',
    
    /* Enregistrer les vidéos seulement en cas d'échec */
    video: 'retain-on-failure',
    
    /* Timeout global de 30 secondes */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configuration des projets pour les navigateurs principaux */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Décommentez pour tester sur d'autres navigateurs
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Tests sur mobile */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Démarrer le serveur de développement avant les tests */
  webServer: {
    command: 'npm run start:web',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes pour démarrer le serveur
  },
});