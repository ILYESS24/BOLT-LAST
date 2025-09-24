#!/bin/bash

# Script de déploiement pour Netlify
echo "🚀 Déploiement de Dyad sur Netlify..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier que le build fonctionne
echo "🔨 Test du build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur: Le build a échoué. Vérifiez les erreurs ci-dessus."
    exit 1
fi

echo "✅ Build réussi!"

# Vérifier que le répertoire dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le répertoire dist n'existe pas après le build."
    exit 1
fi

echo "🎉 Prêt pour le déploiement sur Netlify!"
echo ""
echo "📋 Instructions pour déployer:"
echo "1. Connectez votre repository GitHub à Netlify"
echo "2. Configurez les variables d'environnement dans Netlify"
echo "3. Le déploiement se fera automatiquement"
echo ""
echo "🔗 Ou utilisez la CLI Netlify:"
echo "npx netlify deploy --prod --dir=dist"
