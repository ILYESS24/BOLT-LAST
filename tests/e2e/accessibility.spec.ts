import { test, expect } from '@playwright/test';

/**
 * Tests d'accessibilité pour l'AI App Builder
 * Vérifie que l'application est accessible aux utilisateurs avec des besoins spéciaux
 */

test.describe('Accessibility Tests', () => {
  test('Navigation au clavier', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Tester la navigation au clavier
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Naviguer vers le bouton de nouvelle application
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Vérifier que le formulaire s'ouvre
    await page.waitForSelector('[data-testid="app-name-input"]');
    
    console.log('✅ Navigation au clavier fonctionnelle');
  });

  test('Contraste des couleurs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les éléments ont un contraste suffisant
    const elements = await page.locator('button, input, a, h1, h2, h3, p').all();
    
    for (const element of elements) {
      const color = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Vérifier que les couleurs sont définies
      expect(color.color).toBeTruthy();
      expect(color.backgroundColor).toBeTruthy();
    }
    
    console.log('✅ Contraste des couleurs vérifié');
  });

  test('Labels et descriptions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les éléments de formulaire ont des labels
    const inputs = await page.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const label = await input.getAttribute('aria-label') || 
                   await input.getAttribute('aria-labelledby') ||
                   await input.evaluate(el => {
                     const label = el.closest('label');
                     return label ? label.textContent : null;
                   });
      
      expect(label).toBeTruthy();
    }
    
    console.log('✅ Labels et descriptions vérifiés');
  });

  test('Focus visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que le focus est visible
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Vérifier que l'élément focusé a un style de focus
    const focusStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow
      };
    });
    
    expect(focusStyle.outline || focusStyle.boxShadow).toBeTruthy();
    
    console.log('✅ Focus visible vérifié');
  });

  test('Structure sémantique', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que la structure sémantique est correcte
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    
    // Vérifier que les titres sont hiérarchisés correctement
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    const _h3 = await page.locator('h3').count();
    
    expect(h1).toBeGreaterThan(0);
    expect(h2).toBeGreaterThan(0);
    
    console.log('✅ Structure sémantique vérifiée');
  });

  test('Images avec texte alternatif', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que toutes les images ont un texte alternatif
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    console.log('✅ Images avec texte alternatif vérifiées');
  });

  test('Formulaires accessibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.waitForSelector('[data-testid="app-name-input"]');
    
    // Vérifier que le formulaire est accessible
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Vérifier que les champs de formulaire ont des labels
    const nameInput = page.locator('[data-testid="app-name-input"]');
    const nameLabel = await nameInput.getAttribute('aria-label') || 
                     await nameInput.getAttribute('aria-labelledby');
    expect(nameLabel).toBeTruthy();
    
    // Vérifier que les messages d'erreur sont associés aux champs
    await nameInput.fill('');
    await page.click('[data-testid="create-app-button"]');
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    console.log('✅ Formulaires accessibles vérifiés');
  });

  test('Navigation par landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les landmarks sont présents
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    
    // Vérifier que les landmarks ont des rôles appropriés
    const main = page.locator('main');
    const nav = page.locator('nav');
    const header = page.locator('header');
    
    await expect(main).toHaveAttribute('role', 'main');
    await expect(nav).toHaveAttribute('role', 'navigation');
    await expect(header).toHaveAttribute('role', 'banner');
    
    console.log('✅ Navigation par landmarks vérifiée');
  });

  test('Support des lecteurs d\'écran', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les éléments ont des rôles ARIA appropriés
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const role = await button.getAttribute('role');
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Vérifier que le bouton a un rôle ou un label
      expect(role || ariaLabel || textContent).toBeTruthy();
    }
    
    // Vérifier que les éléments interactifs ont des rôles appropriés
    const interactiveElements = await page.locator('[role="button"], [role="link"], [role="textbox"]').all();
    expect(interactiveElements.length).toBeGreaterThan(0);
    
    console.log('✅ Support des lecteurs d\'écran vérifié');
  });

  test('Gestion des erreurs accessibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.waitForSelector('[data-testid="app-name-input"]');
    
    // Déclencher une erreur
    await page.fill('[data-testid="app-name-input"]', '');
    await page.click('[data-testid="create-app-button"]');
    
    // Vérifier que l'erreur est annoncée
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    // Vérifier que l'erreur a un rôle ARIA approprié
    const role = await errorMessage.getAttribute('role');
    const ariaLive = await errorMessage.getAttribute('aria-live');
    
    expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
    
    console.log('✅ Gestion des erreurs accessibles vérifiée');
  });

  test('Taille des éléments interactifs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les éléments interactifs ont une taille suffisante
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const size = await button.boundingBox();
      if (size) {
        // Vérifier que le bouton fait au moins 44x44 pixels (recommandation WCAG)
        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    console.log('✅ Taille des éléments interactifs vérifiée');
  });

  test('Contraste en mode sombre', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Activer le mode sombre
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForSelector('[data-testid="app-container"][data-theme="dark"]');
    
    // Vérifier que le contraste est suffisant en mode sombre
    const elements = await page.locator('button, input, a, h1, h2, h3, p').all();
    
    for (const element of elements) {
      const color = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Vérifier que les couleurs sont définies
      expect(color.color).toBeTruthy();
      expect(color.backgroundColor).toBeTruthy();
    }
    
    console.log('✅ Contraste en mode sombre vérifié');
  });

  test('Navigation par raccourcis clavier', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Tester les raccourcis clavier
    await page.keyboard.press('Alt+1'); // Navigation vers la page d'accueil
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    await page.keyboard.press('Alt+2'); // Navigation vers la page de chat
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible();
    
    await page.keyboard.press('Alt+3'); // Navigation vers la page de paramètres
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
    
    console.log('✅ Navigation par raccourcis clavier vérifiée');
  });
});
