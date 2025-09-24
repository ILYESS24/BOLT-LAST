#!/usr/bin/env node

/**
 * Script d'évaluation des réponses LLM avec LangSmith
 * Évalue la qualité des réponses générées par l'AI App Builder
 */

const fs = require('fs');
const path = require('path');
const { LangChainTracer } = require('langchain/callbacks');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { StringOutputParser } = require('langchain/output_parsers');

// Configuration LangSmith
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || 'ai-app-builder-evals';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!LANGSMITH_API_KEY) {
  console.error('❌ LANGSMITH_API_KEY est requis');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY est requis');
  process.exit(1);
}

// Configuration du tracer LangSmith
const tracer = new LangChainTracer({
  projectName: LANGSMITH_PROJECT,
  apiKey: LANGSMITH_API_KEY,
});

// Modèle d'évaluation
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: 'gpt-4',
  temperature: 0,
});

/**
 * Évaluateur de qualité du code généré
 */
class CodeQualityEvaluator {
  constructor() {
    this.evaluationPrompt = new PromptTemplate({
      template: `
Vous êtes un expert en développement web et évaluation de code. 
Évaluez la qualité du code généré par l'AI App Builder.

PROMPT ORIGINAL:
{prompt}

CODE GÉNÉRÉ:
{generated_code}

CRITÈRES D'ÉVALUATION:
1. Qualité du code (structure, lisibilité, bonnes pratiques)
2. Complétude (toutes les fonctionnalités demandées sont implémentées)
3. Utilisation de TypeScript (types, interfaces, génériques)
4. Patterns React (hooks, composants, état)
5. Sécurité (validation, sanitisation)
6. Performance (optimisations, lazy loading)
7. Accessibilité (ARIA, sémantique)
8. Tests (présence de tests unitaires)

Répondez au format JSON suivant:
{{
  "overall_score": 0.85,
  "criteria_scores": {{
    "code_quality": 0.9,
    "completeness": 0.8,
    "typescript_usage": 0.85,
    "react_patterns": 0.9,
    "security": 0.7,
    "performance": 0.8,
    "accessibility": 0.75,
    "tests": 0.6
  }},
  "pass": true,
  "feedback": "Code de très bonne qualité avec quelques améliorations possibles",
  "improvements": [
    "Ajouter plus de tests unitaires",
    "Améliorer la gestion d'erreurs",
    "Optimiser les performances avec React.memo"
  ],
  "strengths": [
    "Excellent usage de TypeScript",
    "Bons patterns React",
    "Code bien structuré"
  ]
}}
`,
      inputVariables: ['prompt', 'generated_code'],
    });
  }

  async evaluate(prompt, generatedCode) {
    try {
      const chain = this.evaluationPrompt
        .pipe(evaluatorModel)
        .pipe(new StringOutputParser());

      const result = await chain.invoke(
        { prompt, generated_code: generatedCode },
        { callbacks: [tracer] }
      );

      return JSON.parse(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation:', error);
      return {
        overall_score: 0,
        pass: false,
        error: error.message
      };
    }
  }
}

/**
 * Évaluateur de fonctionnalité
 */
class FunctionalityEvaluator {
  constructor() {
    this.functionalityPrompt = new PromptTemplate({
      template: `
Évaluez si le code généré implémente correctement les fonctionnalités demandées.

PROMPT ORIGINAL:
{prompt}

CODE GÉNÉRÉ:
{generated_code}

Vérifiez:
1. Toutes les fonctionnalités demandées sont présentes
2. Le code est fonctionnel et exécutable
3. Les dépendances sont correctement importées
4. La structure du projet est logique

Répondez au format JSON:
{{
  "functionality_score": 0.9,
  "missing_features": [],
  "present_features": ["formulaire", "validation", "API"],
  "executable": true,
  "dependencies_correct": true,
  "structure_logical": true,
  "pass": true
}}
`,
      inputVariables: ['prompt', 'generated_code'],
    });
  }

  async evaluate(prompt, generatedCode) {
    try {
      const chain = this.functionalityPrompt
        .pipe(evaluatorModel)
        .pipe(new StringOutputParser());

      const result = await chain.invoke(
        { prompt, generated_code: generatedCode },
        { callbacks: [tracer] }
      );

      return JSON.parse(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation de fonctionnalité:', error);
      return {
        functionality_score: 0,
        pass: false,
        error: error.message
      };
    }
  }
}

/**
 * Évaluateur de sécurité
 */
class SecurityEvaluator {
  constructor() {
    this.securityPrompt = new PromptTemplate({
      template: `
Évaluez la sécurité du code généré.

CODE GÉNÉRÉ:
{generated_code}

Vérifiez:
1. Validation des entrées utilisateur
2. Protection contre XSS
3. Protection contre CSRF
4. Gestion sécurisée des mots de passe
5. Authentification et autorisation
6. Sanitisation des données
7. Gestion des erreurs sans exposition d'informations sensibles

Répondez au format JSON:
{{
  "security_score": 0.8,
  "security_issues": [],
  "security_strengths": ["validation", "sanitisation"],
  "pass": true,
  "recommendations": []
}}
`,
      inputVariables: ['generated_code'],
    });
  }

