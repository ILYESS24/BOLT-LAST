#!/bin/bash

# Script de déploiement spécifique pour Render Static Site
echo "🚀 Déploiement Render Static Site pour Dyad..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur: Le build a échoué. Vérifiez les erreurs ci-dessus."
    exit 1
fi

# Vérifier que le répertoire dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le répertoire dist n'existe pas après le build."
    exit 1
fi

echo "✅ Build réussi!"

# Vérifier le contenu du répertoire dist
echo "📁 Contenu du répertoire dist:"
ls -la dist/

echo "🎉 Prêt pour le déploiement Render Static Site!"
echo ""
echo "📋 Instructions pour Render:"
echo "1. Allez sur https://render.com"
echo "2. Cliquez sur 'New +' > 'Static Site'"
echo "3. Connectez votre repository GitHub: ILYESS24/BOLT-LAST"
echo "4. Configurez:"
echo "   - Name: dyad-static"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: dist"
echo "5. Ajoutez les variables d'environnement"
echo "6. Déployez !"
