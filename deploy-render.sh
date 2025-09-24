#!/bin/bash

# Script de déploiement pour Render
echo "🚀 Déploiement de Dyad sur Render..."

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

echo "🎉 Prêt pour le déploiement sur Render!"
echo ""
echo "📋 Instructions pour déployer:"
echo "1. Allez sur https://render.com"
echo "2. Cliquez sur 'New +' > 'Web Service'"
echo "3. Connectez votre repository GitHub"
echo "4. Configurez les paramètres:"
echo "   - Name: dyad-app"
echo "   - Environment: Node"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npx serve -s dist -l 3000"
echo "   - Plan: Free (ou Starter pour plus de ressources)"
echo "5. Ajoutez les variables d'environnement"
echo "6. Cliquez sur 'Create Web Service'"
echo ""
echo "🔗 Ou utilisez la CLI Render:"
echo "npx render-cli deploy"