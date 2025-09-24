import { test, expect, Page } from '@playwright/test';
import { LangSmithEvaluator } from '../utils/langsmith-evaluator';
import { VisualSnapshot } from '../utils/visual-snapshot';

/**
 * Tests E2E pour l'éditeur de prompts de l'AI App Builder
 * Simule un humain interagissant avec l'interface
 */
test.describe('AI App Builder - Éditeur de Prompts', () => {
  let page: Page;
  let langsmithEvaluator: LangSmithEvaluator;
  let visualSnapshot: VisualSnapshot;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    langsmithEvaluator = new LangSmithEvaluator();
    visualSnapshot = new VisualSnapshot(page);
    
    // Attendre que l'application soit prête
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Vérifier que l'application est chargée
    await expect(page.locator('body')).toBeVisible();
  });

  test('Simulation humaine - Création d\'une application simple', async () => {
    // Étape 1: Ouvrir l'application et vérifier l'interface
    await test.step('Navigation vers l\'application', async () => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
      
      // Prendre un snapshot de l'état initial
      await visualSnapshot.capture('app-initial-state');
    });

    // Étape 2: Localiser et cliquer sur "Nouvelle Application"
    await test.step('Création d\'une nouvelle application', async () => {
      // Simuler un humain qui cherche le bouton
      await page.hover('[data-testid="new-app-button"]');
      await page.waitForTimeout(500); // Pause naturelle
      
      await page.click('[data-testid="new-app-button"]');
      await page.waitForSelector('[data-testid="app-creation-modal"]');
      
      // Prendre un snapshot du modal
      await visualSnapshot.capture('app-creation-modal');
    });

    // Étape 3: Remplir le formulaire de création
    await test.step('Remplissage du formulaire', async () => {
      // Simuler la saisie humaine avec des délais naturels
      await page.click('[data-testid="app-name-input"]');
      await page.waitForTimeout(200);
      
      // Taper le nom de l'application caractère par caractère
      await page.keyboard.type('Mon Application Test', { delay: 100 });
      await page.waitForTimeout(300);
      
      // Remplir la description
      await page.click('[data-testid="app-description-input"]');
      await page.waitForTimeout(200);
      await page.keyboard.type('Une application de test créée par un humain', { delay: 80 });
      
      // Prendre un snapshot du formulaire rempli
      await visualSnapshot.capture('form-filled');
    });

    // Étape 4: Soumettre le formulaire
    await test.step('Soumission du formulaire', async () => {
      await page.click('[data-testid="create-app-button"]');
      
      // Attendre que l'application soit créée
      await page.waitForSelector('[data-testid="app-editor"]', { timeout: 15000 });
      
      // Prendre un snapshot de l'éditeur
      await visualSnapshot.capture('app-editor-opened');
    });
  });

  test('Simulation humaine - Utilisation de l\'éditeur de prompts', async () => {
    // Prérequis: Avoir une application ouverte
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Ouvrir une application existante ou en créer une nouvelle
    const existingApp = await page.locator('[data-testid="app-item"]').first();
    if (await existingApp.isVisible()) {
      await existingApp.click();
    } else {
      await page.click('[data-testid="new-app-button"]');
      await page.fill('[data-testid="app-name-input"]', 'Test Prompt Editor');
      await page.click('[data-testid="create-app-button"]');
    }
    
    await page.waitForSelector('[data-testid="app-editor"]');

    // Étape 1: Localiser l'éditeur de prompts
    await test.step('Localisation de l\'éditeur de prompts', async () => {
      // Simuler un humain qui cherche l'éditeur
      await page.hover('[data-testid="prompt-editor"]');
      await page.waitForTimeout(500);
      
      // Vérifier que l'éditeur est visible et interactif
      await expect(page.locator('[data-testid="prompt-editor"]')).toBeVisible();
      await expect(page.locator('[data-testid="prompt-editor"]')).toBeEditable();
      
      // Prendre un snapshot de l'éditeur
      await visualSnapshot.capture('prompt-editor-ready');
    });

    // Étape 2: Saisie d'un prompt complexe
    await test.step('Saisie d\'un prompt complexe', async () => {
      await page.click('[data-testid="prompt-editor"]');
      await page.waitForTimeout(300);
      
      // Simuler la saisie humaine avec des pauses naturelles
      const prompt = `Crée une application React moderne avec les fonctionnalités suivantes :

1. Un formulaire de contact avec validation
2. Une liste de produits avec recherche et filtres
3. Un système d'authentification sécurisé
4. Un dashboard avec des graphiques interactifs
5. Une API REST complète avec documentation

Utilise TypeScript, Tailwind CSS, et les meilleures pratiques de développement.`;

      // Taper le prompt caractère par caractère pour simuler un humain
      for (const char of prompt) {
        await page.keyboard.type(char, { delay: Math.random() * 50 + 20 });
        
        // Pauses naturelles occasionnelles
        if (Math.random() < 0.1) {
          await page.waitForTimeout(Math.random() * 500 + 100);
        }
      }
      
      // Prendre un snapshot du prompt saisi
      await visualSnapshot.capture('prompt-entered');
    });

    // Étape 3: Lancer la génération
    await test.step('Lancement de la génération', async () => {
      // Simuler un humain qui vérifie le prompt avant de lancer
      await page.waitForTimeout(1000);
      
      // Cliquer sur le bouton de génération
      await page.click('[data-testid="generate-button"]');
      
      // Attendre que la génération commence
      await page.waitForSelector('[data-testid="generation-status"]');
      await expect(page.locator('[data-testid="generation-status"]')).toContainText('Génération en cours');
      
      // Prendre un snapshot de l'état de génération
      await visualSnapshot.capture('generation-in-progress');
    });

    // Étape 4: Attendre et vérifier la réponse
    await test.step('Vérification de la réponse générée', async () => {
      // Attendre que la génération se termine
      await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
      
      // Vérifier que l'éditeur de code s'est activé
      await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
      
      // Vérifier que du code a été généré
      const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
      expect(generatedCode).toBeTruthy();
      expect(generatedCode!.length).toBeGreaterThan(100);
      
      // Prendre un snapshot du code généré
      await visualSnapshot.capture('code-generated');
    });

    // Étape 5: Évaluation de la qualité avec LangSmith
    await test.step('Évaluation de la qualité de la réponse', async () => {
      const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
      
      // Évaluer la qualité du code généré
      const evaluation = await langsmithEvaluator.evaluate({
        prompt: await page.locator('[data-testid="prompt-editor"]').textContent(),
        response: generatedCode,
        criteria: [
          'code_quality',
          'completeness',
          'best_practices',
          'typescript_usage',
          'react_patterns'
        ]
      });
      
      // Vérifier que l'évaluation est positive
      expect(evaluation.overall_score).toBeGreaterThan(0.7);
      expect(evaluation.pass).toBe(true);
      
      // Prendre un snapshot final
      await visualSnapshot.capture('evaluation-complete');
    });
  });

  test('Simulation humaine - Test de différents types de prompts', async () => {
    const testCases = [
      {
        name: 'Prompt simple',
        prompt: 'Crée un composant React pour un bouton',
        expectedElements: ['button', 'onClick', 'React']
      },
      {
        name: 'Prompt complexe',
        prompt: 'Développe une application e-commerce complète avec panier, paiement et gestion des commandes',
        expectedElements: ['ecommerce', 'cart', 'payment', 'orders']
      },
      {
        name: 'Prompt avec contraintes techniques',
        prompt: 'Crée une API REST avec Node.js, Express, TypeScript et PostgreSQL',
        expectedElements: ['API', 'REST', 'Node.js', 'Express', 'TypeScript', 'PostgreSQL']
      }
    ];

    for (const testCase of testCases) {
      await test.step(`Test: ${testCase.name}`, async () => {
        // Naviguer vers l'éditeur
        await page.goto('/');
        await page.waitForSelector('[data-testid="app-container"]');
        
        // Créer une nouvelle application pour ce test
        await page.click('[data-testid="new-app-button"]');
        await page.fill('[data-testid="app-name-input"]', `Test: ${testCase.name}`);
        await page.click('[data-testid="create-app-button"]');
        await page.waitForSelector('[data-testid="app-editor"]');
        
        // Saisir le prompt
        await page.click('[data-testid="prompt-editor"]');
        await page.keyboard.type(testCase.prompt, { delay: 50 });
        
        // Lancer la génération
        await page.click('[data-testid="generate-button"]');
        await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
        
        // Vérifier que le code généré contient les éléments attendus
        const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
        
        for (const element of testCase.expectedElements) {
          expect(generatedCode!.toLowerCase()).toContain(element.toLowerCase());
        }
        
        // Prendre un snapshot pour ce test case
        await visualSnapshot.capture(`test-case-${testCase.name.replace(/\s+/g, '-').toLowerCase()}`);
      });
    }
  });

  test('Simulation humaine - Test de récupération après erreur', async () => {
    await test.step('Test de récupération après erreur', async () => {
      // Naviguer vers l'éditeur
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-container"]');
      
      // Créer une nouvelle application
      await page.click('[data-testid="new-app-button"]');
      await page.fill('[data-testid="app-name-input"]', 'Test Récupération Erreur');
      await page.click('[data-testid="create-app-button"]');
      await page.waitForSelector('[data-testid="app-editor"]');
      
      // Saisir un prompt qui pourrait causer une erreur
      await page.click('[data-testid="prompt-editor"]');
      await page.keyboard.type('Crée une application avec des fonctionnalités impossibles et des technologies inexistantes', { delay: 50 });
      
      // Lancer la génération
      await page.click('[data-testid="generate-button"]');
      
      // Attendre soit le succès soit l'erreur
      await page.waitForSelector('[data-testid="generation-complete"], [data-testid="generation-error"]', { timeout: 60000 });
      
      // Si c'est une erreur, vérifier que l'interface permet de réessayer
      const errorElement = await page.locator('[data-testid="generation-error"]');
      if (await errorElement.isVisible()) {
        // Vérifier qu'il y a un bouton de retry
        await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
        
        // Prendre un snapshot de l'état d'erreur
        await visualSnapshot.capture('error-state');
        
        // Cliquer sur retry
        await page.click('[data-testid="retry-button"]');
        
        // Attendre que la génération recommence
        await page.waitForSelector('[data-testid="generation-status"]');
        await expect(page.locator('[data-testid="generation-status"]')).toContainText('Génération en cours');
        
        // Prendre un snapshot de la récupération
        await visualSnapshot.capture('recovery-attempt');
      }
    });
  });
});
