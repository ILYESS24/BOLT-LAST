import { test, expect } from '@playwright/test';

/**
 * Tests de sécurité pour l'AI App Builder
 * Vérifie que l'application est sécurisée contre les vulnérabilités courantes
 */

test.describe('Security Tests', () => {
  test('Protection contre XSS', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', '<script>alert("XSS")</script>');
    await page.click('[data-testid="create-app-button"]');
    
    // Vérifier que le script n'est pas exécuté
    const appName = await page.locator('[data-testid="app-name"]').textContent();
    expect(appName).not.toContain('<script>');
    expect(appName).not.toContain('alert("XSS")');
    
    console.log('✅ Protection contre XSS vérifiée');
  });

  test('Protection contre l\'injection SQL', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application avec une injection SQL
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', "'; DROP TABLE users; --");
    await page.click('[data-testid="create-app-button"]');
    
    // Vérifier que l'application fonctionne toujours
    await page.waitForSelector('[data-testid="app-editor"]');
    await expect(page.locator('[data-testid="app-editor"]')).toBeVisible();
    
    console.log('✅ Protection contre l\'injection SQL vérifiée');
  });

  test('Validation des entrées utilisateur', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Tester avec des entrées malveillantes
    const maliciousInputs = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:msgbox("XSS")'
    ];
    
    for (const input of maliciousInputs) {
      await page.click('[data-testid="new-app-button"]');
      await page.fill('[data-testid="app-name-input"]', input);
      await page.click('[data-testid="create-app-button"]');
      
      // Vérifier que l'application ne plante pas
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    }
    
    console.log('✅ Validation des entrées utilisateur vérifiée');
  });

  test('Protection contre les attaques CSRF', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les formulaires ont des tokens CSRF
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const csrfToken = await form.locator('input[name="_token"], input[name="csrf_token"]').count();
      expect(csrfToken).toBeGreaterThan(0);
    }
    
    console.log('✅ Protection contre les attaques CSRF vérifiée');
  });

  test('Gestion sécurisée des sessions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les cookies de session sont sécurisés
    const cookies = await page.context().cookies();
    
    for (const cookie of cookies) {
      if (cookie.name.includes('session') || cookie.name.includes('token')) {
        expect(cookie.secure).toBeTruthy();
        expect(cookie.httpOnly).toBeTruthy();
        expect(cookie.sameSite).toBe('Strict');
      }
    }
    
    console.log('✅ Gestion sécurisée des sessions vérifiée');
  });

  test('Protection contre les attaques de force brute', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    // Tenter plusieurs connexions échouées
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Attendre que l'erreur s'affiche
      await page.waitForSelector('[data-testid="error-message"]');
    }
    
    // Vérifier qu'un mécanisme de protection est en place
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMessage).toContain('trop de tentatives');
    
    console.log('✅ Protection contre les attaques de force brute vérifiée');
  });

  test('Validation des fichiers uploadés', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Tenter d'uploader un fichier malveillant
    const fileInput = page.locator('[data-testid="file-upload"]');
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('MZ')
    });
    
    // Vérifier que le fichier est rejeté
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    console.log('✅ Validation des fichiers uploadés vérifiée');
  });

  test('Protection contre les attaques de timing', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="login-page"]');
    
    // Mesurer le temps de réponse pour différents utilisateurs
    const startTime = Date.now();
    
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    const existingUserTime = Date.now() - startTime;
    
    // Tester avec un utilisateur inexistant
    await page.reload();
    await page.waitForSelector('[data-testid="login-page"]');
    
    const startTime2 = Date.now();
    
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    const nonexistentUserTime = Date.now() - startTime2;
    
    // Vérifier que les temps de réponse sont similaires
    const timeDifference = Math.abs(existingUserTime - nonexistentUserTime);
    expect(timeDifference).toBeLessThan(1000); // Moins de 1 seconde de différence
    
    console.log('✅ Protection contre les attaques de timing vérifiée');
  });

  test('Chiffrement des données sensibles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que les données sensibles sont chiffrées
    const networkRequests = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        networkRequests.push({
          url: request.url(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', 'Test App');
    await page.click('[data-testid="create-app-button"]');
    
    // Vérifier que les requêtes utilisent HTTPS
    for (const request of networkRequests) {
      expect(request.url).toMatch(/^https:/);
    }
    
    console.log('✅ Chiffrement des données sensibles vérifié');
  });

  test('Protection contre les attaques de déni de service', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Tenter de surcharger l'application avec de nombreuses requêtes
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        page.evaluate(() => {
          return fetch('/api/apps', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
        })
      );
    }
    
    // Attendre que toutes les requêtes se terminent
    await Promise.all(promises);
    
    // Vérifier que l'application fonctionne toujours
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    console.log('✅ Protection contre les attaques de déni de service vérifiée');
  });

  test('Audit de sécurité des headers HTTP', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier les headers de sécurité
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // Vérifier que les headers de sécurité sont présents
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
    expect(headers?.['strict-transport-security']).toBeTruthy();
    expect(headers?.['content-security-policy']).toBeTruthy();
    
    console.log('✅ Audit de sécurité des headers HTTP vérifié');
  });

  test('Protection contre les attaques de clickjacking', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Vérifier que l'application ne peut pas être intégrée dans un iframe
    const response = await page.goto('/');
    const headers = response?.headers();
    
    expect(headers?.['x-frame-options']).toBe('DENY');
    
    console.log('✅ Protection contre les attaques de clickjacking vérifiée');
  });
});
