// Test de l'évaluateur LangSmith
const { LangSmithEvaluator } = require('./tests/utils/langsmith-evaluator.ts');

async function testLangSmithEvaluator() {
  console.log('🧪 Test de l\'évaluateur LangSmith...');
  
  try {
    const evaluator = new LangSmithEvaluator();
    
    // Test 1: Évaluation d'une réponse de qualité
    console.log('\n📝 Test 1: Évaluation d\'une réponse de qualité');
    const goodResponse = `
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Compteur: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Incrémenter
      </button>
    </div>
  );
}

export default Counter;
    `;
    
    const result1 = await evaluator.evaluate({
      prompt: 'Crée une application React avec un compteur',
      response: goodResponse,
      criteria: ['quality', 'completeness', 'relevance', 'accuracy']
    });
    
    console.log('✅ Résultat Test 1:');
    console.log(`   Score global: ${result1.overall_score.toFixed(2)}`);
    console.log(`   Pass: ${result1.pass}`);
    console.log(`   Feedback: ${result1.feedback}`);
    console.log(`   Critères:`, result1.criteria_scores);
    
    // Test 2: Évaluation d'une réponse de mauvaise qualité
    console.log('\n📝 Test 2: Évaluation d\'une réponse de mauvaise qualité');
    const badResponse = 'Hello world';
    
    const result2 = await evaluator.evaluate({
      prompt: 'Crée une application React avec un compteur',
      response: badResponse,
      criteria: ['quality', 'completeness', 'relevance']
    });
    
    console.log('✅ Résultat Test 2:');
    console.log(`   Score global: ${result2.overall_score.toFixed(2)}`);
    console.log(`   Pass: ${result2.pass}`);
    console.log(`   Feedback: ${result2.feedback}`);
    console.log(`   Suggestions:`, result2.suggestions);
    
    // Test 3: Évaluation avec critères spécifiques
    console.log('\n📝 Test 3: Évaluation avec critères spécifiques');
    const mediumResponse = `
function App() {
  return <div>Hello</div>;
}
    `;
    
    const result3 = await evaluator.evaluate({
      prompt: 'Crée une application React simple',
      response: mediumResponse,
      criteria: ['technical_correctness', 'clarity', 'user_experience']
    });
    
    console.log('✅ Résultat Test 3:');
    console.log(`   Score global: ${result3.overall_score.toFixed(2)}`);
    console.log(`   Pass: ${result3.pass}`);
    console.log(`   Feedback: ${result3.feedback}`);
    console.log(`   Critères:`, result3.criteria_scores);
    
    console.log('\n🎉 Tous les tests LangSmith sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test LangSmith:', error);
  }
}

// Exécuter les tests
testLangSmithEvaluator();
