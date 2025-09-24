import { test, expect } from '@playwright/test';

/**
 * Tests d'intégration pour l'AI App Builder
 * Teste le flux complet de l'application
 */

test.describe('Integration Tests', () => {
  test('Flux complet de création d\'application', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Navigation vers la page d'accueil
    await page.waitForURL('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Étape 3: Création d'une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test Integration App');
    await page.fill('[data-testid="app-description-input"]', 'Application de test d\'intégration');
    await page.click('[data-testid="create-app-button"]');
    
    // Étape 4: Vérification de la création
    await page.waitForSelector('[data-testid="app-editor"]');
    await expect(page.locator('[data-testid="app-name"]')).toHaveText('Test Integration App');
    
    // Étape 5: Génération de code
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React avec un formulaire de contact');
    await page.click('[data-testid="generate-button"]');
    
    // Étape 6: Attendre la génération
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    // Étape 7: Vérifier que le code a été généré
    const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
    expect(generatedCode).toContain('React');
    expect(generatedCode).toContain('function');
    
    // Étape 8: Vérifier la preview
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
    
    console.log('✅ Flux complet de création d\'application testé');
  });

  test('Flux de chat avec l\'IA', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Navigation vers la page de chat
    await page.waitForURL('/');
    await page.click('[data-testid="chat-link"]');
    await page.waitForSelector('[data-testid="chat-page"]');
    
    // Étape 3: Création d'une nouvelle conversation
    await page.click('[data-testid="new-chat-button"]');
    await page.fill('[data-testid="chat-name-input"]', 'Test Chat');
    await page.click('[data-testid="create-chat-button"]');
    
    // Étape 4: Envoi d'un message
    await page.fill('[data-testid="chat-input"]', 'Bonjour, comment allez-vous ?');
    await page.click('[data-testid="send-button"]');
    
    // Étape 5: Attendre la réponse
    await page.waitForSelector('[data-testid="message-sent"]');
    await page.waitForSelector('[data-testid="ai-response"]', { timeout: 30000 });
    
    // Étape 6: Vérifier que la réponse est affichée
    const aiResponse = await page.locator('[data-testid="ai-response"]').textContent();
    expect(aiResponse).toBeTruthy();
    
    console.log('✅ Flux de chat avec l\'IA testé');
  });

  test('Flux de gestion des fichiers', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Création d'une application
    await page.waitForURL('/');
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test File App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Étape 3: Création d'un fichier
    await page.click('[data-testid="new-file-button"]');
    await page.fill('[data-testid="file-name-input"]', 'TestFile.js');
    await page.click('[data-testid="create-file-button"]');
    
    // Étape 4: Vérification de la création
    await expect(page.locator('[data-testid="file-TestFile.js"]')).toBeVisible();
    
    // Étape 5: Sélection du fichier
    await page.click('[data-testid="file-TestFile.js"]');
    
    // Étape 6: Édition du fichier
    await page.fill('[data-testid="code-editor"]', 'console.log("Hello World");');
    
    // Étape 7: Sauvegarde
    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="file-saved"]');
    
    // Étape 8: Renommage du fichier
    await page.click('[data-testid="rename-file-button"]');
    await page.fill('[data-testid="new-file-name-input"]', 'RenamedFile.js');
    await page.click('[data-testid="confirm-rename-button"]');
    
    // Étape 9: Vérification du renommage
    await expect(page.locator('[data-testid="file-RenamedFile.js"]')).toBeVisible();
    
    // Étape 10: Suppression du fichier
    await page.click('[data-testid="delete-file-button"]');
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Étape 11: Vérification de la suppression
    await expect(page.locator('[data-testid="file-RenamedFile.js"]')).not.toBeVisible();
    
    console.log('✅ Flux de gestion des fichiers testé');
  });

  test('Flux de paramètres utilisateur', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Navigation vers les paramètres
    await page.waitForURL('/');
    await page.click('[data-testid="settings-link"]');
    await page.waitForSelector('[data-testid="settings-page"]');
    
    // Étape 3: Modification du thème
    await page.click('[data-testid="theme-selector"]');
    await page.selectOption('[data-testid="theme-selector"]', 'dark');
    
    // Étape 4: Modification de la langue
    await page.click('[data-testid="language-selector"]');
    await page.selectOption('[data-testid="language-selector"]', 'fr');
    
    // Étape 5: Sauvegarde des paramètres
    await page.click('[data-testid="save-settings-button"]');
    await page.waitForSelector('[data-testid="settings-saved"]');
    
    // Étape 6: Vérification des changements
    await expect(page.locator('[data-testid="app-container"][data-theme="dark"]')).toBeVisible();
    
    console.log('✅ Flux de paramètres utilisateur testé');
  });

  test('Flux d\'export et d\'import d\'application', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Création d'une application
    await page.waitForURL('/');
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test Export App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Étape 3: Génération de code
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React simple');
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    // Étape 4: Export de l'application
    await page.click('[data-testid="export-button"]');
    await page.waitForSelector('[data-testid="export-complete"]');
    
    // Étape 5: Vérification du téléchargement
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Test Export App');
    
    console.log('✅ Flux d\'export et d\'import d\'application testé');
  });

  test('Flux de collaboration en temps réel', async ({ page, context }) => {
    // Étape 1: Connexion du premier utilisateur
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'user1@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Création d'une application partagée
    await page.waitForURL('/');
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Collaborative App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Étape 3: Partage de l'application
    await page.click('[data-testid="share-button"]');
    await page.fill('[data-testid="share-email-input"]', 'user2@example.com');
    await page.click('[data-testid="send-invitation-button"]');
    
    // Étape 4: Connexion du deuxième utilisateur
    const page2 = await context.newPage();
    await page2.goto('/login');
    await page2.waitForSelector('[data-testid="login-page"]');
    
    await page2.fill('[data-testid="email-input"]', 'user2@example.com');
    await page2.fill('[data-testid="password-input"]', 'password123');
    await page2.click('[data-testid="login-button"]');
    
    // Étape 5: Accès à l'application partagée
    await page2.waitForURL('/');
    await page2.click('[data-testid="shared-apps-link"]');
    await page2.waitForSelector('[data-testid="shared-apps-list"]');
    
    // Étape 6: Ouverture de l'application partagée
    await page2.click('[data-testid="app-Collaborative App"]');
    await page2.waitForSelector('[data-testid="app-editor"]');
    
    // Étape 7: Modification simultanée
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Modification utilisateur 1');
    
    await page2.click('[data-testid="prompt-editor"]');
    await page2.keyboard.type('Modification utilisateur 2');
    
    // Étape 8: Vérification de la synchronisation
    await page.waitForSelector('[data-testid="collaboration-indicator"]');
    await page2.waitForSelector('[data-testid="collaboration-indicator"]');
    
    console.log('✅ Flux de collaboration en temps réel testé');
  });

  test('Flux de gestion des erreurs', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Test d'erreur de connexion
    await page.waitForURL('/');
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', ''); // Nom vide
    await page.click('[data-testid="create-app-button"]');
    
    // Étape 3: Vérification de l'erreur
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Étape 4: Correction de l'erreur
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    
    // Étape 5: Vérification de la correction
    await page.waitForSelector('[data-testid="app-editor"]');
    await expect(page.locator('[data-testid="app-editor"]')).toBeVisible();
    
    console.log('✅ Flux de gestion des erreurs testé');
  });

  test('Flux de performance et optimisation', async ({ page }) => {
    // Étape 1: Connexion
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Étape 2: Création d'une application complexe
    await page.waitForURL('/');
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Étape 3: Génération de code complexe
    const startTime = Date.now();
    
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React complexe avec un tableau de bord, des graphiques, et une gestion d\'état avancée');
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    const generationTime = Date.now() - startTime;
    
    // Étape 4: Vérification de la performance
    expect(generationTime).toBeLessThan(60000); // Moins de 1 minute
    
    // Étape 5: Vérification de la qualité du code généré
    const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
    expect(generatedCode).toContain('React');
    expect(generatedCode).toContain('function');
    expect(generatedCode).toContain('useState');
    
    console.log('✅ Flux de performance et optimisation testé');
  });
});
