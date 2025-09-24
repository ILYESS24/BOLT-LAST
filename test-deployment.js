#!/usr/bin/env node

// Script de test pour vérifier que l'application est prête pour Render
const fs = require('fs');
const path = require('path');

console.log('🧪 Test de déploiement Render pour Dyad...\n');

// Vérifications
const checks = [
  {
    name: 'Fichier render.yaml',
    path: 'render.yaml',
    required: true
  },
  {
    name: 'Configuration Vite',
    path: 'vite.config.ts',
    required: true
  },
  {
    name: 'Point d\'entrée HTML',
    path: 'index.html',
    required: true
  },
  {
    name: 'Point d\'entrée React',
    path: 'src/main.tsx',
    required: true
  },
  {
    name: 'Styles CSS',
    path: 'src/index.css',
    required: true
  },
  {
    name: 'Configuration Tailwind',
    path: 'tailwind.config.js',
    required: true
  },
  {
    name: 'Script de build',
    path: 'package.json',
    required: true,
    check: (content) => content.includes('"build": "vite build"')
  },
  {
    name: 'Répertoire de build',
    path: 'dist',
    required: true,
    isDirectory: true
  }
];

let allPassed = true;

checks.forEach(check => {
  const fullPath = path.resolve(check.path);
  const exists = check.isDirectory ? 
    fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() :
    fs.existsSync(fullPath);

  if (exists) {
    if (check.check) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (check.check(content)) {
        console.log(`✅ ${check.name} - OK`);
      } else {
        console.log(`❌ ${check.name} - Échec de la vérification`);
        allPassed = false;
      }
    } else {
      console.log(`✅ ${check.name} - OK`);
    }
  } else {
    if (check.required) {
      console.log(`❌ ${check.name} - MANQUANT`);
      allPassed = false;
    } else {
      console.log(`⚠️  ${check.name} - Optionnel`);
    }
  }
});

console.log('\n📋 Résumé des vérifications:');

if (allPassed) {
  console.log('🎉 Toutes les vérifications sont passées !');
  console.log('✅ Votre application est prête pour le déploiement sur Render');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. Connectez votre repository GitHub à Render');
  console.log('2. Configurez les variables d\'environnement');
  console.log('3. Déployez !');
} else {
  console.log('❌ Certaines vérifications ont échoué');
  console.log('🔧 Veuillez corriger les erreurs avant de déployer');
}

console.log('\n📖 Consultez RENDER-DEPLOY.md pour plus d\'informations');
