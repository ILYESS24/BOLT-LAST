import { test, expect } from '@playwright/test';
import { takeVisualSnapshot } from '../utils/visual-snapshot';

/**
 * Tests de régression visuelle
 * Capture des snapshots et comparaison avec les versions précédentes
 */

test.describe('Visual Regression Tests', () => {
  test('Snapshot de la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Prendre un snapshot de la page d'accueil
    await takeVisualSnapshot(page, 'homepage');
    
    // Vérifier que la page contient les éléments essentiels
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="new-app-button"]')).toBeVisible();
  });

  test('Snapshot de l\'éditeur d\'application', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Prendre un snapshot de l'éditeur
    await takeVisualSnapshot(page, 'app-editor');
    
    // Vérifier que l'éditeur contient les éléments essentiels
    await expect(page.locator('[data-testid="prompt-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
  });

  test('Snapshot de l\'interface de chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Ouvrir le chat
    await page.click('[data-testid="chat-button"]');
    await page.waitForSelector('[data-testid="chat-interface"]');
    
    // Prendre un snapshot du chat
    await takeVisualSnapshot(page, 'chat-interface');
    
    // Vérifier que le chat contient les éléments essentiels
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('Snapshot de la page de paramètres', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForSelector('[data-testid="settings-page"]');
    
    // Prendre un snapshot de la page de paramètres
    await takeVisualSnapshot(page, 'settings-page');
    
    // Vérifier que la page contient les éléments essentiels
    await expect(page.locator('[data-testid="theme-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-settings-button"]')).toBeVisible();
  });

  test('Snapshot de la page de connexion', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    // Prendre un snapshot de la page de connexion
    await takeVisualSnapshot(page, 'login-page');
    
    // Vérifier que la page contient les éléments essentiels
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('Snapshot de la page d\'inscription', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('[data-testid="register-page"]');
    
    // Prendre un snapshot de la page d'inscription
    await takeVisualSnapshot(page, 'register-page');
    
    // Vérifier que la page contient les éléments essentiels
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test('Snapshot de l\'interface mobile', async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Prendre un snapshot de la version mobile
    await takeVisualSnapshot(page, 'mobile-homepage');
    
    // Vérifier que l'interface mobile fonctionne
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  });

  test('Snapshot de l\'interface tablette', async ({ page }) => {
    // Simuler une tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Prendre un snapshot de la version tablette
    await takeVisualSnapshot(page, 'tablet-homepage');
    
    // Vérifier que l'interface tablette fonctionne
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test('Snapshot de l\'interface desktop', async ({ page }) => {
    // Simuler un écran desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Prendre un snapshot de la version desktop
    await takeVisualSnapshot(page, 'desktop-homepage');
    
    // Vérifier que l'interface desktop fonctionne
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test('Snapshot de l\'interface en mode sombre', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Activer le mode sombre
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForSelector('[data-testid="app-container"][data-theme="dark"]');
    
    // Prendre un snapshot du mode sombre
    await takeVisualSnapshot(page, 'dark-mode-homepage');
    
    // Vérifier que le mode sombre est actif
    await expect(page.locator('[data-testid="app-container"][data-theme="dark"]')).toBeVisible();
  });

  test('Snapshot de l\'interface en mode clair', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // S'assurer que le mode clair est actif
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForSelector('[data-testid="app-container"][data-theme="light"]');
    
    // Prendre un snapshot du mode clair
    await takeVisualSnapshot(page, 'light-mode-homepage');
    
    // Vérifier que le mode clair est actif
    await expect(page.locator('[data-testid="app-container"][data-theme="light"]')).toBeVisible();
  });

  test('Snapshot de l\'interface avec erreur', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Simuler une erreur
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', ''); // Nom vide pour déclencher une erreur
    await page.click('[data-testid="create-app-button"]');
    
    // Attendre que l'erreur s'affiche
    await page.waitForSelector('[data-testid="error-message"]');
    
    // Prendre un snapshot de l'erreur
    await takeVisualSnapshot(page, 'error-state');
    
    // Vérifier que l'erreur est affichée
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('Snapshot de l\'interface de chargement', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    
    // Attendre que l'état de chargement s'affiche
    await page.waitForSelector('[data-testid="loading-spinner"]');
    
    // Prendre un snapshot de l'état de chargement
    await takeVisualSnapshot(page, 'loading-state');
    
    // Vérifier que l'état de chargement est affiché
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('Snapshot de l\'interface de succès', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Attendre que l'état de succès s'affiche
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Prendre un snapshot de l'état de succès
    await takeVisualSnapshot(page, 'success-state');
    
    // Vérifier que l'état de succès est affiché
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
