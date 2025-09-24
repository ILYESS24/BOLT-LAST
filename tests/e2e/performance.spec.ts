import { test, expect } from '@playwright/test';

/**
 * Tests de performance pour l'AI App Builder
 * Mesure les temps de réponse et la performance de l'application
 */

test.describe('Performance Tests', () => {
  test('Temps de chargement de la page d\'accueil', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    const loadTime = Date.now() - startTime;
    
    // Vérifier que la page se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`⏱️ Temps de chargement de la page d'accueil: ${loadTime}ms`);
  });

  test('Temps de création d\'application', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    const startTime = Date.now();
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    const creationTime = Date.now() - startTime;
    
    // Vérifier que la création se fait en moins de 5 secondes
    expect(creationTime).toBeLessThan(5000);
    
    console.log(`⏱️ Temps de création d'application: ${creationTime}ms`);
  });

  test('Temps de génération de code', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    const startTime = Date.now();
    
    // Générer du code
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React simple avec un compteur');
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    const generationTime = Date.now() - startTime;
    
    // Vérifier que la génération se fait en moins de 30 secondes
    expect(generationTime).toBeLessThan(30000);
    
    console.log(`⏱️ Temps de génération de code: ${generationTime}ms`);
  });

  test('Temps de sauvegarde de fichier', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Créer un fichier
    await page.click('[data-testid="new-file-button"]');
    await page.fill('[data-testid="file-name-input"]', 'TestFile.js');
    await page.click('[data-testid="create-file-button"]');
    
    const startTime = Date.now();
    
    // Sauvegarder le fichier
    await page.fill('[data-testid="code-editor"]', 'console.log("Hello World");');
    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="file-saved"]');
    
    const saveTime = Date.now() - startTime;
    
    // Vérifier que la sauvegarde se fait en moins de 2 secondes
    expect(saveTime).toBeLessThan(2000);
    
    console.log(`⏱️ Temps de sauvegarde de fichier: ${saveTime}ms`);
  });

  test('Temps de réponse du chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Ouvrir le chat
    await page.click('[data-testid="chat-button"]');
    await page.waitForSelector('[data-testid="chat-interface"]');
    
    const startTime = Date.now();
    
    // Envoyer un message
    await page.fill('[data-testid="chat-input"]', 'Bonjour, comment allez-vous ?');
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="message-sent"]');
    
    const responseTime = Date.now() - startTime;
    
    // Vérifier que la réponse se fait en moins de 10 secondes
    expect(responseTime).toBeLessThan(10000);
    
    console.log(`⏱️ Temps de réponse du chat: ${responseTime}ms`);
  });

  test('Temps de chargement de la preview', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    const startTime = Date.now();
    
    // Générer du code et attendre la preview
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React simple avec un compteur');
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="preview-loaded"]', { timeout: 60000 });
    
    const previewTime = Date.now() - startTime;
    
    // Vérifier que la preview se charge en moins de 35 secondes
    expect(previewTime).toBeLessThan(35000);
    
    console.log(`⏱️ Temps de chargement de la preview: ${previewTime}ms`);
  });

  test('Temps de navigation entre les pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Mesurer le temps de navigation vers la page de paramètres
    const startTime = Date.now();
    await page.click('[data-testid="settings-link"]');
    await page.waitForSelector('[data-testid="settings-page"]');
    const settingsTime = Date.now() - startTime;
    
    // Mesurer le temps de navigation vers la page de chat
    const startTime2 = Date.now();
    await page.click('[data-testid="chat-link"]');
    await page.waitForSelector('[data-testid="chat-page"]');
    const chatTime = Date.now() - startTime2;
    
    // Mesurer le temps de navigation vers la page d'accueil
    const startTime3 = Date.now();
    await page.click('[data-testid="home-link"]');
    await page.waitForSelector('[data-testid="app-container"]');
    const homeTime = Date.now() - startTime3;
    
    // Vérifier que la navigation se fait rapidement
    expect(settingsTime).toBeLessThan(1000);
    expect(chatTime).toBeLessThan(1000);
    expect(homeTime).toBeLessThan(1000);
    
    console.log(`⏱️ Temps de navigation - Paramètres: ${settingsTime}ms, Chat: ${chatTime}ms, Accueil: ${homeTime}ms`);
  });

  test('Temps de chargement des ressources', async ({ page }) => {
    const resources: string[] = [];
    
    // Intercepter les requêtes de ressources
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css') || response.url().includes('.png') || response.url().includes('.jpg')) {
        resources.push(response.url());
      }
    });
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    const loadTime = Date.now() - startTime;
    
    // Vérifier que toutes les ressources se chargent rapidement
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`⏱️ Temps de chargement des ressources: ${loadTime}ms`);
    console.log(`📦 Nombre de ressources chargées: ${resources.length}`);
  });

  test('Temps de rendu des composants', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Mesurer le temps de rendu de la sidebar
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="sidebar"]');
    const sidebarTime = Date.now() - startTime;
    
    // Mesurer le temps de rendu du header
    const startTime2 = Date.now();
    await page.waitForSelector('[data-testid="header"]');
    const headerTime = Date.now() - startTime2;
    
    // Mesurer le temps de rendu du contenu principal
    const startTime3 = Date.now();
    await page.waitForSelector('[data-testid="main-content"]');
    const contentTime = Date.now() - startTime3;
    
    // Vérifier que les composants se rendent rapidement
    expect(sidebarTime).toBeLessThan(500);
    expect(headerTime).toBeLessThan(500);
    expect(contentTime).toBeLessThan(500);
    
    console.log(`⏱️ Temps de rendu - Sidebar: ${sidebarTime}ms, Header: ${headerTime}ms, Contenu: ${contentTime}ms`);
  });

  test('Temps de traitement des données', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Performance Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Mesurer le temps de traitement des données
    const startTime = Date.now();
    
    // Générer du code avec un prompt complexe
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type('Crée une application React complexe avec un tableau de bord, des graphiques, et une gestion d\'état avancée');
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    const processingTime = Date.now() - startTime;
    
    // Vérifier que le traitement se fait en moins de 45 secondes
    expect(processingTime).toBeLessThan(45000);
    
    console.log(`⏱️ Temps de traitement des données: ${processingTime}ms`);
  });
});
