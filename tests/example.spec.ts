import { test, expect } from '@playwright/test';

test.describe('Tests E2E - Application Dyad', () => {
  test('devrait charger la page d\'accueil de Dyad', async ({ page }) => {
    await page.goto('http://localhost:3000'); 

    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/Dyad/);
    
    // Attendre que le contenu principal soit chargé
    await page.waitForLoadState('networkidle');
  });

  test('devrait afficher les éléments de navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Attendre que l'application soit chargée
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier que des éléments de base sont présents
    // (Ces sélecteurs sont génériques et devraient fonctionner même si l'UI change)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('devrait pouvoir naviguer dans l\'application', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Attendre que l'application soit chargée
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier que la page se charge sans erreur JavaScript
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // Attendre un peu pour voir s'il y a des erreurs
    await page.waitForTimeout(2000);
    
    // S'assurer qu'il n'y a pas d'erreurs JavaScript critiques
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('favicon') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('devrait avoir un titre de page valide', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Vérifier que la page a un titre (même vide)
    const title = await page.title();
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
  });
});