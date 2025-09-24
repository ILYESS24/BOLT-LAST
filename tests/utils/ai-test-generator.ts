import { Client } from "langsmith";

/**
 * Générateur de tests automatiques avec l'IA
 * Utilise LangSmith et OpenAI pour générer des cas de test supplémentaires
 */

interface TestCase {
  name: string;
  prompt: string;
  expectedElements: string[];
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

interface GeneratedTestSuite {
  testCases: TestCase[];
  metadata: {
    generatedAt: string;
    totalTests: number;
    categories: string[];
    averageComplexity: number;
  };
}

export class AITestGenerator {
  private langsmithClient: Client;
  private openaiApiKey: string;

  constructor() {
    this.langsmithClient = new Client({
      apiKey: process.env.LANGCHAIN_API_KEY,
    });
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Génère des cas de test basés sur un prompt de base
   */
  async generateTestCases(basePrompt: string, count: number = 5): Promise<TestCase[]> {
    const prompt = `
Génère ${count} cas de test pour un AI App Builder basé sur ce prompt de base: "${basePrompt}"

Chaque test doit inclure:
1. Un nom descriptif
2. Un prompt à tester (variation du prompt de base)
3. Les éléments attendus dans la réponse
4. Une description du test
5. Une catégorie (ui, functionality, performance, security, accessibility)
6. Une priorité (low, medium, high)

Format JSON:
[
  {
    "name": "Test de création d'application e-commerce",
    "prompt": "Crée une application e-commerce avec panier et paiement",
    "expectedElements": ["ecommerce", "cart", "payment", "React"],
    "description": "Test de création d'une application e-commerce complète",
    "category": "functionality",
    "priority": "high"
  }
]
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en génération de tests automatisés. Génère des cas de test pertinents, réalistes et variés.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
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
   * Génère des tests en français
   */
  async generateFrenchTestCases(basePrompt: string, count: number = 3): Promise<TestCase[]> {
    const prompt = `
Génère ${count} cas de test en français pour un AI App Builder basé sur ce prompt: "${basePrompt}"

Les tests doivent être en français et tester des fonctionnalités spécifiques à la langue française.

Format JSON:
[
  {
    "name": "Test de création d'application avec accents",
    "prompt": "Crée une application de gestion d'élèves avec prénoms accentués",
    "expectedElements": ["élèves", "prénoms", "accents", "UTF-8"],
    "description": "Test de gestion des caractères accentués en français",
    "category": "functionality",
    "priority": "medium"
  }
]
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
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
          max_tokens: 2000
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
   * Génère des tests de régression
   */
  async generateRegressionTests(count: number = 3): Promise<TestCase[]> {
    const prompt = `
Génère ${count} tests de régression pour un AI App Builder.

Les tests doivent couvrir des bugs connus et des régressions potentielles dans:
- La génération de code
- L'interface utilisateur
- Les performances
- La sécurité
- L'accessibilité

Format JSON:
[
  {
    "name": "Test de régression - Gestion des erreurs",
    "prompt": "Crée une application qui gère les erreurs de manière robuste",
    "expectedElements": ["try-catch", "error handling", "validation"],
    "description": "Test de régression pour la gestion des erreurs",
    "category": "security",
    "priority": "high"
  }
]
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
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
          max_tokens: 2000
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
   * Génère une suite de tests complète
   */
  async generateTestSuite(basePrompt: string): Promise<GeneratedTestSuite> {
    console.log('🤖 Génération d\'une suite de tests complète...');
    
    const [basicTests, frenchTests, regressionTests] = await Promise.all([
      this.generateTestCases(basePrompt, 5),
      this.generateFrenchTestCases(basePrompt, 3),
      this.generateRegressionTests(3)
    ]);

    const allTests = [...basicTests, ...frenchTests, ...regressionTests];
    
    const categories = [...new Set(allTests.map(test => test.category))];
    const averageComplexity = allTests.reduce((sum, test) => {
      const complexity = test.priority === 'high' ? 3 : test.priority === 'medium' ? 2 : 1;
      return sum + complexity;
    }, 0) / allTests.length;

    return {
      testCases: allTests,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalTests: allTests.length,
        categories,
        averageComplexity
      }
    };
  }

  /**
   * Sauvegarde les tests générés dans un fichier
   */
  async saveGeneratedTests(testSuite: GeneratedTestSuite, filename: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const outputDir = path.join(process.cwd(), 'tests', 'e2e', 'auto-generated');
    
    // Créer le dossier s'il n'existe pas
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch {
      // Le dossier existe déjà
    }
    
    const filePath = path.join(outputDir, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(testSuite, null, 2));
    
    console.log(`💾 Tests générés sauvegardés dans: ${filePath}`);
  }

  /**
   * Génère du code de test Playwright à partir des cas de test
   */
  async generatePlaywrightTestCode(testCases: TestCase[]): Promise<string> {
    const prompt = `
Génère du code de test Playwright pour ces cas de test:

${JSON.stringify(testCases, null, 2)}

Le code doit:
1. Utiliser Playwright avec TypeScript
2. Inclure des sélecteurs data-testid
3. Avoir des assertions appropriées
4. Gérer les erreurs
5. Être bien documenté

Format: Code TypeScript complet avec imports et exports.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en tests Playwright. Génère du code de test TypeScript complet et fonctionnel.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du code de test:', error);
      return '';
    }
  }

  /**
   * Évalue la qualité des tests générés
   */
  async evaluateTestQuality(testCases: TestCase[]): Promise<{
    score: number;
    feedback: string;
    improvements: string[];
  }> {
    const prompt = `
Évalue la qualité de ces cas de test:

${JSON.stringify(testCases, null, 2)}

Critères d'évaluation:
1. Pertinence des tests
2. Couverture des fonctionnalités
3. Clarté des descriptions
4. Variété des scénarios
5. Priorisation appropriée

Donne un score de 0 à 10 et des suggestions d'amélioration.

Format JSON:
{
  "score": 8.5,
  "feedback": "Les tests sont bien structurés et couvrent les fonctionnalités principales...",
  "improvements": [
    "Ajouter plus de tests de performance",
    "Inclure des tests d'accessibilité"
  ]
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en qualité de tests. Évalue objectivement la qualité des cas de test.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        score: 0,
        feedback: 'Impossible d\'évaluer les tests',
        improvements: []
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation des tests:', error);
      return {
        score: 0,
        feedback: `Erreur lors de l'évaluation: ${error.message}`,
        improvements: []
      };
    }
  }
}