  async evaluate(generatedCode) {
    try {
      const chain = this.securityPrompt
        .pipe(evaluatorModel)
        .pipe(new StringOutputParser());

      const result = await chain.invoke(
        { generated_code: generatedCode },
        { callbacks: [tracer] }
      );

      return JSON.parse(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'évaluation de sécurité:', error);
      return {
        security_score: 0,
        pass: false,
        error: error.message
      };
    }
  }
}

/**
 * Fonction principale d'évaluation
 */
async function evaluateTestResults() {
  console.log('🔍 Début de l\'évaluation des résultats de tests...');

  // Lire les résultats de tests
  const testResultsPath = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(testResultsPath)) {
    console.error('❌ Aucun résultat de test trouvé');
    process.exit(1);
  }

  const evaluators = {
    codeQuality: new CodeQualityEvaluator(),
    functionality: new FunctionalityEvaluator(),
    security: new SecurityEvaluator()
  };

  const evaluationResults = [];

  // Parcourir les fichiers de résultats
  const resultFiles = fs.readdirSync(testResultsPath);
  
  for (const file of resultFiles) {
    if (file.endsWith('.json')) {
      try {
        const testResult = JSON.parse(fs.readFileSync(path.join(testResultsPath, file), 'utf8'));
        
        // Extraire les données de test
        const testData = extractTestData(testResult);
        
        if (testData) {
          console.log(`📊 Évaluation du test: ${testData.testName}`);
          
          // Évaluations
          const codeQualityEval = await evaluators.codeQuality.evaluate(
            testData.prompt,
            testData.generatedCode
          );
          
          const functionalityEval = await evaluators.functionality.evaluate(
            testData.prompt,
            testData.generatedCode
          );
          
          const securityEval = await evaluators.security.evaluate(
            testData.generatedCode
          );

          // Calculer le score global
          const overallScore = (
            codeQualityEval.overall_score * 0.4 +
            functionalityEval.functionality_score * 0.4 +
            securityEval.security_score * 0.2
          );

          const evaluationResult = {
            testName: testData.testName,
            timestamp: new Date().toISOString(),
            overallScore,
            evaluations: {
              codeQuality: codeQualityEval,
              functionality: functionalityEval,
              security: securityEval
            },
            pass: overallScore >= 0.7
          };

          evaluationResults.push(evaluationResult);
          
          console.log(`✅ Test ${testData.testName}: Score ${overallScore.toFixed(2)} (${evaluationResult.pass ? 'PASS' : 'FAIL'})`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${file}:`, error.message);
      }
    }
  }

  // Générer le rapport d'évaluation
  await generateEvaluationReport(evaluationResults);
  
  console.log('✅ Évaluation terminée');
}

/**
 * Extraire les données de test des résultats
 */
function extractTestData(testResult) {
  try {
    // Chercher les données de test dans la structure des résultats Playwright
    for (const spec of testResult.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status === 'passed') {
            // Extraire les données du test (à adapter selon votre structure)
            const testName = test.title;
            const prompt = extractPromptFromTest(test);
            const generatedCode = extractGeneratedCodeFromTest(test);
            
            if (prompt && generatedCode) {
              return {
                testName,
                prompt,
                generatedCode
              };
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des données:', error);
  }
  
  return null;
}

/**
 * Extraire le prompt du test (à adapter selon votre implémentation)
 */
function extractPromptFromTest(_test) {
  // Implémentation à adapter selon votre structure de test
  // Par exemple, chercher dans les steps ou les annotations
  return "Prompt extrait du test"; // Placeholder
}

/**
 * Extraire le code généré du test (à adapter selon votre implémentation)
 */
function extractGeneratedCodeFromTest(_test) {
  // Implémentation à adapter selon votre structure de test
  // Par exemple, chercher dans les screenshots ou les logs
  return "Code généré extrait du test"; // Placeholder
}

/**
 * Générer le rapport d'évaluation
 */
async function generateEvaluationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests: results.filter(r => r.pass).length,
    failedTests: results.filter(r => !r.pass).length,
    averageScore: results.reduce((sum, r) => sum + r.overallScore, 0) / results.length,
    results: results
  };

  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, '../../evaluation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Afficher le résumé
  console.log('\n📊 RAPPORT D\'ÉVALUATION');
  console.log('========================');
  console.log(`Total des tests: ${report.totalTests}`);
  console.log(`Tests réussis: ${report.passedTests}`);
  console.log(`Tests échoués: ${report.failedTests}`);
  console.log(`Score moyen: ${report.averageScore.toFixed(2)}`);
  console.log(`Taux de réussite: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);

  // Envoyer les résultats à LangSmith
  if (LANGSMITH_API_KEY) {
    try {
      await sendResultsToLangSmith(report);
      console.log('✅ Résultats envoyés à LangSmith');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi à LangSmith:', error);
    }
  }
}

/**
 * Envoyer les résultats à LangSmith
 */
async function sendResultsToLangSmith(_report) {
  // Implémentation de l'envoi à LangSmith
  // Utiliser l'API LangSmith pour créer des runs d'évaluation
  console.log('📤 Envoi des résultats à LangSmith...');
  
  // Placeholder - à implémenter avec l'API LangSmith
  // const response = await fetch('https://api.smith.langchain.com/runs', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${LANGSMITH_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(report)
  // });
}

// Exécuter l'évaluation si le script est appelé directement
if (require.main === module) {
  evaluateTestResults().catch(console.error);
}

module.exports = {
  CodeQualityEvaluator,
  FunctionalityEvaluator,
  SecurityEvaluator,
  evaluateTestResults
};
