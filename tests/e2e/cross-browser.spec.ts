import { test, expect } from '@playwright/test';

/**
 * Tests cross-browser pour vérifier la compatibilité
 * Teste l'application sur différents navigateurs
 */

test.describe('Cross-Browser Compatibility', () => {
  test('Fonctionnalité de base sur Chrome', async ({ page }) => {
    await testBasicFunctionality(page, 'Chrome');
  });

  test('Fonctionnalité de base sur Firefox', async ({ page }) => {
    await testBasicFunctionality(page, 'Firefox');
  });

  test('Fonctionnalité de base sur Safari', async ({ page }) => {
    await testBasicFunctionality(page, 'Safari');
  });

  test('Génération d\'application sur Chrome', async ({ page }) => {
    await testAppGeneration(page, 'Chrome');
  });

  test('Génération d\'application sur Firefox', async ({ page }) => {
    await testAppGeneration(page, 'Firefox');
  });

  test('Génération d\'application sur Safari', async ({ page }) => {
    await testAppGeneration(page, 'Safari');
  });

  test('Interface de chat sur Chrome', async ({ page }) => {
    await testChatInterface(page, 'Chrome');
  });

  test('Interface de chat sur Firefox', async ({ page }) => {
    await testChatInterface(page, 'Firefox');
  });

  test('Interface de chat sur Safari', async ({ page }) => {
    await testChatInterface(page, 'Safari');
  });

  test('Gestion des fichiers sur Chrome', async ({ page }) => {
    await testFileManagement(page, 'Chrome');
  });

  test('Gestion des fichiers sur Firefox', async ({ page }) => {
    await testFileManagement(page, 'Firefox');
  });

  test('Gestion des fichiers sur Safari', async ({ page }) => {
    await testFileManagement(page, 'Safari');
  });

  test('Responsive design sur Chrome', async ({ page }) => {
    await testResponsiveDesign(page, 'Chrome');
  });

  test('Responsive design sur Firefox', async ({ page }) => {
    await testResponsiveDesign(page, 'Firefox');
  });

  test('Responsive design sur Safari', async ({ page }) => {
    await testResponsiveDesign(page, 'Safari');
  });
});

/**
 * Tester les fonctionnalités de base
 */
async function testBasicFunctionality(page: any, browser: string) {
  console.log(`🧪 Test des fonctionnalités de base sur ${browser}`);
  
  // Naviguer vers l'application
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Vérifier que la page se charge correctement
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-testid="new-app-button"]')).toBeVisible();
  
  // Vérifier que les éléments de navigation sont présents
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect(page.locator('[data-testid="header"]')).toBeVisible();
  
  console.log(`✅ Fonctionnalités de base OK sur ${browser}`);
}

/**
 * Tester la génération d'application
 */
async function testAppGeneration(page: any, browser: string) {
  console.log(`🧪 Test de génération d'application sur ${browser}`);
  
  // Naviguer vers l'application
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Créer une nouvelle application
  await page.click('[data-testid="new-app-button"]');
  await page.fill('[data-testid="app-name-input"]', `Test App ${browser}`);
  await page.click('[data-testid="create-app-button"]');
  await page.waitForSelector('[data-testid="app-editor"]');
  
  // Vérifier que l'éditeur est présent
  await expect(page.locator('[data-testid="prompt-editor"]')).toBeVisible();
  await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
  await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
  
  // Tester la génération de code
  await page.click('[data-testid="prompt-editor"]');
  await page.keyboard.type('Crée une application React simple avec un compteur');
  await page.click('[data-testid="generate-button"]');
  
  // Attendre que la génération soit terminée
  await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
  
  // Vérifier que le code a été généré
  const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
  expect(generatedCode).toContain('React');
  expect(generatedCode).toContain('function');
  
  console.log(`✅ Génération d'application OK sur ${browser}`);
}

/**
 * Tester l'interface de chat
 */
async function testChatInterface(page: any, browser: string) {
  console.log(`🧪 Test de l'interface de chat sur ${browser}`);
  
  // Naviguer vers l'application
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Créer une nouvelle application
  await page.click('[data-testid="new-app-button"]');
  await page.fill('[data-testid="app-name-input"]', `Test App ${browser}`);
  await page.click('[data-testid="create-app-button"]');
  await page.waitForSelector('[data-testid="app-editor"]');
  
  // Ouvrir le chat
  await page.click('[data-testid="chat-button"]');
  await page.waitForSelector('[data-testid="chat-interface"]');
  
  // Vérifier que le chat est présent
  await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
  await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  
  // Tester l'envoi d'un message
  await page.fill('[data-testid="chat-input"]', 'Bonjour, comment allez-vous ?');
  await page.click('[data-testid="send-button"]');
  
  // Attendre que le message soit envoyé
  await page.waitForSelector('[data-testid="message-sent"]');
  
  console.log(`✅ Interface de chat OK sur ${browser}`);
}

/**
 * Tester la gestion des fichiers
 */
async function testFileManagement(page: any, browser: string) {
  console.log(`🧪 Test de gestion des fichiers sur ${browser}`);
  
  // Naviguer vers l'application
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Créer une nouvelle application
  await page.click('[data-testid="new-app-button"]');
  await page.fill('[data-testid="app-name-input"]', `Test App ${browser}`);
  await page.click('[data-testid="create-app-button"]');
  await page.waitForSelector('[data-testid="app-editor"]');
  
  // Vérifier que la liste des fichiers est présente
  await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();
  
  // Créer un nouveau fichier
  await page.click('[data-testid="new-file-button"]');
  await page.fill('[data-testid="file-name-input"]', 'TestFile.js');
  await page.click('[data-testid="create-file-button"]');
  
  // Vérifier que le fichier a été créé
  await expect(page.locator('[data-testid="file-TestFile.js"]')).toBeVisible();
  
  // Sélectionner le fichier
  await page.click('[data-testid="file-TestFile.js"]');
  
  // Vérifier que l'éditeur contient le fichier
  await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
  
  // Modifier le contenu du fichier
  await page.fill('[data-testid="code-editor"]', 'console.log("Hello World");');
  
  // Sauvegarder le fichier
  await page.click('[data-testid="save-button"]');
  
  // Vérifier que le fichier a été sauvegardé
  await page.waitForSelector('[data-testid="file-saved"]');
  
  console.log(`✅ Gestion des fichiers OK sur ${browser}`);
}

/**
 * Tester le design responsive
 */
async function testResponsiveDesign(page: any, browser: string) {
  console.log(`🧪 Test du design responsive sur ${browser}`);
  
  // Test sur mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Vérifier que l'interface mobile fonctionne
  await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  
  // Test sur tablette
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Vérifier que l'interface tablette fonctionne
  await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  
  // Test sur desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.reload();
  await page.waitForSelector('[data-testid="app-container"]');
  
  // Vérifier que l'interface desktop fonctionne
  await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  
  console.log(`✅ Design responsive OK sur ${browser}`);
}
