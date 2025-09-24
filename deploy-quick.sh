#!/bin/bash

# Script de déploiement rapide sur Netlify
echo "🚀 Déploiement rapide de Dyad sur Netlify..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Vérifier que Netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "📦 Installation de Netlify CLI..."
    npm install -g netlify-cli
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

# Déployer sur Netlify
echo "🚀 Déploiement sur Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "🎉 Déploiement réussi !"
    echo "🌐 Votre application est maintenant en ligne sur Netlify"
else
    echo "❌ Erreur lors du déploiement"
    echo "🔧 Vérifiez votre configuration Netlify"
fi
