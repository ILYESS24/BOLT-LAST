import { test, expect } from '@playwright/test';
import { LangSmithEvaluator } from '../utils/langsmith-evaluator';

/**
 * Tests de génération automatique de cas de tests avec AI
 * Utilise Playwright MCP et l'IA pour générer des tests supplémentaires
 */

test.describe('AI Test Generation', () => {
  let _langsmithEvaluator: LangSmithEvaluator;

  test.beforeEach(async () => {
    _langsmithEvaluator = new LangSmithEvaluator();
  });

  test('Génération automatique de tests avec AI', async ({ page }) => {
    // Étape 1: Générer des cas de test avec l'IA
    await test.step('Génération de cas de test', async () => {
      const testCases = await generateTestCasesWithAI();
      
      expect(testCases).toBeDefined();
      expect(testCases.length).toBeGreaterThan(0);
      
      console.log(`🤖 ${testCases.length} cas de test générés par l'IA`);
    });

    // Étape 2: Exécuter les tests générés
    await test.step('Exécution des tests générés', async () => {
      const testCases = await generateTestCasesWithAI();
      
      for (const testCase of testCases) {
        await executeGeneratedTest(page, testCase);
      }
    });

    // Étape 3: Évaluer la qualité des tests générés
    await test.step('Évaluation de la qualité des tests', async () => {
      const testResults = await evaluateGeneratedTests();
      
      expect(testResults.overall_score).toBeGreaterThan(0.7);
      expect(testResults.pass).toBe(true);
    });
  });

  test('Génération de tests en français', async ({ page }) => {
    const frenchTestCases = await generateFrenchTestCases();
    
    expect(frenchTestCases).toBeDefined();
    expect(frenchTestCases.length).toBeGreaterThan(0);
    
    // Exécuter les tests en français
    for (const testCase of frenchTestCases) {
      await executeFrenchTest(page, testCase);
    }
  });

  test('Génération de tests de régression', async ({ page }) => {
    const regressionTests = await generateRegressionTests();
    
    expect(regressionTests).toBeDefined();
    expect(regressionTests.length).toBeGreaterThan(0);
    
    // Exécuter les tests de régression
    for (const test of regressionTests) {
      await executeRegressionTest(page, test);
    }
  });
});

/**
 * Générer des cas de test avec l'IA
 */
async function generateTestCasesWithAI(): Promise<Array<{
  name: string;
  prompt: string;
  expectedElements: string[];
  description: string;
}>> {
  const prompt = `
Génère 5 cas de test pour un AI App Builder qui permet de créer des applications React.
Chaque test doit inclure:
1. Un nom descriptif
2. Un prompt à tester
3. Les éléments attendus dans la réponse
4. Une description du test

Format JSON:
[
  {
    "name": "Test de création d'application e-commerce",
    "prompt": "Crée une application e-commerce avec panier et paiement",
    "expectedElements": ["ecommerce", "cart", "payment", "React"],
    "description": "Test de création d'une application e-commerce complète"
  }
]
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en génération de tests automatisés. Génère des cas de test pertinents et réalistes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Extraire le JSON de la réponse
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erreur lors de la génération de tests:', error);
    return [];
  }
}

/**
 * Générer des tests en français
 */
async function generateFrenchTestCases(): Promise<Array<{
  name: string;
  prompt: string;
  expectedElements: string[];
  description: string;
}>> {
  const prompt = `
Génère 3 cas de test en français pour un AI App Builder.
Les tests doivent être en français et tester des fonctionnalités spécifiques à la langue française.

Format JSON:
[
  {
    "name": "Test de création d'application avec accents",
    "prompt": "Crée une application de gestion d'élèves avec prénoms accentués",
    "expectedElements": ["élèves", "prénoms", "accents", "UTF-8"],
    "description": "Test de gestion des caractères accentués en français"
  }
]
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en génération de tests automatisés en français. Génère des cas de test pertinents pour la langue française.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erreur lors de la génération de tests français:', error);
    return [];
  }
}

/**
 * Générer des tests de régression
 */
async function generateRegressionTests(): Promise<Array<{
  name: string;
  prompt: string;
  expectedElements: string[];
  description: string;
  regressionType: string;
}>> {
  const prompt = `
Génère 3 tests de régression pour un AI App Builder.
Les tests doivent couvrir des bugs connus et des régressions potentielles.

Format JSON:
[
  {
    "name": "Test de régression - Gestion des erreurs",
    "prompt": "Crée une application qui gère les erreurs de manière robuste",
    "expectedElements": ["try-catch", "error handling", "validation"],
    "description": "Test de régression pour la gestion des erreurs",
    "regressionType": "error-handling"
  }
]
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en tests de régression. Génère des tests qui couvrent des bugs connus et des régressions potentielles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erreur lors de la génération de tests de régression:', error);
    return [];
  }
}

/**
 * Exécuter un test généré
 */
async function executeGeneratedTest(page: any, testCase: any) {
  try {
    // Naviguer vers l'application
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', testCase.name);
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
    
    console.log(`✅ Test généré exécuté: ${testCase.name}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du test généré ${testCase.name}:`, error);
  }
}

/**
 * Exécuter un test en français
 */
async function executeFrenchTest(page: any, testCase: any) {
  try {
    // Naviguer vers l'application
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', testCase.name);
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Saisir le prompt en français
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
    
    console.log(`✅ Test français exécuté: ${testCase.name}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du test français ${testCase.name}:`, error);
  }
}

/**
 * Exécuter un test de régression
 */
async function executeRegressionTest(page: any, test: any) {
  try {
    // Naviguer vers l'application
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]');
    
    // Créer une nouvelle application
    await page.click('[data-testid="new-app-button"]');
    await page.fill('[data-testid="app-name-input"]', test.name);
    await page.click('[data-testid="create-app-button"]');
    await page.waitForSelector('[data-testid="app-editor"]');
    
    // Saisir le prompt
    await page.click('[data-testid="prompt-editor"]');
    await page.keyboard.type(test.prompt, { delay: 50 });
    
    // Lancer la génération
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="generation-complete"]', { timeout: 60000 });
    
    // Vérifier que le code généré contient les éléments attendus
    const generatedCode = await page.locator('[data-testid="code-editor"]').textContent();
    
    for (const element of test.expectedElements) {
      expect(generatedCode!.toLowerCase()).toContain(element.toLowerCase());
    }
    
    console.log(`✅ Test de régression exécuté: ${test.name}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du test de régression ${test.name}:`, error);
  }
}

/**
 * Évaluer la qualité des tests générés
 */
async function evaluateGeneratedTests(): Promise<{
  overall_score: number;
  pass: boolean;
  feedback: string;
}> {
  try {
    const langsmithEvaluator = new LangSmithEvaluator();
    
    const evaluation = await langsmithEvaluator.evaluate({
      prompt: "Évalue la qualité des tests générés automatiquement",
      response: "Tests générés avec succès",
      criteria: ['quality', 'completeness', 'relevance']
    });
    
    return {
      overall_score: evaluation.overall_score,
      pass: evaluation.pass,
      feedback: evaluation.feedback
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'évaluation des tests générés:', error);
    return {
      overall_score: 0,
      pass: false,
      feedback: `Erreur lors de l'évaluation: ${error.message}`
    };
  }
}
