import { chromium, FullConfig } from '@playwright/test';

/**
 * Configuration globale pour les tests Playwright
 * Démarre les serveurs nécessaires avant l'exécution des tests
 */

async function globalSetup(_config: FullConfig) {
  console.log('🚀 Démarrage de la configuration globale des tests...');
  
  // Vérifier que les variables d'environnement sont configurées
  const requiredEnvVars = [
    'LANGCHAIN_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    console.warn('Certains tests peuvent ne pas fonctionner correctement.');
  }
  
  // Démarrer le serveur backend si nécessaire
  if (process.env.START_BACKEND === 'true') {
    console.log('🔧 Démarrage du serveur backend...');
    // Ici, vous pourriez démarrer votre serveur backend
    // Par exemple, avec child_process.spawn
  }
  
  // Démarrer le serveur frontend si nécessaire
  if (process.env.START_FRONTEND === 'true') {
    console.log('🔧 Démarrage du serveur frontend...');
    // Ici, vous pourriez démarrer votre serveur frontend
    // Par exemple, avec child_process.spawn
  }
  
  // Attendre que les serveurs soient prêts
  if (process.env.START_BACKEND === 'true' || process.env.START_FRONTEND === 'true') {
    console.log('⏳ Attente que les serveurs soient prêts...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Vérifier que l'application est accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { timeout: 30000 });
    console.log('✅ Application accessible');
  } catch (error) {
    console.error('❌ Application non accessible:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Configuration globale terminée');
}

export default globalSetup;